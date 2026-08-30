import { stressThresholds } from '../config/thresholds.js';
import { loginPool, meJourney } from '../journeys/auth.js';
import { studentLearnJourney } from '../journeys/student-learn.js';
import { studentQuizAttemptJourney } from '../journeys/student-quiz-attempt.js';
import { adminCurriculumJourney, adminCurriculumWriteJourney } from '../journeys/admin-curriculum.js';
import { achievementsJourney } from '../journeys/achievements.js';
import { practiceVariantsJourney } from '../journeys/practice-variants.js';
import { errorCasesJourney } from '../journeys/error-cases.js';
import { writeReport } from '../lib/reporting.js';
import { teardownTestData } from '../lib/cleanup.js';

// Stress: ramp tới 1000 VU / 5m — tìm điểm gãy. Threshold lỏng (error <5%).
// Mix student 550 + quiz 100 + achievements 100 + practice 100 + admin 50 + error 50 + auth 50 = 1000 VU.
// Quiz attempt là core flow nên tăng tỉ lệ.
export const options = {
  scenarios: {
    student: {
      exec: 'student', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '1m', target: 180 },
        { duration: '1m', target: 360 },
        { duration: '1m', target: 550 },
        { duration: '1m', target: 550 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    quiz: {
      exec: 'quiz', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '1m', target: 30 },
        { duration: '1m', target: 60 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    achievements: {
      exec: 'achievements', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '1m', target: 75 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    practiceVariants: {
      exec: 'practiceVariants', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '1m', target: 75 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    admin: {
      exec: 'admin', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '1m', target: 25 },
        { duration: '1m', target: 40 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    auth: {
      exec: 'auth', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '1m', target: 15 },
        { duration: '1m', target: 30 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    errors: {
      exec: 'errors', executor: 'constant-vus', vus: 50, duration: '5m',
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
export function admin(data) { adminCurriculumJourney(data); }
export function adminWrite(data) { adminCurriculumWriteJourney(data); }
export function achievements(data) { achievementsJourney(data); }
export function practiceVariants(data) { practiceVariantsJourney(data); }
export function auth(data) { meJourney(data); }
export function errors(data) { errorCasesJourney(data); }

export function teardown(data) {
  teardownTestData(data);
}

export function handleSummary(data) {
  return writeReport('stress', data);
}