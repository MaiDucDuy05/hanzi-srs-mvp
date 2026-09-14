import { sleep, check } from 'k6';
import { SEED_USERS, SEED_PASSWORD } from '../config/environments.js';
import { login, setAuthCookie, get, parseBody } from '../lib/http.js';

// Auth journey: loginPool (setup) + meJourney (/auth/me dưới tải).
// Login endpoint bị throttle 10/min/IP → KHÔNG hammer login trong default fn.
// Setup login pool ≤ 8 user (< 10/min), share token cho VU round-robin.

/** Chạy trong k6 setup() — login pool seed user, trả [{token, role, email}]. */
export function loginPool() {
  const pool = [];
  for (const u of SEED_USERS) {
    const token = login(u.email, SEED_PASSWORD);
    if (token) pool.push({ token, role: u.role, email: u.email });
    sleep(0.1); // giảm xuống 0.1s vì đã nới lỏng Throttle, giúp login 500 users mất ~50s
  }
  if (pool.length === 0) {
    throw new Error('loginPool rỗng — kiểm tra backend :8000 + npm run seed:users + password Test@1234');
  }
  return pool;
}

/** Pick token round-robin theo VU id. */
export function pickToken(data) {
  return data[__VU % data.length];
}

/** Journey GET /auth/me — auth guard dưới tải (không login). */
export function meJourney(data) {
  const { token } = pickToken(data);
  setAuthCookie(token);
  const res = get('/auth/me');
  check(res, {
    'me 200': (r) => r.status === 200,
    'me có user': (r) => parseBody(r)?.data?.user?.email != null,
  });
  sleep(1);
}
