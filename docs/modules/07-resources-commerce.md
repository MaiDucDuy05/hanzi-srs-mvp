# Module: Tài liệu & Thương mại (Resources & Commerce)

## 1. Tổng quan Module
Hỗ trợ lưu trữ tài liệu tham khảo (Slide, Đề thi PDF) và luồng thanh toán mua gói VIP thủ công (Chuyển khoản).

## 2. Chi tiết Nghiệp vụ & Tiêu chí nghiệm thu

### **FR-24: Thư viện tài liệu (PPT/PDF)**
**Nghiệp vụ chi tiết:**
* Là kho tài nguyên bổ trợ ngoài lộ trình học chính. Admin hoặc Teacher có thể tải tài liệu lên.
* Phân loại tài liệu thành 2 nhãn: `Free` và `VIP`.

**Tiêu chí nghiệm thu (AC):**
* Định dạng cho phép: `.pdf`, `.ppt`, `.pptx`. Dung lượng max `50MB`.
* Tài liệu `Free`: Ai cũng tải được.
* Tài liệu `VIP`: Nút Download bị khóa với Free User, click vào sẽ popup bảng giá VIP.
* Tính năng bảo mật (Chống chia sẻ link): Khi VIP user click tải, backend trả về một URL tải xuống tạm thời từ AWS S3 (Presigned URL) có hạn sử dụng 15 phút.

### **FR-26: Đăng ký nâng cấp VIP**
**Nghiệp vụ chi tiết:**
* Thanh toán thủ công qua chuyển khoản ngân hàng (VietQR).
* Thông tin chuyển khoản phải chứa `User_ID` hoặc Số điện thoại để dễ đối soát.

**Tiêu chí nghiệm thu (AC):**
* Giao diện Pricing hiển thị các gói (1 tháng, 6 tháng, 1 năm).
* Khi user chọn gói và xác nhận, render mã VietQR (có sẵn số tiền và nội dung CK).
* User nhấn "Tôi đã thanh toán", trạng thái đổi thành `Pending_VIP` -> Chờ Admin duyệt.
* Có email tự động thông báo kết quả duyệt (qua Brevo/SendGrid).

### **FR-25: Liên hệ tư vấn học**
**Tiêu chí nghiệm thu (AC):**
* Form nhập: Họ tên, Số điện thoại, Email, Nhu cầu (Mua tài liệu, Đăng ký học online).
* Submit form lưu vào database bảng `leads`.
* Trạng thái mặc định là "Chưa xử lý". Có thể chuyển thành "Đã liên hệ" bởi Admin.
