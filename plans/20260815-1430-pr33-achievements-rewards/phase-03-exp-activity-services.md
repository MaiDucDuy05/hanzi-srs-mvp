# Phase 03 — ExpService + ActivityService (internal)

> Spec: §4.2, §5 ADR-1/2/3/6. Dep: phase 02. Next: phase 04.

## Overview
2 service nội bộ **không có controller** (chống gian lận). `ExpService` quản lý ledger + cap + balance. `ActivityService` ghi timeline. Cả nhận `EntityManager` để chạy trong tx của caller.

## Related code files
- Create: `backend/src/modules/achievements/exp.service.ts`
- Create: `backend/src/modules/achievements/activity.service.ts`
- Ref: `practice/grading.service.ts` (dùng `em` pattern), `student/student-progress.service.ts` (streak hiện có)

## ExpService API
```typescript
class ExpService {
  // Cộng EXP từ attempt (compute perfect/combo bonus). Trả về số EXP thực cộng (sau cap).
  awardFromAttempt(em, userId, { correct, total, combo, refId }, idempotencyKey?): Promise<number>
  // Cộng EXP generic (lesson, mistake review, streak). Áp daily cap.
  award(em, userId, amount, type, refType?, refId?, idempotencyKey?): Promise<number>
  // Trừ EXP (redeem). Throw nếu không đủ. Lock row users.
  debit(em, userId, amount, refId, idempotencyKey): Promise<void>
  // Đọc balance O(1) từ users.current_exp.
  getBalance(userId): Promise<{ current: number; total: number }>
}
```

## Implementation steps
1. `award(em, ...)`:
   - Idempotency: nếu `idempotencyKey` + đã có `exp_transactions` → return 0 (không cộng lại).
   - Cap: upsert `exp_daily_earnings(user_id, today)` → `earned`. `capped = min(amount, MAX_DAILY_EXP - earned)` (nếu <=0 return 0). Streak type **bypass cap**.
   - Insert `exp_transactions` (+capped). Update `users.current_exp += capped`, `total_exp += capped` (dùng `em.getRepository(User)` + `SELECT FOR UPDATE`).
   - Return capped.
2. `awardFromAttempt`: compute `10 (lesson) + (perfect? 5 : 0) + combo bonus (2 * max(0, combo-2))`. Gọi `award(EARN_LESSON)` + `award(EARN_PERFECT)` + `award(EARN_COMBO)` riêng (mỗi cái có idempotencyKey derived).
3. `debit(em, ...)`: `SELECT FOR UPDATE users`, check `current_exp >= amount`, throw `BadRequestException('Không đủ EXP')`, insert `exp_transactions` (-amount), `current_exp -= amount`.
4. `getBalance`: `SELECT current_exp, total_exp FROM users`.
5. `MAX_DAILY_EXP = 200` từ `ConfigService` env `MAX_DAILY_EXP` (default 200).
6. `ActivityService.log(em, userId, type, details, expAwarded)`: insert `user_activities`.
7. **Level helper** (`level.util.ts`): fixed thresholds in code (không query DB):
   ```typescript
   const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500]; // L1..L5 boundaries
   // Sau L5 (1500): +500/level → level = 5 + floor((total - 1500) / 500)
   export function getLevel(totalExp: number): { level: number; currentLevelFloor: number; nextLevelFloor: number; progress: number }
   ```
   Dùng cho cả BE (timeline/achievements) và FE (dashboard). FE nhận qua API `/achievements` payload.

## Todo
- [ ] ExpService.award (idempotency + cap + ledger + cache update)
- [ ] ExpService.awardFromAttempt (compute bonus)
- [ ] ExpService.debit (lock + insufficient check)
- [ ] ExpService.getBalance
(60-80px) + header (6. ActivityService.log
- [ ] ConfigService MAX_DAILY_EXP=200
- [ ] Streak type bypass cap
- [ ] level.util.ts getLevel (fixed thresholds L1-L5 + +500/level)

## Success criteria
- `award` idempotent (cùng idempotencyKey → 0 lần 2).
- Cap: vượt MAX_DAILY_EXP=200 → chỉ cộng đến ngưỡng.
- `debit` throw khi thiếu; lock chống race.
- `getBalance` O(1).
- `getLevel(0)=L1`, `getLevel(100)=L2`, `getLevel(1500)=L5`, `getLevel(2000)=L6`.

## Security
- Không expose public method nhận `amount` từ client — `awardFromAttempt` compute server-side. `debit` chỉ gọi từ RewardsService.
- Tất cả write qua `em` (tx caller) → atomic.
