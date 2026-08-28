# Phase 3: journeys/achievements.js (NEW)

## Context
Achievements module có 7 endpoint quan trọng (dashboard, timeline, heatmap, radar, rewards catalog/inventory/redeem) — hoàn toàn chưa được test. Sau practice/submit, server trigger EXP/streak/rewards — nếu chậm, user mất progress.

## Requirements
- GET /achievements (dashboard)
- GET /achievements/timeline
- GET /achievements/heatmap
- GET /achievements/radar
- GET /rewards
- GET /rewards/inventory
- POST /rewards/:id/redeem
- Counter `achievements_unlocked_total` (increment khi dashboard có streak>0 hoặc level>1)

## Architecture
- File mới `journeys/achievements.js` < 100 dòng
- Read-heavy + 1 write (redeem) — pattern tương tự student-learn

## Related Code Files
- NEW: `load-tests/journeys/achievements.js`

## Implementation Steps
1. Tạo file với hàm `achievementsJourney(data)`
2. Pick token round-robin
3. GET /achievements → check 200 + có `streak` field
4. GET /achievements/timeline?range=week → check 200
5. GET /achievements/heatmap → check 200 (test N+1 query risk)
6. GET /achievements/radar → check 200
7. GET /rewards → lấy list, pick first rewardId
9. GET /rewards/inventory → check 200
10. POST /rewards/:id/redeem → check 2xx (có thể 409 nếu user đã redeem — accept vì idempotency key)

## Success Criteria
- [ ] File < 100 dòng
- [ ] 7 endpoint covered
- [ ] Counter `achievements_unlocked_total` hoạt động
- [ ] Smoke pass

## Risk
- Redeem cần reward đã seed → cần `npm run seed:rewards` trước
- Timeline/heatmap aggregation có thể N+1 → chính là test point