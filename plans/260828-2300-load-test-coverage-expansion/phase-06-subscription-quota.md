# Phase 6: journeys/subscription-quota.js (NEW)

## Context
Subscription module enforce quota daily cho FREE user (PR-14). Chưa test endpoint `POST /daily-usage/checkLimit`. Cần verify:
- FREE user bị block sau N lượt → trả `allowed: false`
- VIP user không bị block
- Quota không bị tăng khi gọi checkLimit (pure peek theo comment)

## Requirements
- POST /daily-usage/checkLimit với activityKey FLASHCARD
- Counter `quota_blocked_total` (increment khi allowed=false)
- Counter `quota_passed_total` (increment khi allowed=true)

## Architecture
- File mới < 80 dòng
- Dùng FREE user (hocvien1, hocvien4) → khi quota hết sẽ trả 200 + allowed=false
- Không cần tạo practice thật — peek không tăng counter

## Related Code Files
- NEW: `load-tests/journeys/subscription-quota.js`

## Implementation Steps
1. Tạo file với `subscriptionQuotaJourney(data)`
2. Pick FREE token (filter role FREE)
3. POST /daily-usage/checkLimit {activityKey: 'FLASHCARD'}
4. Check response `data.allowed` — increment counter tương ứng
5. Repeat 3 lần với activityKey khác (FILL_BLANK, HANZI_WRITING)
6. Có thể spam tới khi quota hết → verify block

## Success Criteria
- [ ] File < 80 dòng
- [ ] Counter `quota_blocked_total` hoạt động
- [ ] Smoke pass

## Risk
- Không có — checkLimit là read-only (peek)
- FREE user pool chỉ 5, có thể bị ăn quota từ journey khác → dùng user riêng nếu cần