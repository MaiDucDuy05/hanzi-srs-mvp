# Chi tiết Tiêu chí nghiệm thu (Acceptance Criteria) cho các FR

Dưới đây là chi tiết nghiệp vụ (Business Rules) và Tiêu chí nghiệm thu (AC) dành cho các chức năng còn thiếu trong BRD, được phân tích dưới góc độ Business Analyst (BA).

---

## 1. Module: Kiểm tra & Luyện tập (Test Engine)

### **FR-03: Nối từ Trung--Pinyin--Việt**
**Nghiệp vụ:**
Bài tập yêu cầu người dùng kết nối 3 cột: Chữ Hán, Pinyin và Nghĩa Tiếng Việt.
**Tiêu chí nghiệm thu (AC):**
* Hệ thống hiển thị ngẫu nhiên vị trí các thẻ ở mỗi cột để tránh việc học vẹt vị trí.
* Người dùng có thể click lần lượt hoặc kéo thả để tạo đường nối giữa 2 hoặc 3 cột.
* **Luồng đúng:** Nối đúng sẽ phát âm thanh từ đó (audio), đổi màu xanh và khóa các thẻ lại.
* **Luồng sai:** Nối sai sẽ đổi màu đỏ trong 1 giây, sau đó hủy đường nối để người dùng làm lại.
* Nếu là bài thi, chỉ tính điểm cho các câu nối đúng trong lần thử đầu tiên.

### **FR-04: Flashcard**
**Nghiệp vụ:**
Hỗ trợ ôn tập thẻ từ vựng với tính năng lật thẻ, kết hợp thuật toán lặp lại ngắt quãng (SRS) cơ bản.
**Tiêu chí nghiệm thu (AC):**
* **Mặt trước:** Hiển thị Chữ Hán (có thể bật/tắt Pinyin).
* **Mặt sau:** Pinyin, Nghĩa Tiếng Việt, Ví dụ câu và nút phát Audio.
* Cung cấp 2 nút phản hồi sau khi lật: **"Cần ôn lại" (Quên)** và **"Đã thuộc" (Nhớ)**.
* Thẻ chọn "Cần ôn lại" sẽ xuất hiện lại ở cuối xấp thẻ hiện tại để học lại. Thẻ "Đã thuộc" sẽ được đưa vào danh sách ôn tập ngày hôm sau.

### **FR-08: Luyện thi nói HSKK**
**Nghiệp vụ:**
Mô phỏng phần thi nói, yêu cầu thu âm và lưu trữ để giáo viên chấm.
**Tiêu chí nghiệm thu (AC):**
* Hệ thống yêu cầu cấp quyền Microphone từ trình duyệt. Nếu từ chối, hiển thị popup hướng dẫn bật quyền.
* Bắt đầu đếm ngược thời gian chuẩn bị và thời gian thu âm (theo form thi HSKK thật, VD: 1.5 - 2 phút).
* Có thanh hiển thị cường độ âm thanh (visualizer) để học viên biết mic đang hoạt động.
* Sau khi thu âm, cho phép nghe lại. Nếu chưa hài lòng, có thể thu lại (trừ khi đang trong chế độ thi thật).
* Submit thành công sẽ upload file dạng `.mp3` hoặc `.wav` lên AWS S3 và trả về `file_url` lưu vào database.

### **FR-09 & FR-10: Điền chỗ trống & Sắp xếp câu**
**Tiêu chí nghiệm thu (AC):**
* **Điền chỗ trống:** Hiển thị câu khuyết từ và danh sách các từ gợi ý (có từ gây nhiễu). Học viên kéo thả (drag & drop) từ vào ô trống.
* **Sắp xếp câu:** Hiển thị các khối từ bị xáo trộn. Học viên kéo thả để xếp lại thành câu hoàn chỉnh đúng ngữ pháp.
* **Chấm điểm:** Trong chế độ luyện tập, hiển thị đúng/sai ngay lập tức. Trong chế độ kiểm tra, chỉ hiển thị sau khi nộp bài.

### **FR-11: Game bắn bóng luyện Pinyin**
**Nghiệp vụ:**
Trò chơi rèn luyện phản xạ gõ pinyin nhanh.
**Tiêu chí nghiệm thu (AC):**
* Bóng chứa Chữ Hán rơi từ trên màn hình xuống.
* Học viên gõ đúng Pinyin (không cần dấu thanh điệu) và nhấn Enter/Space thì bóng sẽ vỡ.
* Tốc độ rơi và số lượng bóng tăng dần theo các cấp (Level).
* Kết thúc game khi có 3 quả bóng chạm đáy màn hình. Ghi nhận điểm số cao nhất (High score).

### **FR-12: Game Memory lật thẻ**
**Tiêu chí nghiệm thu (AC):**
* Bắt đầu game với các thẻ úp. Học viên lật 2 thẻ mỗi lượt (Chữ Hán ghép với Pinyin hoặc Nghĩa).
* Nếu giống nhau: Thẻ biến mất hoặc giữ trạng thái ngửa. Nếu khác: Tự động úp lại sau 1 giây.
* Hệ thống đếm thời gian hoàn thành (Timer) và số lượt lật (Moves).

### **FR-13: Luyện viết chữ Hán**
**Tiêu chí nghiệm thu (AC):**
* Tích hợp thư viện Hanzi Writer, hiển thị khung kẻ ô chữ điền.
* Có 2 chế độ: **Quiz (Tự viết)** và **Outline (Vẽ theo nét mờ)**.
* Trong chế độ Quiz, học viên viết sai thứ tự nét hệ thống sẽ báo lỗi (chớp đỏ).
* Sai quá 3 lần ở cùng 1 nét, hệ thống tự động hiện gợi ý (hint) cho nét đó.

---

## 2. Module: Tiến trình học tập (Progress Tracking)

### **FR-17: Sổ lỗi sai**
**Nghiệp vụ:**
Nơi tổng hợp các câu hỏi học sinh làm sai để ôn tập lại.
**Tiêu chí nghiệm thu (AC):**
* Mỗi khi học viên làm sai một câu trong Quiz/Bài tập, câu hỏi đó tự động được đưa vào Sổ lỗi sai, kèm ngày sai gần nhất.
* Cung cấp chế độ "Ôn tập Sổ lỗi sai": Hệ thống tạo 1 bài test ngẫu nhiên từ các câu trong sổ.
* Nếu học viên trả lời đúng câu hỏi trong "Ôn tập" 2 lần liên tiếp, câu hỏi đó sẽ bị xóa khỏi Sổ lỗi sai.

### **FR-18: Thống kê mức độ thành thạo**
**Tiêu chí nghiệm thu (AC):**
* Hiển thị % tiến độ học tập dựa trên số bài học đã hoàn thành / tổng số bài học của cấp HSK hiện tại.
* Có biểu đồ radar đánh giá các kỹ năng: Từ vựng, Ngữ pháp, Nghe hiểu, Đọc hiểu.
* Dữ liệu biểu đồ được tính từ lịch sử làm bài kiểm tra và bài tập trong 30 ngày gần nhất.

---

## 3. Module: Công cụ giáo viên (Teacher Tools)

### **FR-05 & FR-06: Tạo bài kiểm tra & Ngân hàng câu hỏi**
**Tiêu chí nghiệm thu (AC):**
* Giáo viên có quyền tạo câu hỏi riêng (Private). Câu hỏi này không hiển thị trên kho dùng chung.
* Giao diện tạo bài kiểm tra cho phép **Mix (trộn)** giữa câu hỏi Public (của hệ thống) và Private (của giáo viên).
* Hỗ trợ gán Tag (nhãn) độ khó, chủ đề cho câu hỏi để dễ dàng tìm kiếm.
* Cấu hình bài kiểm tra: Thời gian làm bài (Countdown timer), ngày giờ mở/đóng bài, có cho phép xem đáp án sau khi nộp hay không.

### **FR-20: Quản lý lớp và học sinh**
**Tiêu chí nghiệm thu (AC):**
* Giáo viên tạo lớp sẽ sinh ra một **Mã lớp (Class Code)** duy nhất gồm 6-8 ký tự.
* Học viên nhập Mã lớp để xin tham gia (Pending). Giáo viên duyệt (Approve) thì mới chính thức vào lớp.
* Giáo viên có quyền Xóa (Remove) học viên khỏi lớp.
* Không giới hạn số lượng lớp của 1 giáo viên, nhưng giới hạn số học sinh/lớp (VD: max 50 học sinh/lớp ở bản v1).

### **FR-23: Theo dõi tiến trình học sinh**
**Tiêu chí nghiệm thu (AC):**
* Bảng thống kê lớp (Leaderboard nội bộ): Điểm số trung bình, tỷ lệ hoàn thành bài tập.
* Drill-down: Click vào 1 học sinh để xem chi tiết lịch sử làm bài và Sổ lỗi sai của học sinh đó.
* **Insight Giáo viên:** Hệ thống highlight những câu hỏi mà > 50% học sinh trong lớp làm sai để giáo viên tập trung giải thích trên lớp.

---

## 4. Module: Tài liệu & Thương mại (Resources & Commerce)

### **FR-24: Thư viện tài liệu (PPT)**
**Tiêu chí nghiệm thu (AC):**
* Giới hạn định dạng upload: `.pdf`, `.ppt`, `.pptx`, `.doc`, `.docx`. Giới hạn dung lượng: `< 50MB/file`.
* Tài liệu có thể được phân quyền truy cập: **Public (Free)** hoặc **Premium (VIP only)**.
* Chỉ User có role Admin hoặc VIP mới có thể click nút "Download" tài liệu Premium. Nút Download sử dụng AWS Presigned URL có thời hạn (ví dụ 15 phút) để chống chia sẻ link trái phép.

### **FR-25 & FR-26: Liên hệ & Đăng ký VIP**
**Tiêu chí nghiệm thu (AC):**
* **Nâng cấp VIP:** Khi Free User chọn mua gói VIP (Tháng/Năm), hệ thống hiển thị mã QR chuyển khoản ngân hàng, có chứa mã định danh của user trong nội dung chuyển khoản.
* User nhấn "Đã chuyển khoản", trạng thái tài khoản chuyển thành `Pending_VIP`.
* Admin nhận thông báo ở Dashboard, kiểm tra biến động số dư ngân hàng và click "Kích hoạt" thủ công.
* Khi kích hoạt thành công, hệ thống gửi email tự động (qua Brevo) thông báo quyền lợi VIP đã sẵn sàng và thời hạn gói.
* **Liên hệ tư vấn:** Form lưu thông tin Tên, SĐT, Nhu cầu vào Database. Đánh dấu trạng thái "Chưa xử lý" / "Đã liên hệ".
