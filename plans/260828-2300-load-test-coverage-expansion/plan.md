# Plan: Load-Test Coverage Expansion

## Context
Hệ thống load-test k6 hiện tại (`load-tests/`) có **infrastructure tốt** (5 profile, threshold, CI) nhưng **journey coverage ~35%** nghiệp vụ thật:
- Thiếu write path của student (complete-vocab, complete-grammar)
- Thiếu achievements/gamification (heatmap, timeline, rewards)
- Thiếu practice variants (fill-blank, sentence-ordering, hanzi-writing — core MVP feature)
- Thiếu subscription quota (429 enforcement)
- Thiếu error cases (401/403/404/422)
- Thiếu teardown DB cleanup
- Thiếu business custom metrics
- Admin journey read-only, không có write

Review chi tiết xem tại `reports/load-test-review-2026-08-28.md` (sẽ sinh khi report phase xong).

## Phases

| # | Phase | Priority | Status |
|---|-------|----------|--------|
| 1 | lib custom metrics (Counter) | 🔴 | pending |
| 2 | student-learn.js — add complete-vocab/grammar + recommended | 🔴 | pending |
| 3 | journeys/achievements.js (NEW) | 🔴 | pending |
| 4 | journeys/practice-variants.js (NEW) | 🔴 | pending |
| 5 | admin-curriculum.js — write operations | 🟠 | pending |
| 6 | journeys/subscription-quota.js (NEW) | 🟠 | pending |
| 7 | journeys/error-cases.js (NEW) | 🟠 | pending |
| 8 | teardown() DB cleanup trong scenarios | 🟠 | pending |
| 9 | Scale seed users 8 → 100+ | 🟡 | pending |
| 10 | Compose new scenarios + update CI workflow | 🟡 | pending |

## Không làm (đã đánh giá)
- **Refresh-on-401** (ADR-003): backend **không có `/auth/refresh`**, token 7-day HttpOnly cookie, không khả thi. Soak 1h không hit expiry. → BỎ.
- **WS distributed load** (>500 students): Node script đủ cho MVP. Future work khi scale.
- **Grafana/Prometheus trend**: ARCHITECTURE §7 future, ngoài scope hiện tại.

## Success Criteria
- [ ] Tất cả journey mới chạy được trong `npm run load:smoke` exit 0
- [ ] Counter `practice_attempts_total{type}` xuất hiện trong JSON report
- [ ] Counter `business_errors_total{code}` xuất hiện trong JSON report
- [ ] Threshold pass khi smoke chạy local backend
- [ ] Mỗi file code < 200 dòng (theo CLAUDE.md)
- [ ] Tất cả journeys có check() assertion
- [ ] Teardown không để lại attempt/rating orphan
- [ ] CI workflow `.github/workflows/load-smoke.yml` vẫn pass

## Risks
| Risk | Mitigation |
|------|-----------|
| Backend không chạy local | Smoke fail có log rõ, threshold fail rõ ràng |
| Practice variants cần DB có vocab data | Cần `npm run seed:curriculum` + `seed:topics` + `seed:practice` trước |
| Hanzi writing cần Hanzi data đặc biệt | Start với lessonId đã biết, fallback nếu DB rỗng |
| Admin write cần quyền admin + có thể gây data pollution | Dùng idempotent test vocabulary (mark prefix `loadtest_`) |
| Teardown xóa nhầm data thật | Chỉ xóa record có prefix `loadtest_` hoặc user từ pool |

## Unresolved Questions
- (none)

## Links
- ARCHITECTURE.md (current state)
- Reports: xem từng phase khi hoàn thành