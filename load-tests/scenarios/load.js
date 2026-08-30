import { thresholds } from '../config/thresholds.js';
import { loginPool, meJourney } from '../journeys/auth.js';
import { studentLearnJourney } from '../journeys/student-learn.js';
import { studentQuizAttemptJourney } from '../journeys/student-quiz-attempt.js';
import { adminCurriculumJourney, adminCurriculumWriteJourney } from '../journeys/admin-curriculum.js';
import { achievementsJourney } from '../journeys/achievements.js';
import { practiceVariantsJourney } from '../journeys/practice-variants.js';
import { writeReport } from '../lib/reporting.js';
import { teardownTestData } from '../lib/cleanup.js';

// Load: ramp 50→200→500 VU / 10m — peak bình thường (trường học).
// Mix: student 250 + quiz 50 + achievements 50 + practice-variants 50 + admin 50 = 500 VU peak.
// Quiz attempt là core flow chính.
export const options = {
  scenarios: {
    student: {
      exec: 'student', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '2m', target: 80 },
        { duration: '3m', target: 150 },
        { duration: '3m', target: 250 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    quiz: {
      exec: 'quiz', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '2m', target: 15 },
        { duration: '3m', target: 30 },
        { duration: '3m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    achievements: {
      exec: 'achievements', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '3m', target: 35 },
        { duration: '3m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    practiceVariants: {
      exec: 'practiceVariants', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '2m', target: 20 },
        { duration: '3m', target: 35 },
        { duration: '3m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    admin: {
      exec: 'admin', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '3m', target: 25 },
        { duration: '3m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
    auth: {
      exec: 'auth', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '2m', target: 5 },
        { duration: '3m', target: 20 },
        { duration: '3m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds,
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

export function teardown(data) {
  teardownTestData(data);
}

export function handleSummary(data) {
  return writeReport('load', data);
}