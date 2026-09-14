import { sleep, check } from 'k6';
import { get, post, patch, del, setAuthCookie, parseBody } from '../lib/http.js';
import { think } from '../lib/data.js';
import { adminWrites } from '../lib/metrics.js';

// Journey admin curriculum:
//   - read (list các resource admin) — quyền ADMIN
//   - write (create + update vocab) — test DB contention
// Cần token ADMIN trong pool — pick theo role, fallback token đầu.

function adminToken(data) {
  const admin = data.find((d) => d.role === 'ADMIN');
  return admin ?? data[0];
}

const READ_ENDPOINTS = [
  { path: '/admin/courses', label: 'admin courses' },
  { path: '/admin/vocabularies', label: 'admin vocabularies' },
  { path: '/admin/topics', label: 'admin topics' },
  { path: '/admin/grammars', label: 'admin grammars' },
  { path: '/admin/lessons', label: 'admin lessons' },
  { path: '/admin/questions', label: 'admin questions' },
];

/** Admin read journey (cũ) — 6 endpoint GET. */
export function adminCurriculumJourney(data) {
  const t = adminToken(data);
  setAuthCookie(t.token);

  for (const ep of READ_ENDPOINTS) {
    const res = get(ep.path);
    check(res, { [`${ep.label} 200`]: (r) => r.status === 200 });
    sleep(think());
  }
}

/** Admin write journey — POST vocab mới (prefix loadtest_ để teardown dễ), PATCH update.
 *  Tag tất cả `type:write` để admin_writes_total counter phân loại. */
export function adminCurriculumWriteJourney(data) {
  const t = adminToken(data);
  setAuthCookie(t.token);

  // Lấy 1 topic + 1 level hiện có (vocab cần cả 2 FK).
  const topicsRes = get('/admin/topics');
  const topics = parseBody(topicsRes)?.data?.items ?? parseBody(topicsRes)?.data ?? [];
  const levelsRes = get('/admin/levels');
  const levels = parseBody(levelsRes)?.data?.items ?? parseBody(levelsRes)?.data ?? [];
  const topic = topics[0];
  const level = levels[0];
  if (!topic?.id || !level?.id) {
    // Không có topic/level → skip write journey (không fail).
    return;
  }

  // 1) Tạo vocab mới — unique key để idempotent nếu retry.
  const marker = `loadtest_${Math.random().toString(36).slice(2, 10)}`;
  const createRes = post('/admin/vocabularies', {
    hanzi: marker,
    pinyin: 'pinyin-' + marker,
    meaningVi: `load-test vocab ${marker}`,
    levelId: level.id,
    topicId: topic.id,
  });
  const created = check(createRes, { 'vocab create 2xx': (r) => r.status >= 200 && r.status < 300 });
  if (created) adminWrites.add(1);
  sleep(think());

  const vocabId = parseBody(createRes)?.data?.id;
  if (!vocabId) return;

  // 2) Update vocab vừa tạo — verify PUT round-trip (controller dùng @Put :id).
  const patchRes = patch(`/admin/vocabularies/${vocabId}`, {
    meaningVi: `updated ${marker}`,
  });
  const patched = check(patchRes, { 'vocab patch 2xx': (r) => r.status >= 200 && r.status < 300 });
  if (patched) adminWrites.add(1);
  sleep(think());

  // 3) Delete vocab (cleanup tức thì để tránh pollution nếu teardown fail).
  const delRes = del(`/admin/vocabularies/${vocabId}`);
  const deleted = check(delRes, { 'vocab delete 2xx': (r) => r.status >= 200 && r.status < 300 });
  if (deleted) adminWrites.add(1);
}