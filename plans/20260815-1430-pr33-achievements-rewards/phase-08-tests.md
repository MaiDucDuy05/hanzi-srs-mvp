# Phase 08 — Tests

> Spec: §10 AC. Dep: phase 04, 06. Next: phase 09.

## Overview
Unit tests cho ExpService/RewardsService + e2e cho redeem race + integration award-in-tx.

## Related code files
- Create: `backend/src/modules/achievements/exp.service.spec.ts`
- Create: `backend/src/modules/achievements/rewards/rewards.service.spec.ts`
- Create: `backend/src/modules/achievements/activity-purge.service.ts` (cron `@Cron('0 3 * * *')` — xóa `user_activities` > 90 ngày; **không xóa `exp_transactions`**)
- Create: `backend/src/modules/achievements/utils/level.util.spec.ts`
- Create: `backend/src/modules/achievements/utils/entitlement.util.spec.ts`
- Create: `backend/src/modules/achievements/activity-purge.service.spec.ts`
- Create: `backend/test/achievements.e2e-spec.ts`
- Ref: `backend/src/modules/practice/practice.service.spec.ts` (mock repo pattern), `backend/src/modules/subscription/subscription.service.spec.ts`
- **New dep**: `@nestjs/schedule` (install `npm i @nestjs/schedule`, register `ScheduleModule.forRoot()` in AppModule) — official NestJS cron, nhỏ, KISS.

## Implementation steps
0. Install `@nestjs/schedule`, register `ScheduleModule.forRoot()` in `AppModule`. Tạo `activity-purge.service.ts` với `@Cron('0 3 * * *')` (3h sáng daily): `DELETE FROM user_activities WHERE created_at < now() - interval '90 days'`. **Không touch `exp_transactions`**.
1. `exp.service.spec.ts` (unit, mock repos + em):
   - `award` idempotent (cùng idempotencyKey → 0 lần 2).
   - `award` cap: `earned + amount > MAX_DAILY_EXP` → chỉ cộng phần dư.
   - `award` streak type bypass cap.
   - `debit` throw `BadRequestException` khi `current_exp < amount`.
   - `awardFromAttempt` compute đúng (10 + perfect 5 + combo).
2. `rewards.service.spec.ts` (unit):
   - redeem đủ EXP → debit + tạo user_rewards.
   - redeem không đủ → throw.
   - redeem idempotent (cùng idempotencyKey → existing).
3. `achievements.e2e-spec.ts` (e2e, real DB test):
   - POST submit fill-blank → EXP + activity ghi.
   - POST redeem 2 request song song → balance không âm (race).
   - GET /achievements trả đúng shape.
4. Mock `EntityManager` cho unit (truyền fake `getRepository`).
5. **Purge cron test** (`activity-purge.service.spec.ts`):
   - `user_activities` rows `created_at < now - 90 days` → deleted.
   - `exp_transactions` **không bị xóa** (ledger đối soát vĩnh viễn) — assert row count unchanged sau purge.
   - `users.total_exp`/`current_exp` không đổi sau purge activity (cache + ledger nguyên vẹn).
6. **Level computation test** (`level.util.spec.ts`):
   - `getLevel(0)=L1`, `getLevel(99)=L1`, `getLevel(100)=L2`, `getLevel(300)=L3`, `getLevel(600)=L4`, `getLevel(1000)=L5`, `getLevel(1500)=L5`, `getLevel(1501)=L6`, `getLevel(2000)=L7`.
   - `progress` fraction đúng giữa 2 mốc.
7. **Entitlement test** (`entitlement.util.spec.ts`):
   - Full VIP `scope=[]` → `hasEntitlement(any)` true.
   - Feature VIP `scope=['ai_speaking']` → `hasEntitlement('ai_speaking')` true, `hasEntitlement('flashcard')` false.
   - Expired VIP → false.

## Todo
- [ ] exp.service.spec (idempotency, cap=200, debit, awardFromAttempt)
- [ ] rewards.service.spec (redeem ok/fail/idempotent)
- [ ] e2e award-in-tx (submit → EXP ghi)
- [ ] e2e redeem race (balance không âm)
- [ ] activity-purge.service.spec (purge > 90 ngày; exp_transactions không xóa; balance không đổi)
- [ ] level.util.spec (L1-L5 thresholds + +500/level)
- [ ] entitlement.util.spec (full vs feature VIP vs expired)
- [ ] `npm run test` pass + `npm run test:e2e` pass

## Success criteria
- All tests pass, không mock/fake data绕过 logic thật (spec: không dùng fake data/cheat).
- Coverage ExpService > 90%.

## Risk
- Mock `EntityManager` phức tạp. Mitigation: e2e dùng real DB test (jest-e2e config đã có), unit mock minimal.
