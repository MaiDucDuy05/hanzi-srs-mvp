import { stressThresholds } from '../config/thresholds.js';
import { loginPool } from '../journeys/auth.js';
import { studentLearnJourney } from '../journeys/student-learn.js';
import { studentQuizAttemptJourney } from '../journeys/student-quiz-attempt.js';
import { writeReport } from '../lib/reporting.js';
import { teardownTestData } from '../lib/cleanup.js';

// Spike: surge tức thời 0→500 VU trong 10s, hold 2m, drop 10s — mở lớp/thi.
// Mix student 300 + quiz 200. Quiz là core flow chính nên lên tỉ lệ cao.
// Threshold lỏng.
export const options = {
  scenarios: {
    student: {
      exec: 'student', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '10s', target: 300 },
        { duration: '2m', target: 300 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    quiz: {
      exec: 'quiz', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '10s', target: 200 },
        { duration: '2m', target: 200 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: stressThresholds,
  setupTimeout: '120s',
  teardownTimeout: '60s',
};

export function setup() {
  return loginPool();
}
export function student(data) { studentLearnJourney(data); }
export function quiz(data) { studentQuizAttemptJourney(data); }

export function teardown(data) {
  // Spike không tạo vocab — chỉ existing student + quiz journeys. Skip cleanup.
}

export function handleSummary(data) {
  return writeReport('spike', data);
}