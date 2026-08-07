# Plan: Xử lý 4 việc còn lại (backend + align frontend)

**Ngày:** 2026-08-07 · **Trạng thái:** ✅ Complete (P1–P6 đều xong, có smoke test + code review)

## Bối cảnh
Frontend đã build xong và pass. 4 việc còn lại được ghi nhận trong báo cáo trước đều thuộc backend (NestJS) — user yêu cầu xử lý nốt để đóng vòng lặp PR-05 / PR-14 và làm audio hoạt động thật.

## Các phase

### P1 — PR-05: chấm điểm phía server + không lộ đáp án (Task #12)
- `GET /test-questions` (+ `:id`): TEACHER/ADMIN thấy `correctAnswer`; học viên KHÔNG.
- `POST /test-attempts/:attemptId/answers`: backend tự chấm (SINGLE_CHOICE/TRUE_FALSE khớp chính xác; SHORT_ANSWER chuẩn hoá khoảng trắng + chữ hoa/thường), upsert theo UNIQUE(attempt_id, question_id), kiểm tra sở hữu + chưa nộp.
- `PATCH /test-attempts/:id` (submit): tính `score` tổng từ answers, kiểm tra sở hữu.
- `GET /test-attempts/:attemptId/answers`: chỉ owner hoặc TEACHER/ADMIN.

### P2 — PR-14: atomic limit (Task #13)
- `POST /daily-usage/checkLimit` → pure peek (không tăng lượt), dùng `@CurrentUser` thay body userId.
- `consumeInTransaction(em, userId, activityKey, role)`: VIP/Teacher/Admin miễn trừ; pessimistic row-lock; đủ lượt thì `usedCount+1` trong CÙNG transaction tạo attempt.
- `PracticeAttemptService.start`: gộp consume + create attempt trong 1 transaction; giữ idempotency (retry không tăng lượt 2 lần); hết lượt → HTTP 429.

### P3 — /subscriptions/me (Task #14)
- `GET /subscriptions/me`: gói của người dùng hiện tại (authenticated, không admin-only).
- `GET /subscriptions/:id`: scope — chỉ owner hoặc admin.
- Frontend: bỏ role-proxy, dùng `subscriptionApi.me()` ở resources + profile.

### P4 — Audio serving (Task #15)
- Module `audio`: `GET /api/v1/audio/:key` public, serve file tĩnh từ `AUDIO_STORAGE_DIR` (mặc định `./storage/audio`), chống path traversal, Content-Type theo extension, hỗ trợ Range (res.sendFile).
- Frontend: rewrite `/api/audio/:path*` → backend.

### P5 — Frontend align (Task #16)
- `tests/[testId]`: bỏ grading client-side, lấy `attempt.score` + `listAnswers` từ server, tôn trọng `showScoreImmediately`.
- `practice-engine`: bắt 429 ở `start` → hiện limit screen.
- `endpoints.ts`: `subscriptionApi.me()`.
- `resources`/`profile`: dùng me() để xác định VIP.

### P6 — Verify (Task #17)
Build backend + frontend, lint, test (frontend Vitest 19/19, backend jest), code-reviewer, cập nhật report + README.

## Files chạm
- backend: `test/test.service.ts`, `test/test.controller.ts`, `subscription/subscription.service.ts`, `subscription/subscription.controller.ts`, `subscription/subscription.module.ts`, `practice/practice.service.ts`, `practice/practice.controller.ts`, `practice/practice.module.ts`, `app.module.ts`, mới `audio/audio.module.ts` + `audio/audio.controller.ts`, `.env.example`
- frontend: `app/tests/[testId]/page.tsx`, `components/practice/practice-engine.ts`, `lib/api/endpoints.ts`, `app/resources/page.tsx`, `app/profile/page.tsx`, `next.config.ts`

## Rủi ro
- Thay đổi grading có thể đổi kết quả hiển thị cũ (SHORT_ANSWER lệch đáp án giờ là "sai" thay vì "chưa chấm") — đúng spec PR-05 (không có chấm tay trong MVP).
- Transaction dùng lock — đảm bảo không tạo vòng lặp dependency module (practice → subscription đã export DailyUsageService).
- `findOne`/`listAttempts` của test-attempt KHÔNG đổi scope (giáo viên xem kết quả học viên cần truy cập). **Đã xử lý:** list/chi tiết attempt giờ scope theo owner/TEACHER/ADMIN (bỏ `?userId=` client), giáo viên vẫn lọc theo `testId`.

## Ngoài 4 việc chính — bịt thêm lỗ hổng (từ code-reviewer, đã fix + smoke test)
- **Cross-test answer injection** (HIGH): `submitAnswer` chặn câu hỏi không thuộc test của attempt (400); `submit` chỉ tính điểm cho câu thuộc đúng bài test.
- **Attempts IDOR** (HIGH): `GET/PATCH /test-attempts` + `/practice-attempts` scope theo owner; `submit` practice bắt buộc sở hữu; `findAll` bỏ qua `?userId=` client cho học viên.
- **Resources VIP gate phía server** (MEDIUM): `fileKey` chỉ trả cho VIP/Teacher/Admin (metadata vẫn hiện); module resources import SubscriptionModule.
- **Peek miễn trừ Teacher/Admin** (MEDIUM): `checkLimit` đồng bộ với consume.
- **`timeLimitMinutes: 0`** (MEDIUM): frontend coi 0 = không giới hạn (không auto-submit ngay).
- **DTO `checkLimit`** (LOW): bỏ `userId` khỏi body — server lấy từ JWT; frontend bỏ gửi.
- **Rollback race** (LOW): `consumeInTransaction` retry insert khi winner rollback.
- Dọn unused import, comment stale audio-button.

## Câu hỏi chưa rõ
- Đặt tên `audioKey` (ASCII/pinyin hiện OK vì sanitize chặn non-ASCII; nếu cần key có dấu tiếng Việt/tiếng Trung thì phải nới regex).
- `showScoreImmediately=false`: điểm vẫn hiện trên profile học viên (backend vẫn trả score) — quyết định sản phẩm, MVP giữ nguyên.
- Concurrent `start`/`submitAnswer` có thể 500 do unique-violation (pre-existing, LOW) — chưa map 409 trong batch này.
