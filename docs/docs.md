# Tài liệu yêu cầu nghiệp vụ -- HSK Learning Platform

**Thông tin** | **Nội dung**
---|---
Tên dự án | HSK Learning Platform
Phiên bản | 1.0
Ngày | 05/08/2026
Tech stack | NestJS (Backend), NextJS (Frontend), AWS
Người soạn | ---

*Business Requirements Document (BRD)*

---

## 1. Tổng quan dự án

### 1.1. Mục tiêu

Xây dựng nền tảng học và luyện thi HSK (cấp 1--9) và HSKK (phần thi nói), phục vụ ba nhóm người dùng chính: học viên thường (Free), học viên trả phí (VIP) và giáo viên. Hệ thống hỗ trợ học từ vựng/ngữ pháp, luyện tập qua game tương tác, thi thử mô phỏng thi thật và tích hợp AI để cá nhân hoá nội dung học.

### 1.2. Phạm vi

**Trong phạm vi phiên bản 1:**
* Học từ vựng và ngữ pháp theo cấp độ hoặc chủ đề.
* Flashcard, thi thử và mini-game luyện tập.
* Luyện viết chữ Hán theo đúng thứ tự nét bằng thư viện stroke-order phía client.
* Sinh nội dung học bằng AI và theo dõi tiến trình học tập.
* Công cụ dành cho giáo viên, thư viện tài liệu và chức năng liên hệ/mua tài liệu.

### 1.3. Đối tượng người dùng

| Actor | Mô tả |
| :--- | :--- |
| Free User | Học viên sử dụng miễn phí, giới hạn số lượt làm bài/game (3 lần/bài). |
| VIP User | Học viên trả phí, không giới hạn lượt luyện tập và được truy cập tài liệu VIP. |
| Teacher | Giáo viên có công cụ tạo đề riêng, theo dõi học sinh và nhận gợi ý lộ trình. |
| Admin | Quản trị hệ thống, nội dung, người dùng và gói VIP. |

---

## 2. Yêu cầu chức năng

### 2.1. Module: Nội dung học (Curriculum)

| Mã | Tên chức năng | Mô tả | Actor | Ưu tiên |
| :--- | :--- | :--- | :--- | :--- |
| FR-01 | Danh mục từ vựng/ngữ pháp theo cấp | Cung cấp nội dung từ vựng, ngữ pháp phân theo HSK1--9; mỗi cấp chia thành các bài học. | All | Cao |
| FR-02 | Học theo chủ đề | Học viên chọn chủ đề (con vật, đồ ăn, chỗ ở...), tập trung kỹ năng nói, ưu tiên cho trẻ em. | All | Trung bình |

> **Tiêu chí nghiệm thu -- FR-01**
> * Hệ thống hiển thị đúng nội dung theo cấp độ được chọn.
> * Mỗi từ vựng có đầy đủ chữ Hán, pinyin, nghĩa tiếng Việt và audio phát âm.
> * Admin có thể thêm, sửa và xoá nội dung qua trang quản trị.

### 2.2. Module: Kiểm tra & Luyện tập (Test Engine)

| Mã | Tên chức năng | Mô tả | Actor | Ưu tiên |
| :--- | :--- | :--- | :--- | :--- |
| FR-03 | Nối từ Trung--Pinyin--Việt | Bài tập nối từ giữa ba dạng biểu diễn của một từ, có audio phát âm mẫu. | All | Cao |
| FR-04 | Flashcard | Học viên ôn từ vựng qua flashcard và lật thẻ để xem nghĩa. | All | Cao |
| FR-08 | Luyện thi nói HSKK | Học viên ghi âm câu trả lời, nghe lại và gửi giáo viên chấm thủ công; file ghi âm lưu trên S3. | All | Cao |
| FR-09 | Bài tập điền chỗ trống | Điền từ còn thiếu vào câu và chấm điểm tự động. | All | Cao |
| FR-10 | Bài tập sắp xếp câu | Sắp xếp từ/cụm từ theo đúng trật tự câu và chấm tự động. | All | Cao |
| FR-11 | Game bắn bóng luyện pinyin | Học viên gõ đúng pinyin để bắn trúng bóng chứa từ tương ứng. | All | Trung bình |
| FR-12 | Game memory lật thẻ | Lật thẻ ghép cặp từ--nghĩa hoặc từ--pinyin. | All | Trung bình |
| FR-13 | Luyện viết chữ Hán | Luyện thứ tự nét phía client bằng Hanzi Writer, dữ liệu hanzi-writer-data và luồng triển khai tham khảo Wenbun. | All | Thấp (v1) |
| FR-14 | Giới hạn lượt theo gói | Free giới hạn 3 lượt/bài luyện tập; VIP không giới hạn. | Free, VIP | Cao |

> **Tiêu chí nghiệm thu -- FR-14**
> * Hệ thống đếm và lưu số lượt làm bài của từng học viên theo từng bài cụ thể.
> * Khi Free User đạt 3 lượt, hệ thống chặn lượt tiếp theo và hiển thị lời mời nâng cấp VIP.
> * Bộ đếm được đặt lại theo chu kỳ do Admin cấu hình (ví dụ: theo ngày hoặc theo bài).

### 2.3. Module: AI Generation

| Mã | Tên chức năng | Mô tả | Actor | Ưu tiên |
| :--- | :--- | :--- | :--- | :--- |
| FR-15 | Tạo câu chuyện từ danh sách từ vựng | Người dùng nhập danh sách từ; AI sinh câu chuyện ngắn sử dụng các từ đó, đúng độ khó của cấp HSK tương ứng. | VIP, Teacher | Trung bình |
| FR-16 | Gợi ý lộ trình học cho giáo viên | AI dựa trên lịch sử làm bài và sổ lỗi sai để gợi ý nội dung ôn tập phù hợp. | Teacher | Trung bình |

> **Tiêu chí nghiệm thu -- FR-15**
> * Câu chuyện sử dụng tối thiểu 90% số từ trong danh sách đầu vào.
> * Số lượng từ ngoài phạm vi cấp HSK đã chọn không vượt quá ngưỡng cho phép.
> * Thời gian phản hồi tối đa 10 giây; nếu lâu hơn, hệ thống xử lý bất đồng bộ và thông báo khi hoàn tất.

### 2.4. Module: Tiến trình học tập (Progress Tracking)

| Mã | Tên chức năng | Mô tả | Actor | Ưu tiên |
| :--- | :--- | :--- | :--- | :--- |
| FR-17 | Sổ lỗi sai | Ghi lại các câu học viên làm sai kèm ngữ cảnh và cho phép ôn lại riêng. | All | Cao |
| FR-18 | Thống kê mức độ thành thạo | Hiển thị biểu đồ/số liệu về mức độ nắm vững từ vựng, ngữ pháp theo cấp. | All | Trung bình |
| FR-19 | Kiểm tra từ vựng đầu bài | Kiểm tra nhanh từ vựng bài trước khi học viên vào bài học mới. | All | Thấp |

### 2.5. Module: Công cụ giáo viên (Teacher Tools)

| Mã | Tên chức năng | Mô tả | Actor | Ưu tiên |
| :--- | :--- | :--- | :--- | :--- |
| FR-05 | Tạo và giao bài kiểm tra | Giáo viên tạo bài kiểm tra từ ngân hàng câu hỏi, cấu hình thời gian/số lượt và giao cho lớp hoặc học sinh. | Teacher | Cao |
| FR-06 | Quản lý ngân hàng câu hỏi | Giáo viên tạo, sửa, xoá và phân loại câu hỏi theo cấp HSK, bài học và dạng bài. | Teacher | Cao |
| FR-07 | Đăng bài học/bài tập cho lớp | Giáo viên đăng nội dung, tài liệu hoặc bài luyện tập; cấu hình thời gian mở và hạn hoàn thành. | Teacher | Cao |
| FR-20 | Quản lý lớp và học sinh | Giáo viên tạo lớp, thêm/xoá học sinh và xem danh sách thành viên của lớp. | Teacher | Cao |
| FR-21 | Đề xuất bài học | Giáo viên nhận gợi ý nội dung buổi học tiếp theo dựa trên dữ liệu học sinh. | Teacher | Trung bình |
| FR-22 | Lên lịch kiểm tra từ vựng | Tự động mở bài kiểm tra từ vựng đầu giờ theo lịch giáo viên đặt. | Teacher | Trung bình |
| FR-23 | Theo dõi tiến trình học sinh | Giáo viên xem thống kê và sổ lỗi sai của từng học sinh trong lớp. | Teacher | Cao |

> **Tiêu chí nghiệm thu -- Module giáo viên**
> * Giáo viên chỉ quản lý được lớp, bài đăng, câu hỏi và bài kiểm tra do mình sở hữu.
> * Học sinh chỉ xem được nội dung đã được giao cho lớp hoặc tài khoản của mình.
> * Kết quả bài kiểm tra được chấm phía server và hiển thị trong trang theo dõi của giáo viên.

### 2.6. Module: Quản trị hệ thống (Admin Tools)

| Mã | Tên chức năng | Mô tả | Actor | Ưu tiên |
| :--- | :--- | :--- | :--- | :--- |
| FR-27 | Quản lý người dùng và phân quyền | Admin tìm kiếm, khoá/mở tài khoản và gán vai trò Free, VIP, Teacher hoặc Admin. | Admin | Cao |
| FR-28 | Quản lý nội dung hệ thống | Admin tạo, sửa, xuất bản, ẩn và xoá mềm nội dung HSK, từ vựng, ngữ pháp, chủ đề và câu hỏi dùng chung. | Admin | Cao |
| FR-29 | Quản lý nội dung giáo viên | Admin xem, ẩn hoặc xoá nội dung vi phạm do giáo viên đăng; không tự ý sửa nội dung chuyên môn. | Admin | Trung bình |
| FR-30 | Quản lý yêu cầu VIP | Admin xem yêu cầu nâng cấp, kích hoạt, gia hạn hoặc huỷ trạng thái VIP thủ công. | Admin | Cao |
| FR-31 | Cấu hình hệ thống | Admin cấu hình giới hạn lượt Free, thời điểm reset, nhà cung cấp AI và các feature flag. | Admin | Cao |
| FR-32 | Dashboard quản trị | Admin xem số người dùng, lượt luyện tập, lỗi hệ thống và tình trạng các tác vụ nền. | Admin | Trung bình |

> **Tiêu chí nghiệm thu -- Module Admin**
> * Tất cả API quản trị yêu cầu vai trò Admin và kiểm tra quyền phía server.
> * Các thao tác khoá tài khoản, đổi vai trò, kích hoạt VIP và ẩn nội dung được ghi lại người thực hiện/thời gian.
> * Admin không xem được mật khẩu, token hoặc API key dạng rõ.

### 2.7. Module: Tài liệu & Thương mại (Resources & Commerce)

| Mã | Tên chức năng | Mô tả | Actor | Ưu tiên |
| :--- | :--- | :--- | :--- | :--- |
| FR-24 | Thư viện tài liệu (PPT) | Upload, chia sẻ tài liệu tham khảo và phân loại theo gói Free/VIP. | Teacher, Admin | Trung bình |
| FR-25 | Liên hệ tư vấn học | Form để học viên đăng ký học HSK/HSKK hoặc mua tài liệu. | All | Thấp |
| FR-26 | Đăng ký nâng cấp VIP | Học viên gửi yêu cầu nâng cấp VIP; Admin xác nhận và kích hoạt gói thủ công. | Free | Cao |

---

## 3. Ma trận phân quyền

| Chức năng | Free | VIP | Teacher | Admin |
| :--- | :---: | :---: | :---: | :---: |
| Học từ vựng/ngữ pháp | X | X | X | X |
| Flashcard, memory game | Giới hạn 3 lượt | Không giới hạn | X | X |
| Thi thử/ôn tổng hợp | Giới hạn 3 lượt | Không giới hạn | X | X |
| AI tạo câu chuyện | --- | X | X | X |
| Tài liệu PPT VIP | --- | X | X | X |
| Tạo đề kiểm tra riêng | --- | --- | X | X |
| Tạo câu hỏi, đăng/giao bài | --- | --- | X | X |
| Quản lý lớp và học sinh | --- | --- | X | X |
| Quản lý người dùng, vai trò | --- | --- | --- | X |
| Quản lý yêu cầu VIP | --- | --- | --- | X |
| Cấu hình hệ thống | --- | --- | --- | X |
| Quản lý nội dung hệ thống | --- | --- | --- | X |

---

## 4. Yêu cầu phi chức năng

| Mã | Yêu cầu | Chi tiết |
| :--- | :--- | :--- |
| NFR-01 | Hiệu năng | Trang luyện tập/game phản hồi dưới 200 ms; API AI generation phản hồi dưới 10 giây hoặc chuyển sang xử lý bất đồng bộ. |
| NFR-02 | Khả năng mở rộng | MVP scale dọc EC2; các service chạy bằng container để có thể tách sang nhiều EC2 khi tải tăng. |
| NFR-03 | Bảo mật | Việc chấm điểm bài thi phải thực hiện phía server; không tin cậy dữ liệu do client gửi lên. |
| NFR-04 | Khả dụng | Uptime tối thiểu 99,5%. |
| NFR-05 | Đa ngôn ngữ | Giao diện hỗ trợ tiếng Việt và có khả năng mở rộng sang tiếng Anh. |
| NFR-06 | Lưu trữ media | Audio/tài liệu phải được phân phối nhanh và kiểm soát quyền truy cập theo gói. |

---

## 5. Kiến trúc kỹ thuật đề xuất

### 5.1. Stack tổng quan

| Thành phần | Công nghệ |
| :--- | :--- |
| Backend | NestJS (TypeScript) |
| Frontend | NextJS |
| Database chính | Supabase PostgreSQL gói Free; backup bổ sung bằng pg_dump lên S3 |
| Cache / Session / Rate-limit | Upstash Redis gói Free |
| Lưu trữ file (audio, PPT, ảnh) | AWS S3 + Presigned URL |
| AI (sinh câu chuyện, gợi ý học) | OpenAI API hoặc Gemini API; gọi từ NestJS bằng API key phía server |
| Audio mẫu | Admin upload file audio có sẵn lên S3 |
| Auth | JWT/Passport + Argon2 tự triển khai trong NestJS |
| Hosting backend | Docker Compose trên AWS EC2, reverse proxy Nginx |
| Hosting frontend | NextJS chạy trên cùng EC2 hoặc EC2 riêng |
| Tác vụ định kỳ / Queue | NestJS Schedule + bảng job trong Supabase |
| Gửi email liên hệ | Brevo SMTP gói miễn phí |
| Monitoring | Uptime Kuma; Prometheus + Grafana khi cần theo dõi chi tiết |
| Log | Docker logs; bổ sung Loki khi lượng log tăng |
| Bảo mật hạ tầng | Nginx, Let's Encrypt, UFW, Fail2ban và file biến môi trường giới hạn quyền |
| CI/CD | GitHub Actions + Docker image |

### 5.2. Module Backend (NestJS)

`auth / users / curriculum / vocabulary / exam / quiz / game / ai / srs / progress / resources / classroom / assignment / teacher / admin / subscription / notification`

### 5.3. Ghi chú triển khai theo module

| Module nghiệp vụ | AWS service chính | Ghi chú |
| :--- | :--- | :--- |
| Curriculum, Vocabulary | Supabase PostgreSQL | Dữ liệu quan hệ; backup bổ sung bằng pg_dump lên S3. |
| Exam, Quiz | Supabase + Upstash Redis | Redis lưu session tạm; kết quả chính thức lưu Supabase. |
| HSKK Speaking | AWS S3 | Ghi âm lưu S3; học viên nghe lại và giáo viên chấm thủ công. |
| Game (bắn bóng, memory) | Client-side + Supabase | Logic game ở NextJS; backend chỉ tạo phiên và lưu kết quả cuối. |
| AI Story Generation | OpenAI/Gemini API | NestJS gọi provider đã cấu hình; tác vụ dài lưu trong bảng job Supabase. |
| Audio mẫu | AWS S3 | Admin upload audio có sẵn; không sinh giọng nói tự động. |
| Error log, thống kê | Supabase + công cụ OSS | Job định kỳ bằng NestJS Schedule; giám sát bằng Uptime Kuma/Prometheus. |
| Resources (PPT) | S3 + Presigned URL | Backend ký URL trực tiếp; chưa cần CDN trong MVP. |

---

## 6. Vấn đề cần làm rõ

| # | Vấn đề | Cần quyết định bởi |
| :---: | :--- | :--- |
| 1 | Ngưỡng cụ thể về "độ khó" khi AI sinh câu chuyện cho từng cấp HSK. | BA + AI team |
| 2 | Chu kỳ đặt lại số lượt làm bài Free: theo ngày hay theo bài? | Product Owner |

> **Kết luận**
>
> Tài liệu này là bản phân tích chức năng ban đầu (v1.0). Nội dung cần được review cùng đội Dev/QA trước khi chuyển sang giai đoạn thiết kế chi tiết, bao gồm ERD, API specification và wireframe.
