import { sleep, check } from 'k6';
import { get, setAuthCookie, parseBody } from '../lib/http.js';
import { pickToken } from './auth.js';
import { pickRandom, think } from '../lib/data.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUuid(s) { return typeof s === 'string' && UUID_RE.test(s); }

function getCourses() {
  let res = get('/courses');
  let courses = parseBody(res)?.data ?? [];
  for (let i = 0; i < 2 && courses.length === 0 && res.status === 200; i++) {
    sleep(0.3);
    res = get('/courses');
    courses = parseBody(res)?.data ?? [];
  }
  return { res, courses };
}

export function studentReadOnlyJourney(data) {
  const t = pickToken(data);
  setAuthCookie(t.token);
  let lessonId = null;

  // 1) Auth me
  let res = get('/auth/me');
  check(res, { 'auth/me 200': (r) => r.status === 200 });
  sleep(think());

  // 2) List courses
  const { res: coursesRes, courses } = getCourses();
  check(coursesRes, { 'courses 200': (r) => r.status === 200 });
  sleep(think());

  const course = pickRandom(courses);
  if (course?.id && isValidUuid(course.id)) {
    res = get(`/courses/${course.id}`);
    check(res, { 'course detail 200': (r) => r.status === 200 });
    sleep(think());

    res = get(`/course-lessons?courseId=${course.id}`);
    check(res, { 'lessons 200': (r) => r.status === 200 });
    const lessons = parseBody(res)?.data ?? [];
    const lesson = pickRandom(lessons);
    if (lesson?.lessonId && isValidUuid(lesson.lessonId)) {
      lessonId = lesson.lessonId;
    }
    sleep(think());
  }

  // 3) Recommended lessons
  res = get('/student/recommended-lessons');
  check(res, { 'recommended 200': (r) => r.status === 200 });
  sleep(think());

  // 4) Practice questions
  res = get('/practice-questions');
  check(res, { 'practice-questions 200': (r) => r.status === 200 });
  sleep(think());

  // 5) SRS due
  res = get('/srs/due');
  check(res, { 'srs due 200': (r) => r.status === 200 });
  sleep(think());

  // 6) Progress checks
  if (lessonId) {
    res = get(`/srs/progress?lessonId=${lessonId}`);
    check(res, { 'srs progress 200': (r) => r.status === 200 });
    res = get(`/student/progress/lesson/${lessonId}`);
    check(res, { 'student lesson progress 200': (r) => r.status === 200 });
  }
  res = get('/student/progress');
  check(res, { 'student progress 200': (r) => r.status === 200 });
  sleep(think());
}
