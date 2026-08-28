# Phase 10: Compose scenarios + update CI

## Context
Sau Phase 1-9, có nhiều journey mới. Cần update scenarios (smoke/load/stress/spike/soak) để mix các journey đúng tỉ lệ thực tế.

## Requirements
- smoke.js: thêm achievements + practice-variants vào student/admin mix
- load.js: tăng VU student → thêm journey mix
- stress.js: tương tự + thêm error-cases ở rate thấp
- soak.js: thêm achievements (test aggregation query leak)
- spike.js: chỉ student core
- errors.js (NEW): 5 VU / 30s — error-cases journey
- CI workflow: thêm step chạy error scenario sau smoke

## Architecture
- Sửa 5 scenario file hiện có + thêm 1 mới
- Mix ratio: student 60%, achievements 15%, practice-variants 15%, admin 5%, error 5% (peak)

## Related Code Files
- UPDATE: `load-tests/scenarios/smoke.js`
- UPDATE: `load-tests/scenarios/load.js`
- UPDATE: `load-tests/scenarios/stress.js`
- UPDATE: `load-tests/scenarios/spike.js`
- UPDATE: `load-tests/scenarios/soak.js`
- NEW: `load-tests/scenarios/errors.js`
- UPDATE: `.github/workflows/load-smoke.yml`

## Implementation Steps
1. Smoke (3 VU max): student + admin + achievements (1 VU each)
2. Load (500 VU peak): student 350 + achievements 50 + practice-variants 50 + admin 50
3. Stress (1000 VU peak): student 700 + achievements 100 + practice-variants 100 + admin 50 + error 50
4. Spike (500 VU 2m): student 400 + achievements 100
5. Soak (100 VU 1h): student 60 + achievements 20 + practice-variants 20
6. Errors (5 VU 30s): error-cases 5
7. CI workflow: thêm step `npm run load:smoke` + `npm run load:errors` song song
8. Update `package.json` script: `load:errors`
9. Update reporting.js: thêm metric custom vào HTML table

## Success Criteria
- [ ] 6 scenario chạy đúng
- [ ] Mix journey xuất hiện trong report
- [ ] CI workflow có 2 step smoke + errors
- [ ] `npm run load:smoke` exit 0 local
- [ ] `npm run load:errors` exit 0 local

## Risk
- Stress mix 1000 VU trên local có thể OOM hoặc treo DB
- Mitigation: chỉ chạy smoke + errors trên CI, stress manual