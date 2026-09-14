import { sleep, check } from 'k6';
import { get, post, patch, setAuthCookie, parseBody } from '../lib/http.js';
import { pickToken } from './auth.js';
import { pickRandom, think } from '../lib/data.js';
import { testAttempts, testSubmits, testAnswers } from '../lib/metrics.js';

/**
 * Student Quiz Attempt Journey
 *
 * ── ENDPOINT FLOW ────────────────────────────────────────────────────
 *
 *  READ PHASE:
 *    1. GET /test-assignments/assigned
 *       └─ Fetch assigned tests for student
 *
 *    2. GET /tests/:id
 *       └─ Get test metadata (timeLimitMinutes, config, etc.)
 *
 *    3. GET /test-questions?testId=:id
 *       └─ Fetch all questions in test
 *
 *  WRITE PHASE (Attempt Lifecycle):
 *    4. POST /test-attempts
 *       └─ Start attempt (create attempt record)
 *       ✓ Increment: testAttempts counter
 *
 *    5. POST /test-attempts/:attemptId/answers (repeated per question)
 *       └─ Submit answer for each question
 *       ✓ Increment: testAnswers counter (per answer)
 *
 *    6. PATCH /test-attempts/:attemptId
 *       └─ Complete attempt (set duration, mark completed)
 *       ✓ Increment: testSubmits counter
 *
 *  RESULT PHASE:
 *    7. GET /test-attempts/:id/result
 *       └─ Fetch attempt result/score
 *
 *    8. GET /test-attempts/:id
 *       └─ Get attempt details
 *
 *    9. GET /test-attempts/:id/answers
 *       └─ Fetch all answers for review
 *
 *   10. GET /test-attempts
 *       └─ List all student attempts (history)
 *
 * ────────────────────────────────────────────────────────────────────
 *
 * PR-05 (Test Engine) handles: test creation, question mgmt, attempt flow.
 * Core MVP flow: student takes quiz, gets scored, reviews answers.
 */

/** UUID v4 pattern — validate trước khi dùng làm testId */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUuid(s) { return typeof s === 'string' && UUID_RE.test(s); }

/** GET /test-assignments/assigned — lấy danh sách bài kiểm tra được giao cho học sinh */
function getAssignedTests() {
  let res = get('/test-assignments/assigned');
  let assignments = parseBody(res)?.data ?? [];
  // Retry 2 lần nếu trả empty (cold cache dưới spike)
  for (let i = 0; i < 2 && assignments.length === 0 && res.status === 200; i++) {
    sleep(0.3);
    res = get('/test-assignments/assigned');
    assignments = parseBody(res)?.data ?? [];
  }
  return { res, assignments };
}

export function studentQuizAttemptJourney(data) {
  const t = pickToken(data);
  setAuthCookie(t.token);
  let testId = null;
  let assignmentId = null;

  // ─ 1) READ: GET /test-assignments/assigned ─────────────────────
  const { res: assignedRes, assignments } = getAssignedTests();
  check(assignedRes, { 'assigned tests 200': (r) => r.status === 200 });
  sleep(think());

  // ─ 2) SELECT: Pick a test + validate ───────────────────────────
  const assignment = pickRandom(assignments);
  if (assignment?.testId && isValidUuid(assignment.testId)) {
    testId = assignment.testId;
    assignmentId = assignment.id;

    // ─ 3) READ: GET /tests/:id ─────────────────────────────────────
    let res = get(`/tests/${testId}`);
    check(res, { 'test detail 200': (r) => r.status === 200 });
    const testDetail = parseBody(res)?.data ?? {};
    const timeLimitMinutes = testDetail.timeLimitMinutes || 30;
    sleep(think());

    // ─ 4) READ: GET /test-questions?testId=:id ──────────────────────
    res = get(`/test-questions?testId=${testId}`);
    check(res, { 'test questions 200': (r) => r.status === 200 });
    const questionsRes = parseBody(res);
    const questions = questionsRes?.data ?? [];
    sleep(think());

    if (testId && isValidUuid(testId)) {
      // ─ 5) WRITE: POST /test-attempts ───────────────────────────────
      res = post('/test-attempts', {
        testId,
        ...(assignmentId && isValidUuid(assignmentId) ? { assignmentId } : {}),
      });
      const attemptStarted = check(res, { 'attempt start 2xx': (r) => r.status >= 200 && r.status < 300 });
      if (attemptStarted) testAttempts.add(1);
      sleep(think());

      const attempt = parseBody(res)?.data;
      if (attempt?.id && isValidUuid(attempt.id)) {
        const attemptId = attempt.id;

        // ─ 6) WRITE: POST /test-attempts/:attemptId/answers (×N) ──────
        if (Array.isArray(questions) && questions.length > 0) {
          for (let i = 0; i < Math.min(questions.length, 10); i++) {
            const q = questions[i];
            if (q?.id && isValidUuid(q.id)) {
              const mockAnswer = generateMockAnswer(q);
              res = post(`/test-attempts/${attemptId}/answers`, {
                questionId: q.id,
                answer: mockAnswer,
              });
              const answerSubmitted = check(res, { 'answer submit <500': (r) => r.status < 500 });
              if (answerSubmitted && res.status < 300) {
                testAnswers.add(1);
              }
              sleep(think() * 0.5);
            }
          }
        }
        sleep(think());

        // ─ 7) WRITE: PATCH /test-attempts/:attemptId ──────────────────
        const totalDurationSeconds = timeLimitMinutes * 60 - Math.floor(Math.random() * 300);
        res = patch(`/test-attempts/${attemptId}`, {
          durationSeconds: Math.max(60, totalDurationSeconds),
        });
        const testSubmitted = check(res, { 'attempt submit 2xx': (r) => r.status >= 200 && r.status < 300 });
        if (testSubmitted) testSubmits.add(1);
        sleep(think());

        // ─ 8) READ: GET /test-attempts/:id/result ─────────────────────
        res = get(`/test-attempts/${attemptId}/result`);
        check(res, { 'test result 200': (r) => r.status === 200 });
        sleep(think());

        // ─ 9) READ: GET /test-attempts/:id ────────────────────────────
        res = get(`/test-attempts/${attemptId}`);
        check(res, { 'test attempt detail 200': (r) => r.status === 200 });
        sleep(think());

        // ─ 10) READ: GET /test-attempts/:id/answers ──────────────────
        res = get(`/test-attempts/${attemptId}/answers`);
        check(res, { 'test answers 200': (r) => r.status === 200 });
        sleep(think());
      }
    }
  }

  // ─ 11) READ: GET /test-attempts (history) ────────────────────────
  let res = get('/test-attempts');
  check(res, { 'test attempts list 200': (r) => r.status === 200 });
  sleep(think());
}

/**
 * Mock answer generator dựa trên question type.
 * Nếu question có `options` → pick random option (multiple choice).
 * Nếu question có `answerType` → generate theo type (text/number/etc).
 * Default: object với `text` field.
 */
function generateMockAnswer(question) {
  // Multiple choice — pick từ options
  if (Array.isArray(question.options) && question.options.length > 0) {
    const randomOption = question.options[Math.floor(Math.random() * question.options.length)];
    return {
      type: 'multiple_choice',
      value: randomOption?.id || randomOption || 'option-1',
    };
  }

  // Text answer (essay/short answer)
  if (question.answerType === 'text' || question.questionType === 'essay') {
    return {
      type: 'text',
      value: 'Đây là câu trả lời mẫu cho bài kiểm tra.',
    };
  }

  // Numeric answer
  if (question.answerType === 'number') {
    return {
      type: 'number',
      value: Math.floor(Math.random() * 100),
    };
  }

  // Fill-in-the-blank or matching
  if (question.questionType === 'fill_blank' || question.questionType === 'matching') {
    return {
      type: 'blank',
      tokens: Array.isArray(question.tokens) ? question.tokens.map((t) => t.id || t) : [],
    };
  }

  // Default fallback — generic answer object
  return {
    type: 'generic',
    content: 'Mock answer',
  };
}
