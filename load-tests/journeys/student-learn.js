import { sleep, check } from 'k6';
import { get, post, patch, setAuthCookie, parseBody } from '../lib/http.js';
import { pickToken } from './auth.js';
import { pickRandom, think } from '../lib/data.js';
import { practiceAttempts, practiceSubmits, srsReviews } from '../lib/metrics.js';

// Journey học sinh: browse courses → lessons → recommended → practice (FLASHCARD) →
// SRS review → complete vocab/grammar → progress check.
// Write path chính của học sinh: complete-vocab / complete-grammar (PR-12).
// Read-heavy (phản ánh load thật). Write step guarded bởi data từ read (skip nếu empty).

export function studentLearnJourney(data) {
  const t = pickToken(data);
  setAuthCookie(t.token);
  let lessonId = null;

  // 1) List courses
  let res = get('/courses');
  check(res, { 'courses 200': (r) => r.status === 200 });
  const courses = parseBody(res)?.data ?? [];
  sleep(think());

  // 2) Course detail + lessons
  const course = pickRandom(courses);
  if (course?.id) {
    res = get(`/courses/${course.id}`);
    check(res, { 'course detail 200': (r) => r.status === 200 });
    sleep(think());

    res = get(`/course-lessons?courseId=${course.id}`);
    check(res, { 'lessons 200': (r) => r.status === 200 });
    const lessons = parseBody(res)?.data ?? [];
    const lesson = pickRandom(lessons);
    // API trả {id: courseLessonId, lessonId: actualLessonId}. Dùng lessonId cho
    // các endpoint /student/progress/lesson/:id (FK tới lessons.id, không phải course_lessons.id).
    if (lesson?.lessonId) lessonId = lesson.lessonId;
    sleep(think());
  }

  // 3) Recommended lessons (PR-12 — personalized)
  res = get('/student/recommended-lessons');
  check(res, { 'recommended 200': (r) => r.status === 200 });
  sleep(think());

  // 4) Practice questions
  res = get('/practice-questions');
  check(res, { 'practice-questions 200': (r) => r.status === 200 });
  sleep(think());

  // 5) Start + submit practice attempt (FLASHCARD + LESSON)
  if (lessonId) {
    res = post('/practice-attempts', {
      practiceType: 'FLASHCARD',
      sourceType: 'LESSON',
      sourceId: lessonId,
    });
    const ok = check(res, { 'attempt start 2xx': (r) => r.status >= 200 && r.status < 300 });
    if (ok) practiceAttempts.add(1);
    sleep(think());
    const attempt = parseBody(res)?.data;
    if (attempt?.id) {
      res = patch(`/practice-attempts/${attempt.id}`, {
        score: 80, correctCount: 8, wrongCount: 2, moveCount: 0, durationSeconds: 60,
      });
      const submitted = check(res, { 'attempt submit 2xx': (r) => r.status >= 200 && r.status < 300 });
      if (submitted) practiceSubmits.add(1);
      sleep(think());
    }
  }

  // 6) Complete vocab + grammar for lesson (write path chính)
  if (lessonId) {
    res = post(`/student/progress/lesson/${lessonId}/complete-vocab`);
    check(res, { 'complete-vocab 2xx': (r) => r.status >= 200 && r.status < 300 });
    sleep(think());

    res = post(`/student/progress/lesson/${lessonId}/complete-grammar`);
    check(res, { 'complete-grammar 2xx': (r) => r.status >= 200 && r.status < 300 });
    sleep(think());
  }

  // 7) SRS due + review (4 rating phân bố đều để test spread)
  res = get('/srs/due');
  check(res, { 'srs due 200': (r) => r.status === 200 });
  const due = parseBody(res)?.data ?? [];
  sleep(think());
  const item = pickRandom(due);
  if (item?.vocabularyId) {
    // Pick rating round-robin để test cả 4 path (AGAIN/HARD/GOOD/EASY).
    const rating = ['AGAIN', 'HARD', 'GOOD', 'EASY'][Math.floor(Math.random() * 4)];
    res = post('/srs/review', { vocabularyId: item.vocabularyId, rating });
    const reviewed = check(res, { 'srs review 2xx': (r) => r.status >= 200 && r.status < 300 });
    if (reviewed) srsReviews.add(1);
  }

  // 8) SRS progress + lesson progress (verification)
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