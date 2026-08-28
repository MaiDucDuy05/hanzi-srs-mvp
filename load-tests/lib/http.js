import http from 'k6/http';
import { check } from 'k6';
import { apiUrl, BASE_URL } from '../config/environments.js';

// Wrapper k6 http: gắn tag type (read|write) + endpoint để threshold lọc theo nhóm + endpoint.
// Cookie jar per-VU — login set cookie 1 lần, các request sau tự gửi.

// Extract base endpoint từ path (VD: /courses/123?skip=0 → courses, /user/recommended-lessons → user/recommended).
// Rule: first 1-2 non-ID segments (ID = UUID/number, or nested path).
function getEndpoint(path) {
  // Loại bỏ query string
  const cleanPath = path.split('?')[0];
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) return 'unknown';

  // UUID/number pattern
  const isId = (s) => /^[0-9a-f-]{36}$/.test(s) || /^\d+$/.test(s);

  // Lấy 2 segments đầu, bỏ ID. VD: [courses, 123] → courses, [student, recommended-lessons] → student/recommended-lessons
  const nonIdSegments = [];
  for (let i = 0; i < Math.min(3, segments.length); i++) {
    if (!isId(segments[i])) {
      nonIdSegments.push(segments[i]);
      if (nonIdSegments.length === 2) break; // Giới hạn 2 segment
    }
  }

  return nonIdSegments.join('/') || segments[0]; // Fallback segment đầu tiên
}

/** GET — tag read + endpoint. */
export function get(path, params = {}) {
  const endpoint = getEndpoint(path);
  return http.get(apiUrl(path), { tags: { type: 'read', endpoint }, ...params });
}

/** POST — tag write + endpoint, body JSON. */
export function post(path, body, params = {}) {
  const endpoint = getEndpoint(path);
  return http.post(apiUrl(path), JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    tags: { type: 'write', endpoint },
    ...params,
  });
}

/** PATCH — tag write + endpoint, body JSON. */
export function patch(path, body, params = {}) {
  const endpoint = getEndpoint(path);
  return http.patch(apiUrl(path), JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    tags: { type: 'write', endpoint },
    ...params,
  });
}

/** DELETE — tag write + endpoint. */
export function del(path, params = {}) {
  const endpoint = getEndpoint(path);
  return http.del(apiUrl(path), { tags: { type: 'write', endpoint }, ...params });
}

/** Login → trả access_token từ Set-Cookie. Dùng trong setup() (không trong default fn). */
export function login(email, password) {
  const res = http.post(apiUrl('/auth/login'), JSON.stringify({ email, password }), {
    headers: { 'content-type': 'application/json' },
    tags: { type: 'write' },
  });
  const token = res.cookies.access_token?.[0]?.value;
  check(res, { 'login 200': (r) => r.status === 200 });
  if (!token) console.error(`login fail ${email}: status=${res.status} body=${res.body}`);
  return token;
}

/** Set access_token cookie cho VU hiện tại (cookie jar per-VU). */
export function setAuthCookie(token) {
  http.cookieJar().set(BASE_URL, 'access_token', token, { path: '/' });
}

/** Parse body JSON an toàn. */
export function parseBody(res) {
  try {
    return JSON.parse(res.body);
  } catch {
    return null;
  }
}
