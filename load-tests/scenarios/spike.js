import { stressThresholds } from '../config/thresholds.js';
import { loginPool } from '../journeys/auth.js';
import { studentLearnJourney } from '../journeys/student-learn.js';
import { writeReport } from '../lib/reporting.js';
import { teardownTestData } from '../lib/cleanup.js';

// Spike: surge tức thời 0→500 VU trong 10s, hold 2m, drop 10s — mở lớp/thi.
// Chỉ student journey (flow chính chịu surge). Threshold lỏng.
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
export function student(data) { studentLearnJourney(data); }

export function teardown(data) {
  // Spike không tạo vocab — chỉ student journey. Skip cleanup.
}

export function handleSummary(data) {
  return writeReport('spike', data);
}