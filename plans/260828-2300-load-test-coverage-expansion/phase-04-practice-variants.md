# Phase 4: journeys/practice-variants.js (NEW)

## Context
Practice hiện test 1/6 variants (FLASHCARD). Hanzi-writing là **core MVP signature feature**, fill-blank + sentence-ordering là core grammar/vocab practice. Stress chỉ test FLASHCARD → 5/6 variants chưa từng chạy dưới tải.

## Requirements
- Fill-blank: POST /practice/fill-blank/start + POST /practice/fill-blank/:id/submit
- Sentence-ordering: POST /practice/sentence-ordering/start + POST /practice/sentence-ordering/:id/submit
- Hanzi-writing: POST /practice/hanzi-writing/start + POST /practice/hanzi-writing/:id/complete
- Counter `practice_attempts_total{type}` (FLASHCARD, FILL_BLANK, SENTENCE_ORDERING, HANZI_WRITING)
- Counter `practice_submits_total{type}`

## Architecture
- File mới `journeys/practice-variants.js` < 150 dòng
- Mỗi variant có 2 step (start + submit), share logic qua helper

## Related Code Files
- NEW: `load-tests/journeys/practice-variants.js`

## Implementation Steps
1. Tạo file với hàm `practiceVariantsJourney(data)`
2. Helper `startAndSubmit(startPath, submitPath, bodyFn)` — start, lấy attemptId, build submit body, submit
3. Step 1 — Browse lesson (reuse `pickRandom(get('/course-lessons'))` pattern)
4. Step 2 — Fill-blank:
   - POST /practice/fill-blank/start {lessonId}
   - Submit với answer dummy (tokenId từ response question list)
5. Step 3 — Sentence-ordering: tương tự
6. Step 4 — Hanzi-writing:
   - POST /practice/hanzi-writing/start {lessonId}
   - POST complete với result array
7. Counter increment khi start 2xx + submit 2xx

## Success Criteria
- [ ] File < 150 dòng
- [ ] 6 endpoint mới covered (3 start + 3 submit)
- [ ] Counter `practice_attempts_total{type}` có 4 distinct value trong report
- [ ] Smoke pass

## Risk
- Submit với dummy answer có thể fail grading (expected — chỉ check API chấp nhận 2xx, không check điểm đúng)
- Hanzi writing cần chars từ DB → lesson phải có vocab — check null trước
- Nếu server trả 4xx validation, log warning (không fail test) — grading không quan trọng