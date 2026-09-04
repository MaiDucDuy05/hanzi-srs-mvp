import { sleep, check } from 'k6';
import http from 'k6/http';
import { post, get, patch, setAuthCookie, parseBody } from '../lib/http.js';
import { pickToken } from './auth.js';
import { apiUrl } from '../config/environments.js';
import { businessErrors } from '../lib/metrics.js';

// Error cases journey: gọi endpoint có chủ đích để trigger 401/403/404/422.
// KHÔNG tính là "failed request" cho threshold (chỉ increment business_errors_total).
// Verify: validator hoạt động, RBAC enforce, 404 đúng convention.

/** Gọi request không có cookie (noAuth). Dùng raw http với cookieJar empty. */
function noAuthGet(path) {
  return http.get(apiUrl(path), {
    cookies: { access_token: '' },
    tags: { type: 'read-expected-error', expected_error: 'auth' },
  });
}

export function errorCasesJourney(data) {
  const t = pickToken(data);
  setAuthCookie(t.token);

  // 1) 404 — endpoint không tồn tại.
  let res = http.get(apiUrl('/__nonexistent_endpoint_404__'), {
    tags: { type: 'read-expected-error', expected_error: 'not_found' },
  });
  check(res, { '404 not found': (r) => r.status === 404 });
  if (res.status === 404) businessErrors.add(1);
  sleep(0.3);

  // 2) 400/422 — POST practice-attempt với payload invalid (thiếu sourceType).
  //    Tránh /auth/login vì throttle 100/min/IP → test sẽ bị 429.
  res = post('/practice-attempts', { practiceType: 'INVALID' }, { tags: { type: 'write-expected-error' } });
  check(res, {
    'invalid practice 400/422': (r) => r.status === 400 || r.status === 422,
  });
  if (res.status === 400 || res.status === 422) businessErrors.add(1);
  sleep(0.3);

  // 3) 401 — /auth/me không gửi cookie (raw http với empty cookie).
  res = noAuthGet('/auth/me');
  check(res, { 'unauth 401': (r) => r.status === 401 });
  if (res.status === 401) businessErrors.add(1);
  sleep(0.3);

  // 4) 403 — set FREE token, gọi admin endpoint.
  const free = data.find((d) => d.role === 'FREE') ?? data[0];
  setAuthCookie(free.token);
  res = get('/admin/courses', { tags: { type: 'read-expected-error' } });
  check(res, {
    'admin as free 403': (r) => r.status === 403 || r.status === 401,
  });
  if (res.status === 403 || res.status === 401) businessErrors.add(1);
  sleep(0.3);

  // 5) Restore admin token để các VU sau không bị stale cookie.
  const admin = data.find((d) => d.role === 'ADMIN') ?? t;
  setAuthCookie(admin.token);
  res = get('/admin/courses');
  check(res, { 'admin restored 200': (r) => r.status === 200 });

  // ─ Quiz-Specific Error Cases (PR-05) ────────────────────────────────

  // 6) 404 — POST /test-attempts với invalid testId (fake UUID).
  const fakeTestId = '550e8400-e29b-41d4-a716-446655440000';
  res = post('/test-attempts', { testId: fakeTestId }, { tags: { type: 'write-expected-error' } });
  check(res, { 'invalid testId 404/400': (r) => r.status === 404 || r.status === 400 });
  if ([404, 400].includes(res.status)) businessErrors.add(1);
  sleep(0.3);

  // 7) 400 — POST /test-attempts với invalid body (missing testId).
  res = post('/test-attempts', { assignmentId: 'random' }, { tags: { type: 'write-expected-error' } });
  check(res, { 'missing testId 400/422': (r) => r.status === 400 || r.status === 422 });
  if ([400, 422].includes(res.status)) businessErrors.add(1);
  sleep(0.3);

  // 8) 404 — GET /test-attempts/:id với invalid attemptId (fake UUID).
  const fakeAttemptId = '550e8400-e29b-41d4-a716-446655440001';
  res = get(`/test-attempts/${fakeAttemptId}`, { tags: { type: 'read-expected-error' } });
  check(res, { 'invalid attemptId 404': (r) => r.status === 404 });
  if (res.status === 404) businessErrors.add(1);
  sleep(0.3);

  // 9) 400 — PATCH /test-attempts/:id với missing durationSeconds.
  //    Use fake ID để trigger 404 trước (không care about 400 validation order)
  res = patch(`/test-attempts/${fakeAttemptId}`, {}, { tags: { type: 'write-expected-error' } });
  check(res, { 'patch attempt 400/404': (r) => r.status === 400 || r.status === 404 });
  if ([400, 404].includes(res.status)) businessErrors.add(1);
  sleep(0.3);

  // 10) 404 — GET /test-questions?testId=invalid
  res = get('/test-questions?testId=invalid', { tags: { type: 'read-expected-error' } });
  check(res, { 'invalid testId query 400/404': (r) => r.status === 400 || r.status === 404 });
  if ([400, 404].includes(res.status)) businessErrors.add(1);
  sleep(0.3);
}