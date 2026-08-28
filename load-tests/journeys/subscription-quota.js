import { sleep, check } from 'k6';
import { post, setAuthCookie, parseBody } from '../lib/http.js';
import { think } from '../lib/data.js';
import { quotaBlocked, quotaPassed } from '../lib/metrics.js';

// Subscription quota journey: gọi POST /daily-usage/checkLimit với FREE token —
// đo khi nào quota block (allowed=false) so với pass (allowed=true).
// Pure peek (không tăng lượt) → an toàn spam.

const ACTIVITY_KEYS = ['FLASHCARD', 'FILL_BLANK', 'SENTENCE_ORDERING', 'HANZI_WRITING'];

function freeToken(data) {
  // Ưu tiên user FREE để quota enforce; fallback token đầu.
  const free = data.find((d) => d.role === 'FREE');
  return free ?? data[0];
}

export function subscriptionQuotaJourney(data) {
  const t = freeToken(data);
  setAuthCookie(t.token);

  // Mỗi activityKey gọi 1 lần — đủ để quan sát allowed/blocked distribution.
  for (const key of ACTIVITY_KEYS) {
    const res = post('/daily-usage/checkLimit', { activityKey: key });
    check(res, { [`checkLimit ${key} <500`]: (r) => r.status < 500 });
    const body = parseBody(res)?.data;
    if (body?.allowed === false) {
      quotaBlocked.add(1);
    } else if (body?.allowed === true) {
      quotaPassed.add(1);
    }
    sleep(think(0.2, 0.5));
  }
}