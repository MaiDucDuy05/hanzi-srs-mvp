import { stressThresholds } from '../config/thresholds.js';
import { loginPool } from '../journeys/auth.js';
import { studentReadOnlyJourney } from '../journeys/student-read-only.js';
import { writeReport } from '../lib/reporting.js';

export const options = {
  scenarios: {
    student: {
      exec: 'student', executor: 'ramping-vus', startVUs: 0,
      stages: [
        { duration: '10s', target: 500 },
        { duration: '2m', target: 500 },
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

export function student(data) { studentReadOnlyJourney(data); }

export function teardown(data) {
  // Read-only journey, no cleanup needed.
}

export function handleSummary(data) {
  return writeReport('spike-read-only', data);
}
