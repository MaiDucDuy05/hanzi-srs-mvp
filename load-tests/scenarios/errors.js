import { thresholds } from '../config/thresholds.js';
import { loginPool } from '../journeys/auth.js';
import { errorCasesJourney } from '../journeys/error-cases.js';
import { writeReport } from '../lib/reporting.js';

// Errors: 5 VU / 30s — test error path (401/403/404/422).
// Threshold dùng `http_req_failed{status:expected}` loại trừ expected error.
export const options = {
  scenarios: {
    errors: {
      exec: 'errors', executor: 'constant-vus', vus: 5, duration: '30s',
    },
  },
  thresholds: {
    // Error scenario được phép trả error — chỉ check 5xx (server bug).
    'http_req_failed{status:5xx}': ['rate<0.05'],
    checks: ['rate>0.95'],
  },
  setupTimeout: '120s',
};

export function setup() {
  return loginPool();
}
export function errors(data) { errorCasesJourney(data); }

export function handleSummary(data) {
  return writeReport('errors', data);
}