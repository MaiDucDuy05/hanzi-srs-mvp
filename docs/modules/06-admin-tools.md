# Module: Quản trị hệ thống (Admin Tools)

## 1. Tổng quan Module
Công cụ nội bộ (CMS) dành cho role `Admin` để vận hành nền tảng, quản lý user, doanh thu, và duyệt nội dung.

## 2. Chi tiết Nghiệp vụ & Tiêu chí nghiệm thu

### **FR-27: Quản lý người dùng và phân quyền**
**Tiêu chí nghiệm thu (AC):**
* Bảng danh sách user có các bộ lọc (Filter): Theo Role, Trạng thái (Active/Banned), Ngày đăng ký.
* Admin có quyền thay đổi Role của user (ví dụ: cấp quyền Teacher cho một account).
* Chức năng Ban/Unban tài khoản: Tài khoản bị Ban khi đăng nhập sẽ nhận được thông báo lỗi cụ thể.

### **FR-28 & FR-29: Quản lý nội dung hệ thống & Giáo viên**
**Nghiệp vụ chi tiết:**
* Content của hệ thống (Course, Lesson, Question) do Admin toàn quyền Create/Update/Delete.
* Content của Giáo viên (Private questions, Lớp học): Admin không được tự ý sửa (Edit) để đảm bảo tính chuyên môn, nhưng có quyền Ẩn/Xóa (Hide/Delete) nếu vi phạm quy chuẩn cộng đồng.

### **FR-30: Quản lý yêu cầu VIP**
**Nghiệp vụ chi tiết:**
* Là quy trình thủ công (Manual Checkout).
* Màn hình quản lý hiển thị các Request nâng cấp VIP (Status: Pending, Approved, Rejected).
* Khi Admin check biến động số dư ngân hàng thấy tiền vào -> Chọn "Approve". 
* Hệ thống ghi nhận `vip_valid_until` = ngày hiện tại + thời hạn gói (30 ngày, 365 ngày...).

### **FR-31: Cấu hình hệ thống (Settings)**
**Tiêu chí nghiệm thu (AC):**
* Form cấu hình Global Variables.
* Có thể thay đổi "Số lượt miễn phí" (Ví dụ: 3 lượt) mà không cần deploy lại code.
* Bật/tắt các Feature Toggle (Ví dụ: Tắt tính năng AI nếu OpenAI hết credit).

### **FR-32: Dashboard quản trị**
**Tiêu chí nghiệm thu (AC):**
* Biểu đồ doanh thu VIP, số lượng user đăng ký mới theo thời gian (Daily, Monthly).
* Hiển thị số lượt gọi API AI trong ngày để cảnh báo chi phí.
