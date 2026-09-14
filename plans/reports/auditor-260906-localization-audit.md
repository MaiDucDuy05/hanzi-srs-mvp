# Localization Audit — Student-Facing Features

Date: 2026-09-06
Scope: `frontend/src/features/{study,srs,speaking,student,practice,games,livequiz,profile}/`
Method: grep for Vietnamese chars (Đ/đ + diacritics) + per-file read
Goal: list remaining files needing `useTranslations` migration (i18n vi/en).

## Status Summary

| Directory | Files audited | Needs l10n | Already l10n |
|---|---|---|---|
| srs | 1 | 1 | 0 |
| speaking | 2 | 2 | 0 |
| study | 12 | 11 | 1 (story-summary uses static literals — see note) |
| student | 10 | 8 | 2 (profile, upgrade-vip, mistake-book skipped) |
| practice | 10 | 9 | 1 (session, session-frame skipped) |
| games/components | 21 | 14 | 1 (game-session skipped) |
| games/page-features | 8 | 8 | 0 |
| live-quiz | 2 | 2 | 0 |
| profile | 0 | 0 | 0 (dir doesn't exist) |
| exam | 0 | 0 | 0 (dir doesn't exist) |

No new files use `useTranslations`. Many `'use client'` components still hardcode vi strings.

---

## P1 — High priority (large surfaces, user-facing, untouched)

### features/srs/
- `review-today-feature.tsx` (client)
  - No i18n. Top strings: "Đang tải thẻ ôn tập...", "Không có từ mới!", "Hoàn thành ôn tập! 🎉", "Bạn đã ôn tập xong tất cả thẻ cho hôm nay.", "Ôn tập hôm nay", "Bạn có {n} từ cần ôn"

### features/speaking/
- `speaking-hub-feature.tsx` (client)
  - No i18n. "Luyện nói HSKK", "Luyện nói ngay", "Chờ chấm", "Đã chấm", "Tổng bài", "Chưa có bài luyện nói", "Đã chấm", "Chờ chấm", "Phát audio", "Nộp lúc"
- `speaking/components/recording-modal.tsx` (client)
  - No i18n. "Luyện nói HSKK", "Nhấn nút ghi âm để bắt đầu", "Đã ghi âm — {fmt}", "Đang tải lên…", "Đã nộp bài!", "Bắt đầu ghi âm", "Dừng ghi âm", "Tạm dừng", "Phát lại", "Ghi lại", "Nộp bài", "Đang chuyển…", "Không thể truy cập micro. Vui lòng cấp quyền.", "Upload thất bại. Thử lại."

### features/student/
- `settings-feature.tsx` (client)
  - Uses partial `Settings` namespace but **many hardcoded strings remain**: "Đang lưu...", "Lưu Thay đổi", "Thay đổi mật khẩu", "Quên mật khẩu?" (other labels via t())
- `study-lesson-feature.tsx` (client)
  - No i18n. "Từ vựng ({n})", "Ngữ pháp ({n})", "Vocabulary Library List", "Grammar Points", "Bắt đầu học từ mới", "Ôn tập Flashcard", "Bắt đầu học ngữ pháp"
- `student-exam-taking-page.tsx` (client)
  - No i18n. "Đang chuẩn bị bài kiểm tra...", "Lỗi tải bài kiểm tra.", "Bài kiểm tra này đã kết thúc!", "Trình duyệt của bạn không hỗ trợ tính năng này.", "Lỗi khi mở toàn màn hình", "Chế độ Thi", "Chế độ Toàn màn hình", "Mở Toàn Màn Hình", "Progress", "Submit Exam", "Trắc nghiệm", "Đúng/Sai", "Luyện nói", "Viết chữ", "Câu hỏi", "Question Palette", "Answered", "Not Answered", "Bookmarked", "Previous", "Next", "Xác nhận nộp bài?", "Hủy bỏ", "Nộp bài ngay", "Đã hết thời gian! Hệ thống sẽ tự động nộp bài.", "Lỗi nộp bài. Vui lòng thử lại."
- `student-exam-result-feature.tsx` (client)
  - No i18n. "Đang tải kết quả...", "Quay lại", "Kết quả: {name}", "Đang chờ chấm điểm", "Bài làm của bạn đang chờ giáo viên chấm phần tự luận/nói. Điểm số sẽ được cập nhật sau.", "Thời gian làm bài", "Nộp lúc", "Chi tiết bài làm", "Đề bài không có câu hỏi.", "Nối từ", "Câu trả lời của bạn", "Không trả lời", "Đáp án đúng", "Giải thích", "{x} điểm"
- `take-exam-feature.tsx` (client)
  - No i18n. "Bài kiểm tra này đã kết thúc!", "Lỗi tải bài kiểm tra.", "Đã hết thời gian làm bài! Hệ thống sẽ tự động nộp bài.", "Lỗi nộp bài. Vui lòng thử lại.", "Bạn có chắc chắn muốn nộp bài?", "Đang chuẩn bị đề thi...", "Lỗi không xác định", "Đúng (True)", "Sai (False)", "Nhập câu trả lời của bạn...", "{n} câu hỏi", "Nộp bài", "Nối từ"
- `student-exam-result-feature.tsx` — same, no i18n
- `components/study-lesson-vocab-table.tsx` (client)
  - No i18n. Table headers: "Hanzi", "Pinyin", "Meaning", "Part of Speech", "Mastery Level", "Actions"; buttons: "Học từ này", "Nghe phát âm"
- `components/study-lesson-filter-bar.tsx` — not audited in detail (small), check separately
- `components/study-lesson-grammar-list.tsx` — not audited in detail (small), check separately

Note: `student-resources-feature.tsx` already uses `Resources` namespace — OK.

### features/study/
- `study-feature.tsx` (client)
  - No i18n. "Lỗi tải dữ liệu.", "Từ vựng ({n})", "Ngữ pháp (0)", "Vocabulary Library List", "Grammar Points", "{n} từ vựng — Học theo {cấp độ HSK | chủ đề}", "Đang tải...", "Không tìm thấy từ phù hợp.", "Chưa có từ vựng nào.", "Bắt đầu học từ mới", "Ôn tập Flashcard"
- `learn-word/learn-word-flow.tsx` (client)
  - No i18n. "Quay lại", "Từ {i}/{n}", "Bỏ qua từ này"
- `learn-word/story-summary.tsx` (client)
  - No i18n. Many: "Tạo câu chuyện ôn tập", "Chủ đề mong muốn", "Độ khó (Level)", "HSK 1 (Rất dễ)", ..., "Bắt đầu tạo truyện", "Đang gợi ý câu chuyện để ôn tập...", "Tuyệt vời! Bạn đã học xong.", "Đọc câu chuyện dưới đây để ôn lại toàn bộ từ vựng nhé.", "Câu chuyện ôn tập", "Nghe đọc toàn bộ", "Bản dịch tiếng Việt", "Hoàn tất bài học"
- `learn-word/steps/word-intro-step.tsx` (client)
  - No i18n. "Ví dụ minh họa", "Tiếp tục"
- `learn-word/steps/hanzi-practice-step.tsx` (client)
  - No i18n. "Luyện viết chữ Hán", "Gợi ý nét viết", "Viết lại nét sai", "Tiếp tục"
- `learn-word/steps/sentence-writing-step.tsx` (client)
  - No i18n. "Tự đặt câu", "Phát hiện lỗi chính tả/ngữ pháp", "Sửa", "thành", "Áp dụng", "Câu của bạn rất chính xác!", "Kiểm tra lỗi", "Tiếp tục"
- `learn-word/steps/reverse-translation-step.tsx` (client)
  - No i18n. "Dịch sang tiếng Trung", "Dựa vào nghĩa tiếng Việt, hãy viết lại câu tiếng Trung gốc.", "Gõ tiếng Trung vào đây...", "Không có bản dịch.", "Gợi ý:", "Xem gợi ý", "Kiểm tra", "Hoàn thành từ này"
- `learn-grammar/learn-grammar-flow.tsx` (client)
  - No i18n. "Quay lại", "Ngữ pháp {i}/{n}", "Bỏ qua"
- `learn-grammar/grammar-summary.tsx` (client)
  - No i18n. "Hoàn thành bài ngữ pháp!", "Tuyệt vời! Bạn vừa học xong {n} cấu trúc ngữ pháp. Hãy để AI viết một câu chuyện thú vị áp dụng tất cả các ngữ pháp này nhé.", "Chủ đề câu chuyện", "Độ khó (Level)", "Bắt đầu tạo truyện", "Đang sáng tác...", "AI đang dệt nên câu chuyện với các ngữ pháp bạn vừa học!", "Tổng kết Ngữ pháp", "Hoàn thành", "Bản tiếng Trung", "Bản dịch tiếng Việt"
- `learn-grammar/steps/grammar-intro-step.tsx` (client)
  - No i18n. "Điểm ngữ pháp mới", "Cấu trúc", "Giải thích", "Xem ví dụ"
- `learn-grammar/steps/grammar-examples-step.tsx` (client)
  - No i18n. "Ví dụ thực tế", "Cách sử dụng \"{title}\" trong ngữ cảnh", "AI đang tìm kiếm ví dụ hay nhất...", "Không thể tải ví dụ lúc này.", "Luyện tập dịch"
- `learn-grammar/steps/grammar-practice-step.tsx` (client)
  - No i18n. "Thử thách dịch thuật", "Dịch câu sau sang tiếng Trung dùng cấu trúc \"{title}\"", "AI đang chuẩn bị câu hỏi...", "Nhập câu tiếng Trung của bạn vào đây...", "AI đang chấm điểm...", "Kiểm tra đáp án", "Xuất sắc!", "Chưa chính xác lắm!", "Tiếp tục học", "Lỗi tải câu hỏi."

### features/practice/components/ (excl. session.tsx, session-frame.tsx)
- `fill-blank-mode.tsx` (client)
  - No i18n. "Câu {i}/{n}", "Đúng {x} · Sai {y}", "Nhập chữ Hán...", "Kiểm tra", "Chính xác! ✓", "Sai - đáp án:", "Đang chuyển câu tiếp theo...", "Nhập chữ Hán đúng với pinyin & nghĩa trên."
- `matching-mode.tsx` (client)
  - No i18n. "Đã ghép: {i}/{n}", "Đúng {x} · Sai {y} · Thao tác {z}", "Ghép sai sẽ được đánh dấu đỏ nhẹ — tiếp tục nhé!", "Chơi lại"
- `flashcard-mode.tsx` (client)
  - No i18n. "Thẻ {i}/{n}", "Biết {x} · Chưa biết {y}", "Nhấn để lật thẻ", "Chưa biết", "Đã biết ✓", "Lật thẻ xem đáp án rồi tự đánh giá nhé."
- `sentence-ordering-mode.tsx` (client)
  - No i18n. "Câu {i}/{n}", "Đúng {x} · Sai {y}", "Sắp xếp các từ thành câu đúng:", "Chạm từ bên dưới để ghép", "Chính xác! ✓", "Chưa đúng — thử lại câu khác nhé!", "Kiểm tra", "{n} từ còn thiếu"
- `source-picker.tsx` (server)
  - No i18n. "Lỗi tải dữ liệu.", "Theo cấp HSK", "Theo chủ đề"
- `practice-engine.ts` (client) — no UI strings (logic file), but contains error strings: "Nguồn này chưa có bài tập sắp xếp câu.", "Nguồn này chưa có bài tập điền từ.", "Nguồn này chưa đủ từ vựng để luyện tập.", "Không thể bắt đầu phiên luyện tập.", "Lỗi lấy danh sách câu hỏi.", "Lỗi submit: ..." → should be l10n'd
- `practice-models.ts` — no UI strings (only comments)
- `source-loader.ts` — no UI strings

### features/practice/
- `hanzi-writing-selection-feature.tsx` (client) — already uses `Practice` namespace ✓
- `practice-hub-feature.tsx` (client) — already uses `Practice` namespace ✓
- `mistake-review-feature.tsx` — skipped per request

### features/games/page-features/
- `games-hub-feature.tsx` (client) — actually `features/games/games-hub-feature.tsx` (parent dir)
- `flashcard-game-feature.tsx` (client)
  - No i18n. "Không có từ vựng để ôn tập.", "Click to flip", "Audio", "Stroke Order", "Gợi ý nét viết", "Again", "Hard", "Good", "Easy"
- `fill-game-feature.tsx` (client)
  - No i18n. "Đang tải bài tập...", "Không thể bắt đầu", "Có lỗi xảy ra khi tải dữ liệu.", "Quay lại", "Hết lượt chơi", "Bạn đã hết lượt chơi hôm nay. Quay lại sau nhé!", "Về trang luyện tập", "Điền từ"
- `sentence-game-feature.tsx` (client)
  - No i18n. "Đang tải câu hỏi...", "Quay lại", "Bạn đã hết lượt luyện tập hôm nay.", "Tuyệt vời! 🎉", "Hoàn thành Sắp xếp câu (Sentence Game)"
- `write-sentence-feature.tsx` (client)
  - No i18n. "Không tìm thấy câu hỏi.", "Quay lại", "Bạn đã hết lượt luyện tập hôm nay.", "Xuất sắc! ✍️", "Hoàn thành Viết câu (Write the Sentence)"
- `memory-game-feature.tsx` (client)
  - No i18n. "Đang tải dữ liệu trò chơi...", "Có lỗi xảy ra", "Tuyệt vời! 🎉", "Hoàn thành Lật thẻ (Memory Game)", "Đang tải..."
- `match-game-feature.tsx` (client)
  - No i18n. "Không tìm thấy bài học", "Vui lòng chọn một bài học từ Bảng điều khiển để bắt đầu trò chơi.", "Về Bảng điều khiển", "Đang chuẩn bị phiên luyện tập...", "Có lỗi xảy ra.", "Tuyệt vời! 🎉", "Hoàn thành Ghép thẻ (Match Game)", "Đang tải trò chơi..."
- `balloon-game-feature.tsx` (client)
  - No i18n. "Đang nạp đạn và bơm bóng bay...", "Có lỗi xảy ra", "Tuyệt vời! 🎉", "Hoàn thành Bảo Vệ Căn Cứ (Balloon Game)", "Đang tải..."
- `listening-game-feature.tsx` (client)
  - No i18n. "Listening Bird", "Listen and choose the correct meaning", "Next Question"
- `games/games-hub-feature.tsx` (client)
  - No i18n. "Bắn bóng Pinyin", "Chọn bóng có pinyin đúng cho chữ Hán", "Trò chơi trí nhớ", "Lật thẻ tìm cặp chữ Hán & pinyin", "Luyện viết chữ Hán", "Viết chữ đúng thứ tự nét trên màn hình", "Bài học", "Chủ đề", "Cấp độ", "Trò chơi", "Vừa chơi vừa học — chọn trò chơi và nguồn từ vựng.", "1. Chọn trò chơi", "2. Chọn nguồn từ vựng", "Bắt đầu chơi", "Vui lòng chọn trò chơi và nguồn.", "Đang tải trò chơi..."

### features/games/components/
- `game-summary.tsx` (client)
  - No i18n. "Tuyệt vời! 🎉", "Khá tốt! 👍", "Cố gắng lên nhé! 💪", "Đúng", "Sai", "Thời gian", "Chơi lại", "Về menu"
- `hanzi-writer-canvas.tsx` (client) — no UI strings
- `hanzi-writer-animation.tsx` (client) — no UI strings
- `writing-mode.tsx` (client)
  - No i18n. "Luyện viết chữ Hán", "Tiến độ: {i}/{n}", "Bảng Viết (Tian Zi Ge)", "Viết lại nét sai", "Bỏ qua chữ này", "Bạn đã viết đúng! Đang chuyển chữ...", "Animation Preview", "slow", "normal", "fast"
- `write-sentence-board.tsx` (client)
  - No i18n. "Viết câu", "Câu {i}/{n}", "Nhập tiếng Trung...", "💡 Cần gợi ý từ vựng?", "Hoàn thành 🎉", "Kiểm tra (Enter)", "Phát âm thanh", "Quay lại"
- `sentence-game-board.tsx` (client)
  - No i18n. "Sentence Forest", "Câu {i}/{n}", "Gợi ý / Giải thích", "Bấm chọn các từ bên dưới để ghép thành câu", "Câu trước", "Nộp bài", "Câu tiếp theo"
- `sentence-game-board.tsx` (also exports `SentenceResults`):
  - "Kết quả làm bài", "Điểm số: {x}/10", "Số câu đúng: {x}/{y}", "Câu {i}", "Đúng", "Sai", "Không có dữ liệu đáp án", "Dịch:", "Giải thích:", "Trở về trang chủ"
- `memory-board.tsx` (client)
  - No i18n. "Memory Grove", "{i}/{n} Cặp"
- `match-game-board.tsx` (client)
  - No i18n. "Panda Match Game", "{i}/{n} Pairs", "🎉 Hoàn thành! Đang nộp bài...", "Match Hán tự với Pinyin"
- `game-shared-ui.tsx` (client)
  - No i18n. "ĐIỂM", "{x}x Combo! 🔥", "{n} / {total}", "Hoàn thành! 🎉", "Xuất sắc!", "Tốt lắm!", "Cố gắng thêm nhé!", "Điểm", "Đúng", "Combo", "Sai", "🔄 Chơi lại", "← Thoát"
- `balloon-hud.tsx` (client)
  - No i18n. "ĐIỂM", "{combo}x Combo! 🔥", "Tiếp tục", "Tạm dừng", "Thu nhỏ", "Toàn màn hình", "{correct} / {total} từ"
- `balloon-mode.tsx` (client)
  - No i18n. "Xuất sắc!", "Tốt lắm!", "Cố gắng thêm nhé!", "Bạn đã hoàn thành trò chơi!", "Điểm", "Đúng", "Combo", "🎮 Chơi lại"
- `memory-mode.tsx` (client)
  - No i18n. "Cặp đã ghép: {x}/{y}", "Đúng {x} · Sai {y} · Lượt {z}", "Lật hai thẻ: một chữ Hán và một pinyin khớp nhau sẽ được giữ lại."
- `fill-game-board.tsx` (client)
  - No i18n. "Chọn từ đúng để điền vào chỗ trống"
- `fill-results.tsx` (client)
  - No i18n. "Hoàn thành Điền từ", "Chi tiết đáp án", "Câu {i}", "Đúng", "Sai", "Dịch:", "Giải thích:"
- `balloon-game-elements.tsx`, `game-decorations.tsx`, `match-game-tile.tsx`, `memory-card.tsx`, `sentence-token.tsx` — no vi strings

### features/live-quiz/
- `host/live-host-feature.tsx` (client)
  - No i18n. "Live Game Lobby", "Sinh viên cần nhập mã PIN bên dưới để tham gia", "Game PIN", "Lưu ý!", "Bài kiểm tra này chưa có câu hỏi nào. Bạn cần thêm câu hỏi trước khi tổ chức thi.", "{n} Học sinh", "Bắt đầu ngay", "Câu hỏi {i}/{n}", "Dừng & Xem Bảng xếp hạng", "Câu hỏi", "Bảng xếp hạng tạm thời", "Câu tiếp theo", "Đang chuẩn bị câu hỏi tiếp theo...", "{n} giây", "Kết quả chung cuộc", "{score} pt"
- `player/live-player-feature.tsx` (client)
  - No i18n. "Lỗi", "Không thể tham gia phòng", "Quay lại", "Bạn đã vào phòng!", "Đang chờ giáo viên bắt đầu...", "Điểm: {x}", "Câu {i}", "ĐÚNG", "SAI", "Câu hỏi này không hỗ trợ Live Quiz (hiện tại chỉ hỗ trợ Trắc nghiệm và Đúng/Sai).", "Chính xác!", "+{x} điểm", "Sai rồi!", "0 điểm", "Chờ bảng xếp hạng...", "Bảng xếp hạng", "Thứ hạng của bạn: ", "(Bạn)", "Câu tiếp theo sau {n}s", "Kết thúc!", "Bạn đạt hạng", "với {n} điểm", "Quay lại Dashboard"

---

## P2 — Already partially localized (need gap fill)

### features/student/settings-feature.tsx
- Uses `Settings` namespace (t('profile'), t('nameRequired'), ...) but buttons hardcode:
  - "Đang lưu..." (×3 in save buttons)
  - "Lưu Thay đổi"
  - "Thay đổi mật khẩu"
  - "Quên mật khẩu?"
- Missing keys needed: `settings.saving`, `settings.saveProfile`, `settings.savePassword`, `settings.forgotPassword`

---

## Notes

- `features/games/components/game-session.tsx` already localized per request — not re-audited.
- `features/practice/components/session.tsx` and `session-frame.tsx` already localized — not re-audited.
- `practice-models.ts`, `practice-engine.ts` (logic only), `hanzi-writer-canvas.tsx`, `hanzi-writer-animation.tsx`, `source-loader.ts`, `pinyin-utils.ts` — no user-facing Vietnamese except error strings inside `practice-engine.ts` (catch blocks) that surface as `engine.error`. Recommend moving them to a t() call inside the consumer.
- `student-resources-feature.tsx`, `student/profile-feature.tsx`, `student/upgrade-vip-feature.tsx`, `student/mistake-book-feature.tsx` already use t() — not re-audited.
- `useTranslations` namespaces in use today (per files): `Settings`, `Resources`, `Practice`. Recommend new namespaces: `SRS`, `Speaking`, `Study`, `Student`, `Games`, `LiveQuiz`, `Exam`, `Common`.

## Estimated scope

- ~50 files need l10n migration.
- P1 (12 files in student/speaking/srs/study/practice-hub): highest user impact, surface-visible.
- P2 (settings gap): trivial fix.
- P3 (game components): high count but mostly short strings; can be batched.
- P4 (livequiz): real-time UI but few distinct strings.

Total new translation keys (rough estimate): ~250 vi ↔ en pairs.
