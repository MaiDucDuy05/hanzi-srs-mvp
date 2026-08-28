import http from 'k6/http';
import { check } from 'k6';
import { apiUrl, BASE_URL } from '../config/environments.js';

// Cleanup test data sau khi scenario kết thúc. Gọi admin endpoint xóa vocab có
// prefix `loadtest_` (do admin write journey tạo ra). Nếu backend chưa có
// endpoint thì log warning — không fail teardown.
//
// Lý do cần teardown: soak 1h có thể tạo 1000+ vocab rác → DB pollution,
// test lần sau thấy data từ test cũ, SRS due ngày hôm sau có rating từ VU cũ.

/** Gọi admin endpoint xóa vocab theo prefix. Trả {deleted, errors}. */
export function teardownTestData(data) {
  const admin = data.find((d) => d.role === 'ADMIN') ?? data[0];
  if (!admin?.token) {
    console.warn('teardown: no admin token — skip');
    return { deleted: 0, errors: 0 };
  }

  // Set admin cookie.
  http.cookieJar().set(BASE_URL, 'access_token', admin.token, { path: '/' });

  const res = http.post(apiUrl('/admin/test-data/cleanup?prefix=loadtest_'), null, {
    tags: { type: 'write', cleanup: 'true' },
  });

  check(res, {
    'cleanup endpoint reachable': (r) => r.status < 500,
  });

  if (res.status === 404) {
    console.warn('teardown: /admin/vocabularies/__test_cleanup__ chưa có — backend cần implement');
    return { deleted: 0, errors: 0 };
  }
  if (res.status >= 200 && res.status < 300) {
    const body = JSON.parse(res.body || '{}');
    const deleted = body?.data?.deleted ?? 0;
    console.log(`teardown: deleted ${deleted} test vocabularies`);
    return { deleted, errors: 0 };
  }
  console.warn(`teardown: unexpected status ${res.status}`);
  return { deleted: 0, errors: 1 };
}