import { thresholds } from '../config/thresholds.js';
import { loginPool } from '../journeys/auth.js';
import { studentLearnJourney } from '../journeys/student-learn.js';
import { adminCurriculumJourney, adminCurriculumWriteJourney } from '../journeys/admin-curriculum.js';
import { achievementsJourney } from '../journeys/achievements.js';
import { practiceVariantsJourney } from '../journeys/practice-variants.js';
import { writeReport } from '../lib/reporting.js';
import { teardownTestData } from '../lib/cleanup.js';

// Smoke: sanity — student 2 + admin 1 + achievements 1 + practice-variants 1, 2 iter mỗi VU, max 30s.
// Chạy mỗi PR.
export const options = {
  scenarios: {
    student: { exec: 'student', executor: 'per-vu-iterations', vus: 2, iterations: 2, maxDuration: '1m' },
    admin: { exec: 'admin', executor: 'per-vu-iterations', vus: 1, iterations: 2, maxDuration: '1m' },
    achievements: { exec: 'achievements', executor: 'per-vu-iterations', vus: 1, iterations: 2, maxDuration: '1m' },
    practiceVariants: { exec: 'practiceVariants', executor: 'per-vu-iterations', vus: 1, iterations: 2, maxDuration: '1m' },
  },
  thresholds,
  setupTimeout: '120s',
  teardownTimeout: '60s',
};

export function setup() {
  return loginPool();
}
export function student(data) { studentLearnJourney(data); }
export function admin(data) { adminCurriculumJourney(data); }
export function adminWrite(data) { adminCurriculumWriteJourney(data); }
export function achievements(data) { achievementsJourney(data); }
export function practiceVariants(data) { practiceVariantsJourney(data); }

export function teardown(data) {
  // Cleanup vocab loadtest_* sau smoke — tránh pollution DB.
  teardownTestData(data);
}

export function handleSummary(data) {
  return writeReport('smoke', data);
}