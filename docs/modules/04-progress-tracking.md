# Module: Tiến trình học tập (Progress Tracking)

## 1. Tổng quan Module
Theo dõi, ghi nhận và phân tích dữ liệu học tập của user để đánh giá mức độ tiếp thu kiến thức.

## 2. Chi tiết Nghiệp vụ & Tiêu chí nghiệm thu

### **FR-17: Sổ lỗi sai (Mistake Book)**
**Mục đích:** Quản lý các điểm kiến thức chưa vững.

**Nghiệp vụ chi tiết:**
* Logic thêm vào sổ: Mọi câu hỏi (trắc nghiệm, điền từ, sắp xếp) nếu trả lời sai ở lần submit cuối cùng (trong chế độ Exam) hoặc trả lời sai ngay (chế độ Practice) đều tự động thêm vào sổ.
* Logic loại khỏi sổ: Học viên vào mục "Ôn tập sổ lỗi", nếu trả lời đúng câu đó 2 lần liên tiếp -> Xóa khỏi sổ.

**Tiêu chí nghiệm thu (AC):**
* Giao diện sổ lỗi sai có filter theo: Cấp HSK, Loại kỹ năng (Nghe, Đọc, Ngữ pháp).
* Câu hỏi trong sổ hiển thị kèm theo giải thích (nếu có) và ngày làm sai gần nhất.

---

### **FR-18: Thống kê mức độ thành thạo**
**Mục đích:** Động lực học tập (Gamification/Stats).

**Tiêu chí nghiệm thu (AC):**
* Hiển thị tỷ lệ hoàn thành (Ví dụ: Đã học 45/100 từ vựng HSK 1 = 45%).
* Biểu đồ Radar (Nghe, Nói, Đọc, Viết) được tính dựa trên điểm số trung bình của các dạng bài tập tương ứng. Dữ liệu biểu đồ lấy từ 30 ngày gần nhất.

---

### **FR-19: Kiểm tra từ vựng đầu bài**
**Nghiệp vụ chi tiết:**
* Mini-quiz (3-5 câu) trước khi mở khóa bài học mới, nhằm ôn lại kiến thức bài trước.
* Nếu trượt mini-quiz, hệ thống cảnh báo nhưng vẫn cho phép đi tiếp (không block hoàn toàn tiến trình cứng).
