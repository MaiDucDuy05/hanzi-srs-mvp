# Module: Kiểm tra & Luyện tập (Test Engine)

## 1. Tổng quan Module
Module này là cốt lõi của nền tảng, chứa hệ thống logic các bài tập tương tác, mini-game và cấu hình giới hạn quyền lợi dựa trên gói tài khoản.

## 2. Chi tiết Nghiệp vụ & Tiêu chí nghiệm thu

### **FR-03: Nối từ Trung--Pinyin--Việt**
**Mục đích:** Rèn luyện khả năng nhận diện mặt chữ, pinyin và nghĩa.
**Nghiệp vụ chi tiết:**
* Hệ thống random xáo trộn vị trí các thẻ ở 3 cột để chống học vẹt.
* Nối đúng: Đường kẻ màu xanh, phát audio của từ.
* Nối sai: Đường kẻ màu đỏ, báo rung nhẹ (hiệu ứng CSS), xóa đường kẻ sau 1s để làm lại.
* Tính điểm: (Chế độ thi) Không được làm lại, nối sai trừ điểm. (Chế độ luyện) Làm lại không bị trừ, chỉ tính thời gian hoàn thành.

---

### **FR-04: Flashcard & Thuật toán SRS**
**Mục đích:** Ghi nhớ từ vựng qua lặp lại ngắt quãng (Spaced Repetition System).
**Tiêu chí nghiệm thu (AC):**
* Mặt trước (Chữ Hán) và Mặt sau (Nghĩa, Pinyin, Audio, Ví dụ).
* 2 nút phản hồi: `Cần ôn lại (Hard)` và `Đã thuộc (Easy)`.
* `Cần ôn lại`: Thẻ bị đẩy về cuối hàng đợi của session hiện tại.
* `Đã thuộc`: Thẻ được tính là đã học xong, lưu vào database lịch sử để ngày mai không lặp lại.

---

### **FR-08: Luyện thi nói HSKK (Thu âm)**
**Nghiệp vụ chi tiết:**
* Cần mô phỏng áp lực phòng thi: có thời gian chuẩn bị (countdown), thời gian nói giới hạn.
**Tiêu chí nghiệm thu (AC):**
* Yêu cầu quyền mic trình duyệt. Trạng thái visualizer phải chớp theo giọng nói.
* Cho phép nghe lại audio (Local blob) trước khi nộp.
* Audio upload lên S3 (`.mp3`/`.wav`), trả về URL lưu DB kèm ID bài kiểm tra.

---

### **FR-09 & FR-10: Điền chỗ trống & Sắp xếp câu**
**Tiêu chí nghiệm thu (AC):**
* Drag & Drop UI (Kéo thả). Hỗ trợ chạm kéo trên thiết bị di động.
* Cung cấp các từ nhiễu (distractors) để tăng độ khó.
* Trả kết quả Real-time (nếu là bài tập luyện tập) hoặc Submit-all (nếu là bài thi).

---

### **FR-11 & FR-12: Gamification (Bắn bóng & Memory)**
**Tiêu chí nghiệm thu (AC):**
* **Bắn bóng:** Bóng rơi từ trên xuống chứa chữ Hán. Gõ đúng Pinyin (không dấu) -> bóng nổ. Có hệ thống tăng tốc (Level up) và tính High Score.
* **Memory:** Lật thẻ tìm cặp tương ứng. Giới hạn thời gian (Timer) và đếm số bước (Moves).

---

### **FR-13: Luyện viết chữ Hán**
**Tiêu chí nghiệm thu (AC):**
* Render thư viện `hanzi-writer`.
* Chế độ Quiz: Người dùng vẽ sai thứ tự nét => chớp đỏ.
* Viết sai nét đó quá 3 lần => bật hint chỉ nét tiếp theo.

---

### **FR-14: Giới hạn lượt theo gói (Paywall)**
**Nghiệp vụ chi tiết:**
* Free: 3 lượt chơi/làm bài cho MỖI BÀI HỌC mỗi ngày. VIP: Không giới hạn.
**Tiêu chí nghiệm thu (AC):**
* Khi đạt mốc 3 lượt, block truy cập vào component Game/Quiz, hiện popup "Nâng cấp VIP".
* Reset số lượt vào 00:00 AM hàng ngày theo timezone của server (hoặc user).
