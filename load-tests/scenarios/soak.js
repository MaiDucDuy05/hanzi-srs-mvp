import { thresholds } from '../config/thresholds.js';
import { loginPool } from '../journeys/auth.js';
import { studentLearnJourney } from '../journeys/student-learn.js';
import { studentQuizAttemptJourney } from '../journeys/student-quiz-attempt.js';
import { achievementsJourney } from '../journeys/achievements.js';
import { practiceVariantsJourney } from '../journeys/practice-variants.js';
import { writeReport } from '../lib/reporting.js';
import { teardownTestData } from '../lib/cleanup.js';

// Soak: 100 VU, 1h, flat — endurance. Phát hiện leak memory/connection/DB pool.
// Mix student 50 + quiz 10 + achievements 20 + practice 20. Chạy manual (tốn thời gian).
export const options = {
  scenarios: {
    student: {
      exec: 'student', executor: 'constant-vus', vus: 250, duration: '1h',
    },
    quiz: {
      exec: 'quiz', executor: 'constant-vus', vus: 50, duration: '1h',
    },
    achievements: {
      exec: 'achievements', executor: 'constant-vus', vus: 100, duration: '1h',
    },
    practiceVariants: {
      exec: 'practiceVariants', executor: 'constant-vus', vus: 100, duration: '1h',
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
export function achievements(data) { achievementsJourney(data); }
export function practiceVariants(data) { practiceVariantsJourney(data); }

export function teardown(data) {
  teardownTestData(data);
}

export function handleSummary(data) {
  return writeReport('soak', data);
}