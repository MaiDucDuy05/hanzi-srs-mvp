// Cấu hình môi trường + credential cho k6.
// Base URL theo K6_ENV (local|staging|prod) hoặc override qua K6_BASE_URL.
// Credential = seed user từ backend (`npm run seed:users`, password Test@1234).
// Login throttle backend = 10/min/IP → pool size giữ ≤ 110 (stagger 0.6s = ~66s setup).
//   - 100 student đủ cho stress 1000 VU ~10 VU/user (tránh session contamination).

const ENV_MAP = {
  local: 'http://localhost:8000',
  staging: 'https://staging-api.hanzi.dev',
  prod: 'https://api.hanzi.dev',
};

export const BASE_URL =
  __ENV.K6_BASE_URL || ENV_MAP[__ENV.K6_ENV || 'local'] || 'http://localhost:8000';

export const API_PREFIX = '/api/v1';

export const SEED_PASSWORD = __ENV.K6_SEED_PWD || 'Test@1234';

// 103 user = 1 admin + 2 teacher + 100 student. Round-robin pool đủ cho 1000 VU.
// Các email hocvien6-100 được generate tự động trong seed-users.ts.
export const SEED_USERS = [
  { email: 'admin@hanzi.dev', role: 'ADMIN' },
  { email: 'hocvien1@hanzi.dev', role: 'FREE' },
  { email: 'hocvien2@hanzi.dev', role: 'FREE' },
  { email: 'hocvien3@hanzi.dev', role: 'FREE' },
  { email: 'hocvien4@hanzi.dev', role: 'FREE' },
  { email: 'hocvien5@hanzi.dev', role: 'FREE' },
  { email: 'giangvien@hanzi.dev', role: 'TEACHER' },
  { email: 'co_truong@hanzi.dev', role: 'TEACHER' },
  ...Array.from({ length: 495 }, (_, i) => ({
    email: `hocvien${i + 6}@hanzi.dev`,
    role: 'FREE',
  })),
];

/** Ghép BASE_URL + /api/v1 + path. */
export function apiUrl(path) {
  return `${BASE_URL}${API_PREFIX}${path}`;
}