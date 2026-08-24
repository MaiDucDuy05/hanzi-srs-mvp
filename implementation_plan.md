# Kế hoạch Kiến trúc Luồng Xác thực (Authentication Flow)

Dựa trên yêu cầu của bạn về việc:
1. **Tự động log out khi token hết hạn**.
2. **Client không thể set token mà chỉ get ra (đọc thông tin)**.
3. Luồng hiện tại đang được triển khai nhưng chưa hoạt động đúng kỳ vọng.

## Phân tích hiện trạng & Giải pháp

Dự án đang dùng cơ chế **HttpOnly Cookie**. Đây là cơ chế bảo mật cao nhất hiện tại (chống XSS) vì trình duyệt sẽ tự động quản lý và gửi token ngầm, mã JavaScript của Client (kể cả Hacker) **không thể đọc (get) hay ghi (set) chuỗi token thật**.
Tuy nhiên, vì Client không đọc được token nên nó không biết khi nào token hết hạn để tự động đăng xuất lúc user đang treo máy (idle). Ngoài ra, trên Next.js App Router, việc chuyển trang bằng thẻ `<Link>` đôi khi không đi qua middleware nên nếu user hết hạn token mà không tải lại trang, họ vẫn ở lại giao diện cũ cho đến khi gọi một API bất kỳ.

**Giải pháp:**
Giữ nguyên cơ chế HttpOnly Cookie để đảm bảo bảo mật tuyệt đối. Backend sẽ chủ động trả thêm thông tin về **thời gian hết hạn (`exp`)** qua JSON payload cho Frontend. Frontend sẽ đọc `exp` này để thiết lập một đồng hồ đếm ngược (Timer) và tự động "đá" user ra ngoài khi hết giờ.

---

## Proposed Changes

### 1. Backend (Cung cấp Metadata của Token)

Client không cần biết nguyên văn chuỗi JWT Token, Client chỉ cần biết "Ai đang đăng nhập" và "Khi nào thì hết hạn".

#### [MODIFY] `backend/src/modules/auth/auth.controller.ts`
Chỉnh sửa các endpoint trả về thông tin user bao gồm cả `exp` (timestamp hết hạn của token).
- Cập nhật hàm `login`, `register`: Sau khi sinh JWT, tính toán hoặc lấy `exp` ra và đính kèm vào response.
```typescript
return {
  data: { 
    user: this.authService.sanitizeUser(user), 
    exp: jwtPayload.exp // Trả về thời gian hết hạn
  },
  ...
};
```
- Cập nhật hàm `me`: Tương tự, lấy `exp` từ `@CurrentUser()` và trả về cùng thông tin user.

#### [MODIFY] `backend/src/modules/auth/auth.service.ts`
Chỉnh sửa hàm `login` và `register` trả về thêm thông tin `exp` cùng với `accessToken` và `user`.

### 2. Frontend (Quản lý Phiên & Tự động Đăng xuất)

Cập nhật Context quản lý trạng thái đăng nhập để theo dõi thời gian `exp`.

#### [MODIFY] `frontend/src/lib/api/types.ts`
Cập nhật interface `AuthResponse` hoặc định nghĩa thêm trường `exp` đi kèm với `user` trong data response.

#### [MODIFY] `frontend/src/lib/auth/auth-context.tsx`
- Bổ sung logic **Timer (đồng hồ đếm ngược)**.
- Khi gọi thành công `login`, `register`, hoặc lấy `me` lúc mở app:
  - Đọc biến `exp` từ response.
  - Tính toán thời gian còn lại: `timeout = (exp * 1000) - Date.now()`.
  - Nếu `timeout <= 0`: Gọi ngay hàm `logout()`.
  - Nếu `timeout > 0`: Cài đặt `setTimeout(logout, timeout)`. Nhớ `clearTimeout` nếu user đăng nhập tài khoản khác hoặc token được làm mới.
- Xử lý sự kiện `hanzi:unauthorized` (được bắn ra từ `apiFetch` khi backend báo 401): Force logout và đẩy về trang `/login` ngay lập tức.

#### [MODIFY] `frontend/src/proxy.ts` (Middleware)
Logic hiện tại của middleware (đọc và phân giải base64 của cookie token) là chính xác để bảo vệ các route ở chế độ SSR (Server-Side Rendering). Vẫn giữ nguyên, nhưng sẽ tối ưu lại logic clear cookie nếu token hết hạn (hiện tại middleware Next.js có thể force xoá cookie trước khi redirect).

---

## Verification Plan

1. **Test Auto-logout:**
   - Chỉnh sửa tạm thời trong backend để token chỉ sống được **30 giây** (`expiresIn: '30s'`).
   - Đăng nhập vào hệ thống.
   - Để nguyên trình duyệt không thao tác. Chờ 30 giây xem hệ thống có tự động đá về màn hình Đăng nhập hay không.
2. **Test Security:**
   - Mở Console Browser, gõ `document.cookie`. Xác nhận không thể nhìn thấy biến `access_token` (đảm bảo tính năng chặn set/get token của client).
3. **Test API Guard:**
   - Gọi một API bất kỳ sau khi token vừa hết hạn. `api-client.ts` sẽ nhận mã 401, sau đó `AuthContext` lắng nghe event và ngay lập tức xoá phiên, đẩy về `/login`.
