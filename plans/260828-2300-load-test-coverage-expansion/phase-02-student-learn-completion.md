# Phase 2: student-learn.js — add complete-vocab/grammar

## Context
Student journey hiện chỉ có practice + srs. Thiếu **write path chính**: đánh dấu hoàn thành vocab/grammar trong lesson. Đây là feature học sinh dùng nhiều nhất.

## Requirements
- Thêm step POST /student/progress/lesson/:id/complete-vocab
- Thêm step POST /student/progress/lesson/:id/complete-grammar
- Thêm GET /student/recommended-lessons
- Thêm GET /student/progress/lesson/:lessonId
- Counter `practice_attempts_total{type}` khi start attempt thành công
- Counter `srs_reviews_total{rating}` khi review thành công

## Architecture
- Sửa file hiện tại, không tạo file mới (theo CLAUDE.md "DO NOT create new enhanced files")
- Mỗi step là 1 hàm riêng để dễ test và đọc

## Related Code Files
- UPDATE: `load-tests/journeys/student-learn.js`

## Implementation Steps
1. Insert step (mới) sau step (2) browse course: GET `/student/recommended-lessons`
2. Insert step (mới) sau khi có `lessonId`: POST `/student/progress/lesson/:id/complete-vocab`
3. Insert step (mới): POST `/student/progress/lesson/:id/complete-grammar`
4. Insert step (mới): GET `/student/progress/lesson/:id` để verify
5. Tag mỗi step `type:read` hoặc `type:write` cho threshold
6. Add check() pass/fail rõ ràng
7. Add Counter increment sau mỗi check 2xx

## Success Criteria
- [ ] File vẫn < 200 dòng
- [ ] 8 endpoint được cover (4 cũ + 4 mới)
- [ ] Counter `practice_attempts_total` xuất hiện trong report
- [ ] Counter `srs_reviews_total` xuất hiện trong report
- [ ] Smoke pass

## Risk
- complete-vocab/grammar cần lessonId có vocab/grammar thật trong DB → cần `npm run seed:curriculum` trước
- Mitigation: check `lessonId != null` trước khi gọi (đã có sẵn pattern)