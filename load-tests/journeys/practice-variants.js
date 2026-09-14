import { sleep, check } from 'k6';
import { get, post, setAuthCookie, parseBody } from '../lib/http.js';
import { pickToken } from './auth.js';
import { pickRandom, think } from '../lib/data.js';
import { practiceAttempts, practiceSubmits } from '../lib/metrics.js';

// Practice variants: fill-blank, sentence-ordering, hanzi-writing.
// Hanzi-writing là core MVP signature feature (PR-13). Fill-blank/sentence-ordering
// là core grammar/vocab practice (PR-10/12). Mỗi variant = start + submit.

/** UUID v4 pattern — validate trước khi dùng làm sourceId */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUuid(s) { return typeof s === 'string' && UUID_RE.test(s); }

/** GET /courses với retry đơn giản nếu trả empty (cold cache dưới spike). */
function getCourses() {
  let res = get('/courses');
  let courses = parseBody(res)?.data ?? [];
  for (let i = 0; i < 2 && courses.length === 0 && res.status === 200; i++) {
    sleep(0.3);
    res = get('/courses');
    courses = parseBody(res)?.data ?? [];
  }
  return courses;
}

/** Helper: start attempt với body, trả {attemptId, ...}. */
function startVariant(path, body) {
  const res = post(path, body);
  const ok = check(res, { [`${path} 2xx`]: (r) => r.status >= 200 && r.status < 300 });
  if (ok) practiceAttempts.add(1);
  return parseBody(res)?.data ?? {};
}

export function practiceVariantsJourney(data) {
  const t = pickToken(data);
  setAuthCookie(t.token);

  // Browse 1 lesson để có sourceId cho các variant.
  const courses = getCourses();
  sleep(think());
  const course = pickRandom(courses);
  let lessonId = null;
  if (course?.id && isValidUuid(course.id)) {
    let res = get(`/course-lessons?courseId=${course.id}`);
    const lessons = parseBody(res)?.data ?? [];
    const lesson = pickRandom(lessons);
    // API trả {id, lessonId} — dùng lessonId (FK tới lessons). Validate UUID.
    if (lesson?.lessonId && isValidUuid(lesson.lessonId)) lessonId = lesson.lessonId;
  }
  if (!lessonId) {
    // Không có lesson → skip toàn bộ variants (không fail journey).
    return;
  }
  sleep(think());

  // 1) Fill-blank: start → submit với dummy answer
  const fb = startVariant('/practice/fill-blank/start', {
    lessonId,
    questionCount: 5,
    idempotencyKey: `k6-fb-${Math.random().toString(36).slice(2, 10)}`,
  });
  sleep(think());
  if (fb.attemptId && Array.isArray(fb.questions) && fb.questions.length > 0) {
    // Response shape: { questionId, prompt, options: string[] }. Pick first option as tokenId.
    const answers = fb.questions.map((q) => ({
      questionId: q.questionId,
      tokenId: q.options?.[0] ?? 'dummy-token',
    })).filter((a) => a.questionId);
    const sub = post(`/practice/fill-blank/${fb.attemptId}/submit`, {
      answers,
      durationSeconds: 30,
    });
    const submitted = check(sub, { 'fill-blank submit <500': (r) => r.status < 500 });
    if (submitted && sub.status < 300) practiceSubmits.add(1);
  }
  sleep(think());

  // 2) Sentence-ordering: start → submit với dummy shuffled tokens
  const so = startVariant('/practice/sentence-ordering/start', {
    lessonId,
    questionCount: 3,
    idempotencyKey: `k6-so-${Math.random().toString(36).slice(2, 10)}`,
  });
  sleep(think());
  if (so.attemptId && Array.isArray(so.questions) && so.questions.length > 0) {
    // Response shape: { questionId, tokens: [{id, text}] }. Send tokenIds theo thứ tự hiện có.
    const answers = so.questions.map((q) => ({
      questionId: q.questionId,
      tokenIds: Array.isArray(q.tokens) ? q.tokens.map((t) => t.id ?? t) : [],
    })).filter((a) => a.questionId && a.tokenIds.length > 0);
    const sub = post(`/practice/sentence-ordering/${so.attemptId}/submit`, {
      answers,
      durationSeconds: 45,
    });
    const submitted = check(sub, { 'sentence-ordering submit <500': (r) => r.status < 500 });
    if (submitted && sub.status < 300) practiceSubmits.add(1);
  }
  sleep(think());

  // 3) Hanzi-writing: start → complete với dummy char results
  const hw = startVariant('/practice/hanzi-writing/start', { lessonId });
  sleep(think());
  if (hw.attemptId && Array.isArray(hw.characters) && hw.characters.length > 0) {
    const results = hw.characters.map((c) => ({
      char: c.char ?? c.hanzi ?? '汉',
      mistakes: Math.floor(Math.random() * 3),
      skipped: false,
    }));
    const sub = post(`/practice/hanzi-writing/${hw.attemptId}/complete`, {
      characters: results,
      durationSeconds: 120,
    });
    const submitted = check(sub, { 'hanzi-writing complete <500': (r) => r.status < 500 });
    if (submitted && sub.status < 300) practiceSubmits.add(1);
  }
}