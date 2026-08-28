# Phase 1: lib custom metrics (Counter)

## Context
Hiện journey chỉ emit HTTP metric built-in. Cần thêm business metric để verify flow nghiệp vụ chạy đúng (không phải chỉ status 200).

## Requirements
- `practice_attempts_total{type}` — mỗi attempt start thành công
- `practice_submits_total{type}` — mỗi submit thành công
- `srs_reviews_total{rating}` — AGAIN/HARD/GOOD/EASY
- `achievements_unlocked_total` — dashboard có streak>0 / level>0
- `business_errors_total{code}` — status 4xx/5xx không phải 429 throttle
- `quota_blocked_total` — checkLimit trả allowed=false (429/200)

## Architecture
- Counter khai báo trong `lib/metrics.js` (file mới), export instance.
- Journey gọi `metrics.practiceAttempts.add(1, { type: 'FLASHCARD' })` sau check 2xx.
- File < 50 dòng, không có logic khác.

## Related Code Files
- NEW: `load-tests/lib/metrics.js`
- UPDATE: tất cả journeys (Phase 2-7) sẽ import metrics

## Implementation Steps
1. Tạo `load-tests/lib/metrics.js`:
   - import `Counter` từ 'k6/metrics'
   - export object chứa 5 Counter instance
   - Export helper `tagged(name, tags)` để chuẩn hóa
2. Cập nhật `lib/reporting.js` để include custom Counter trong HTML table (optional, nice-to-have)
3. Verify `npm run load:smoke` exit 0 với metric mới trong JSON report

## Success Criteria
- [ ] File metrics.js < 50 dòng
- [ ] Import không crash
- [ ] Counter xuất hiện trong `reports/*.json` sau smoke

## Risk
- Không có — chỉ là khai báo Counter, không đụng logic.