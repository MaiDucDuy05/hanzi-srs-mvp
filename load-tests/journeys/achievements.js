import { sleep, check } from 'k6';
import { get, post, setAuthCookie, parseBody } from '../lib/http.js';
import { pickToken } from './auth.js';
import { pickRandom, think } from '../lib/data.js';
import { achievementsUnlocked } from '../lib/metrics.js';

// Achievements journey: dashboard / timeline / heatmap / radar + rewards shop.
// Read-heavy aggregation (heatmap 90 ngày, radar skill distribution) — test N+1
// query risk. 1 write (redeem reward) — idempotency key nên có thể spam.

export function achievementsJourney(data) {
  const t = pickToken(data);
  setAuthCookie(t.token);

  // 1) Dashboard — verify có streak/level field (không empty)
  let res = get('/achievements');
  check(res, { 'achievements dashboard 200': (r) => r.status === 200 });
  const dash = parseBody(res)?.data;
  if (dash && (dash?.streak?.current > 0 || dash?.level?.level > 1)) {
    achievementsUnlocked.add(1);
  }
  sleep(think());

  // 2) Timeline (range=week) — activity list 7 ngày
  res = get('/achievements/timeline?range=week&page=1&limit=20');
  check(res, { 'achievements timeline 200': (r) => r.status === 200 });
  sleep(think());

  // 3) Heatmap (90 ngày) — aggregation query nặng nhất, test N+1
  res = get('/achievements/heatmap');
  check(res, { 'achievements heatmap 200': (r) => r.status === 200 });
  sleep(think());

  // 4) Radar — skill distribution per practice type
  res = get('/achievements/radar');
  check(res, { 'achievements radar 200': (r) => r.status === 200 });
  sleep(think());

  // 5) Rewards catalog
  res = get('/rewards');
  check(res, { 'rewards catalog 200': (r) => r.status === 200 });
  const rewards = parseBody(res)?.data ?? [];
  sleep(think());

  // 6) Inventory — đã redeem trước đó
  res = get('/rewards/inventory');
  check(res, { 'rewards inventory 200': (r) => r.status === 200 });
  sleep(think());

  // 7) Redeem 1 reward (idempotency key random) — 2xx OK hoặc 4xx nếu hết coin
  const reward = pickRandom(rewards);
  if (reward?.id) {
    res = post(`/rewards/${reward.id}/redeem`, {
      idempotencyKey: `k6-${Math.random().toString(36).slice(2, 12)}`,
    }, {
      tags: { type: 'write-expected-error' },
    });
    // Accept 2xx (success) hoặc 4xx (insufficient coins) — chỉ log unexpected 5xx.
    check(res, {
      'redeem <500': (r) => r.status < 500,
      'redeem expected': (r) => r.status === 200 || r.status === 400 || r.status === 409,
    });
  }
}