# Module: Công cụ Giáo viên (Teacher Tools)

## 1. Tổng quan Module
Module dành riêng cho người dùng có role `Teacher`, hỗ trợ quản lý học sinh, tổ chức lớp học, soạn đề và giao bài.

## 2. Chi tiết Nghiệp vụ & Tiêu chí nghiệm thu

### **FR-20: Quản lý lớp và học sinh**
**Tiêu chí nghiệm thu (AC):**
* **Tạo lớp:** Giáo viên tạo lớp (Tên lớp, Mô tả), hệ thống tự sinh ra một Class Code duy nhất (6 ký tự alphanumeric).
* **Tham gia:** Học viên nhập Class Code, trạng thái vào lớp là "Pending". Giáo viên nhấn "Approve" thì học viên mới xem được nội dung lớp.
* Giáo viên có quyền Remove học sinh.

### **FR-06: Quản lý ngân hàng câu hỏi**
**Nghiệp vụ chi tiết:**
* Giáo viên có quyền tạo câu hỏi, nhưng mặc định mang trạng thái `Private` (chỉ mình giáo viên đó thấy).
* Có thể gắn tag (Độ khó, Bài học).

### **FR-05 & FR-07: Tạo và Giao bài kiểm tra / Bài học**
**Nghiệp vụ chi tiết:**
* **Tạo đề:** Kéo thả câu hỏi từ ngân hàng (Public chung của hệ thống + Private của giáo viên).
* **Giao bài:** Chọn đối tượng nhận (Cả lớp hoặc một số học sinh cụ thể).
* Cấu hình bài: 
  * `start_time` & `end_time` (Hạn chót).
  * Giới hạn thời gian làm bài (Ví dụ: 45 phút).
  * Cấu hình có cho phép xem điểm ngay sau khi nộp hay không.

### **FR-23: Theo dõi tiến trình học sinh**
**Tiêu chí nghiệm thu (AC):**
* Leaderboard của lớp: Danh sách học sinh theo điểm số trung bình.
* Báo cáo "Báo động": Danh sách học sinh chưa nộp bài, hoặc có điểm dưới trung bình liên tiếp 2 lần.
* Phân tích câu hỏi: Giao diện highlight các câu hỏi có tỷ lệ làm sai > 50% trong lớp.
