// Thresholds (pass/fail gate) cho k6. Tag mỗi request `type:read|write` + `endpoint` để lọc.
// Scenario import object này (hoặc stressThresholds) vào options.thresholds.
// Endpoint key PHẢI khớp với getEndpoint() trong lib/http.js:
//   /courses              → courses
//   /course-lessons       → course-lessons
//   /auth/me              → auth/me
//   /practice-questions   → practice-questions
//   /practice-attempts    → practice-attempts
//   /student/recommended  → student/recommended-lessons
//   /srs/due + /srs/review → srs/due, srs/review
//   /student/progress     → student/progress
//   /achievements         → achievements
//   /vocabularies         → vocabularies

// Mặc định: error < 1%, p95 read < 200ms, p95 write < 500ms, checks > 99%.
export const thresholds = {
  // Global by type
  'http_req_failed{type:read}': ['rate<0.01'],
  'http_req_failed{type:write}': ['rate<0.01'],
  'http_req_duration{type:read}': ['p(95)<200', 'p(99)<1000'],
  'http_req_duration{type:write}': ['p(95)<500', 'p(99)<1000'],
  checks: ['rate>0.99'],

  // Per-endpoint: critical fast path
  'http_req_duration{endpoint:auth/me}': ['p(95)<300', 'p(99)<1000'],
  'http_req_duration{endpoint:courses}': ['p(95)<250', 'p(99)<1000'],
  'http_req_duration{endpoint:course-lessons}': ['p(95)<300', 'p(99)<1500'],
  'http_req_duration{endpoint:student/recommended-lessons}': ['p(95)<400', 'p(99)<2000'],
  'http_req_duration{endpoint:practice-questions}': ['p(95)<300', 'p(99)<1500'],
  'http_req_duration{endpoint:practice-attempts}': ['p(95)<400', 'p(99)<2000'],
  'http_req_duration{endpoint:srs/due}': ['p(95)<300', 'p(99)<1500'],
  'http_req_duration{endpoint:srs/review}': ['p(95)<400', 'p(99)<2000'],
  'http_req_duration{endpoint:student/progress}': ['p(95)<300', 'p(99)<1500'],
  'http_req_duration{endpoint:vocabularies}': ['p(95)<300', 'p(99)<1500'],
  'http_req_duration{endpoint:achievements}': ['p(95)<250', 'p(99)<1000'],
  'http_req_duration{endpoint:tests}': ['p(95)<300', 'p(99)<1500'],
  'http_req_duration{endpoint:test-assignments}': ['p(95)<300', 'p(99)<1500'],
  'http_req_duration{endpoint:test-questions}': ['p(95)<300', 'p(99)<1500'],
  'http_req_duration{endpoint:test-attempts}': ['p(95)<500', 'p(99)<2000'],

  // Per-endpoint error rate
  'http_req_failed{endpoint:auth/me}': ['rate<0.01'],
  'http_req_failed{endpoint:courses}': ['rate<0.01'],
  'http_req_failed{endpoint:practice-attempts}': ['rate<0.01'],
  'http_req_failed{endpoint:srs/review}': ['rate<0.01'],
  'http_req_failed{endpoint:test-attempts}': ['rate<0.01'],
};

// Stress: lỏng hơn — chấp nhận error tới 5%, p95 write tới 1500ms (gần điểm gãy).
export const stressThresholds = {
  // Global by type
  'http_req_failed{type:read}': ['rate<0.05'],
  'http_req_failed{type:write}': ['rate<0.05'],
  'http_req_duration{type:read}': ['p(95)<500', 'p(99)<2000'],
  'http_req_duration{type:write}': ['p(95)<1500', 'p(99)<3000'],
  checks: ['rate>0.95'],

  // Per-endpoint: relax during stress but still catch gross issues
  'http_req_duration{endpoint:auth/me}': ['p(95)<800', 'p(99)<3000'],
  'http_req_duration{endpoint:courses}': ['p(95)<800', 'p(99)<3000'],
  'http_req_duration{endpoint:course-lessons}': ['p(95)<1000', 'p(99)<3000'],
  'http_req_duration{endpoint:student/recommended-lessons}': ['p(95)<1000', 'p(99)<3000'],
  'http_req_duration{endpoint:practice-questions}': ['p(95)<1000', 'p(99)<3000'],
  'http_req_duration{endpoint:practice-attempts}': ['p(95)<1500', 'p(99)<4000'],
  'http_req_duration{endpoint:srs/due}': ['p(95)<1000', 'p(99)<3000'],
  'http_req_duration{endpoint:srs/review}': ['p(95)<1000', 'p(99)<3000'],
  'http_req_duration{endpoint:student/progress}': ['p(95)<1000', 'p(99)<3000'],
  'http_req_duration{endpoint:vocabularies}': ['p(95)<1000', 'p(99)<3000'],
  'http_req_duration{endpoint:achievements}': ['p(95)<800', 'p(99)<3000'],
  'http_req_duration{endpoint:tests}': ['p(95)<1000', 'p(99)<3000'],
  'http_req_duration{endpoint:test-assignments}': ['p(95)<1000', 'p(99)<3000'],
  'http_req_duration{endpoint:test-questions}': ['p(95)<1000', 'p(99)<3000'],
  'http_req_duration{endpoint:test-attempts}': ['p(95)<1500', 'p(99)<4000'],

  // Per-endpoint error rate
  'http_req_failed{endpoint:courses}': ['rate<0.05'],
  'http_req_failed{endpoint:practice-attempts}': ['rate<0.05'],
  'http_req_failed{endpoint:srs/review}': ['rate<0.05'],
  'http_req_failed{endpoint:test-attempts}': ['rate<0.05'],
};

// Mục tiêu WebSocket (live-quiz) — dùng trong Node script, k6 không track.
export const wsTargets = {
  connectMs: 500,
  msgLatencyMs: 300,
  errorRate: 0.02,
};

