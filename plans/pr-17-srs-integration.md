# Kế hoạch Tích hợp Sổ Lỗi Sai (Mistake Book) & Hệ thống SRS (PR-17)

Dựa vào hiện trạng codebase, chúng ta đã có module **SRS (SuperMemo-2)** rất tốt nhưng chưa được liên kết với **Mistake Book (PR-17)**. Đây là bản kế hoạch chi tiết để triển khai việc tích hợp này.

## 1. Phân tích Hiện trạng
- **SRS Module (`backend/src/modules/srs`)**: Đã có logic tính toán khoảng cách ôn tập (interval, EF) qua `submitReview(rating)`.
- **Mistake Book (`backend/src/modules/resources/mistake-book.controller.ts`)**: Mới chỉ lưu trữ tĩnh dạng CRUD.
- **Vấn đề**: Cần gắn logic SRS vào các từ vựng nằm trong Sổ lỗi sai để bắt ép người dùng ôn tập lại định kỳ bằng Flashcard.

## 2. Kế hoạch Triển khai (Backend)

### 2.1 Cập nhật Logic Lưu Sổ lỗi sai (Auto-tracking)
- **Hành động:** Khi user làm sai ở các module luyện tập (`HanziWriting`, `FillBlank`, `Match`, `Sentence`), Backend tự động gọi `MistakeBookService.create` để lưu lỗi sai. Đồng thời, gọi `SrsService.submitReview` với mức rating `AGAIN` (0) để thuật toán ép từ vựng này vào danh sách "cần ôn tập gấp" (interval = 0).

### 2.2 Tạo API "Ôn tập Sổ Lỗi Sai" (Review Quiz Generation)
- **Hành động:** Viết thêm API `GET /api/mistake-book/review/start` tại `MistakeBookController`.
- **Logic:** 
  1. Lọc trong bảng `mistake_books` của user.
  2. Join với bảng `user_vocabulary_progress` (của SRS) để xem những từ nào trong sổ lỗi sai đang "đến hạn ôn tập" (`nextReviewAt <= NOW()`).
  3. Trả về tối đa 10 - 20 từ vựng để Frontend dùng làm Flashcard.

### 2.3 Cập nhật Logic Xóa khỏi Sổ (Smart Removal)
- **Hành động:** Không dùng logic `correct_streak = 2` cũ mỏng manh nữa. 
- **Logic mới:** Khi user làm Flashcard ôn tập sổ lỗi sai và submit rating (`GOOD` hoặc `EASY`), gọi `SrsService.submitReview`. Nếu `intervalDays` vọt lên quá 3 ngày (hoặc `masteryLevel` đạt mức ổn định), hệ thống tự động xóa bản ghi đó khỏi `mistake_books` vì chứng tỏ user đã thực sự nhớ từ.

## 3. Kế hoạch Triển khai (Frontend)

### 3.1 Cập nhật Màn hình Sổ Lỗi Sai (`mistake-book-feature.tsx`)
- Thêm nút **"Ôn tập ngay (Review Now)"** cực lớn trên UI.
- Nút này sẽ gọi API `/api/mistake-book/review/start` để lấy danh sách từ vựng.

### 3.2 Tái sử dụng Flashcard Game
- Thay vì phải code lại game, chuyển hướng user sang Component `FlashcardGameFeature` đã có sẵn.
- Sau khi user lật thẻ và chấm điểm (Hard/Good/Easy), Frontend sẽ bắn API cho backend chấm điểm SM-2. Backend sẽ tự lo việc loại từ ra khỏi sổ lỗi sai nếu nhớ tốt.

## 4. Các bước thực hiện (To-do List)
- [ ] BE: Update các engine Practice (Fill/Match/Write) gọi `addToMistakeBook`.
- [ ] BE: Thêm Endpoint `GET /mistake-book/review/start` kết hợp SRS query.
- [ ] BE: Sửa lại logic SM-2 (`SrsService`) để tự động xóa `mistake_books` khi `masteryLevel` đạt ngưỡng.
- [ ] FE: Gắn nút Ôn tập và liên kết luồng với `FlashcardGameFeature`.
