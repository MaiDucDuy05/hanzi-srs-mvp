# Phase 7: journeys/error-cases.js (NEW)

## Context
Journey nào cũng check status 200 — không test error path. Validator lỏng, JWT misconfig, rate-limit edge case sẽ không phát hiện nếu không test explicit.

## Requirements
- GET /auth/me không có cookie → 401
- GET endpoint không tồn tại /api/v1/nonexistent → 404
- POST /auth/login với payload invalid → 400/422
- GET /admin/* với FREE token → 403
- Counter `business_errors_total{code,endpoint}` (404, 401, 403, 422, 500)

## Architecture
- File mới < 80 dòng
- Chạy riêng scenario error ở 5 VU (low concurrency, verify behavior)
- KHÔNG fail threshold khi gặp expected error — chỉ count

## Related Code Files
- NEW: `load-tests/journeys/error-cases.js`
- NEW: `load-tests/scenarios/error.js` (lightweight, 5 VU)

## Implementation Steps
1. Tạo file với `errorCasesJourney(data)`
2. Step 1 — Unauth: clear cookie jar, GET /auth/me → expect 401
3. Step 2 — 404: GET /api/v1/nonexistent → expect 404
4. Step 3 — Validation 400: POST /auth/login {} (no email) → expect 400
5. Step 4 — Authz 403: set FREE cookie, GET /admin/courses → expect 403
6. Step 5 — Restore admin cookie sau đó
7. Counter increment cho mỗi expected error code
8. Tạo scenario error.js 5 VU / 30s

## Success Criteria
- [ ] File < 80 dòng
- [ ] Counter `business_errors_total{code}` có data trong report
- [ ] Scenario error.js chạy riêng được
- [ ] Smoke + error scenario pass

## Risk
- 401/403 expected → threshold không fail vì `http_req_failed{type:read}` đếm cả expected errors
- Mitigation: tag error cases `status:expected` để threshold loại trừ
- Hoặc: scenario error không dùng threshold strict (chỉ check Counter pass)