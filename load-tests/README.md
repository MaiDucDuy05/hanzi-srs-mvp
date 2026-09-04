# Load Tests — Hanzi SRS

Hệ thống load test cho backend NestJS. Xem [`ARCHITECTURE.md`](./ARCHITECTURE.md) cho design đầy đủ (ADR + diagram + profile).

## Tool
- **k6** (Grafana) — REST load test. Cài:
  - macOS: `brew install k6`
  - Windows: `choco install k6` (hoặc `scoop install k6`)
  - Docker: `docker run --rm -i -v "$PWD":/app grafana/k6 run /app/scenarios/smoke.js`
- **Node.js** — cho live-quiz socket.io script (`socket.io-client`).

## Prerequisites
1. Backend chạy `:8000` — `cd ../backend && npm run dev`.
2. Seed user — `cd ../backend && npm run seed:users` (tạo `admin@hanzi.dev` + `hocvien1-5@hanzi.dev`, password `Test@1234`).
3. Cài dep — `npm install` (trong `load-tests/`).

## Run
| Lệnh | Mô tả | Khi chạy |
|------|-------|----------|
| `npm run load:smoke` | Smoke 5 VU / 30s — sanity (4 journey: student + admin + achievements + practice-variants) | Mỗi PR |
| `npm run load:load` | Load 50→500 VU / 10m — peak (5 journey mix) | Nightly / pre-release |
| `npm run load:stress` | Stress →1000 VU / 5m — tìm điểm gãy (6 journey mix + error 50 VU) | Manual |
| `npm run load:spike` | Spike 0→500 tức thời / 2m — surge | Manual |
| `npm run load:soak` | Soak 100 VU / 1h — leak | Weekly |
| `npm run load:errors` | Error-cases 5 VU / 30s — 401/403/404/422 | Sau smoke |
| `npm run load:ws` | Live-quiz socket.io (Node) | Manual |
| `npm run bench:api` | Micro-benchmark 1 endpoint (autocannon) | Dev |

Target env: `K6_ENV=staging npm run load:smoke` hoặc `K6_BASE_URL=https://... npm run load:smoke`.

## Journeys (coverage)
| File | Endpoints chính | Loại |
|------|----------------|------|
| `auth.js` | POST /auth/login (setup) + GET /auth/me | read |
| `student-learn.js` | courses, lessons, practice-attempts, srs, complete-vocab/grammar, progress | read+write |
| `admin-curriculum.js` | 6 admin GET + POST/PATCH/DELETE vocab (writeJourney) | read+write |
| `achievements.js` | achievements dashboard/timeline/heatmap/radar + rewards catalog/inventory/redeem | read+1write |
| `practice-variants.js` | fill-blank, sentence-ordering, hanzi-writing start+submit | write |
| `subscription-quota.js` | checkLimit 4 activityKey (FREE user) | read |
| `error-cases.js` | 404, 400, 401, 403 (expected) | error |

## Notes quan trọng
- **Login throttle**: backend giới hạn `POST /auth/login` 10/min/IP (chống brute-force). Pool 103 user trong setup() stagger 0.6s → ~62s setup (acceptable). **Đừng test login ở 500 RPS từ 1 runner** — đó là design feature. Muốn test login tải cao: tạm raise throttle trong `backend/src/app.module.ts`.
- **Custom metrics**: `practice_attempts_total`, `practice_submits_total`, `srs_reviews_total`, `achievements_unlocked_total`, `admin_writes_total`, `quota_blocked_total`, `quota_passed_total`, `business_errors_total` — xem trong `reports/*.json` sau run.
- **Teardown**: smoke/load/stress/soak auto-cleanup vocab `loadtest_*` qua `lib/cleanup.js`. Cần backend có `DELETE /admin/vocabularies/__test_cleanup__?prefix=` (đã thêm trong `admin-vocabularies-test-cleanup.controller.ts`).
- **Soak/Stress tốn tài nguyên + thời gian**: chạy manual, không auto CI.
- **Report**: `reports/<profile>-<timestamp>.{json,html}` (gitignored).
- **Local results = indicative** — số liệu chính thức cần runner riêng / staging.
