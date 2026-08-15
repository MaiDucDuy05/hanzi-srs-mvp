# Phase 02 — Entities + Module Skeleton

> Spec: §3.2–3.7, §4.2. Dep: phase 01. Next: phase 03.

## Overview
5 TypeORM entities + `AchievementsModule` skeleton + DTOs. Entities extend `BaseEntity` (id/createdAt/updatedAt).

## Related code files
- Create: `backend/src/modules/achievements/entities/{exp-transaction,user-activity,exp-daily-earnings,reward,user-reward}.entity.ts`
- Create: `backend/src/modules/achievements/achievements.module.ts`
- Create: `backend/src/modules/achievements/dto/*.dto.ts`
- Modify: `backend/src/modules/subscription/entities/subscription.entity.ts` (add `scope: string[]` JSONB column — a-la-carte)
- Ref: `practice/entities/practice-attempt.entity.ts` (entity pattern), `subscription/subscription.module.ts` (module pattern)

## Implementation steps
1. `ExpTransaction` entity: `@Entity('exp_transactions')` — userId, amount, type, refType, refId, idempotencyKey, createdAt. (No updatedAt needed — append-only; but BaseEntity adds it, acceptable hoặc tách.)
2. `UserActivity` entity: userId, activityType, details (jsonb), expAwarded, createdAt.
3. `ExpDailyEarnings` entity: userId, date (date), earned. Composite PK `@PrimaryColumn` x2 (không extends BaseEntity id).
4. `Reward` entity: code, title, type, costExp, metadata (jsonb), active.
5. `UserReward` entity: userId, rewardId, type, metadata, isUsed, redeemedAt, expiresAt.
6. **Modify `Subscription` entity**: add `@Column({ type: 'jsonb', default: [] }) scope: string[];` (`[]` = Full VIP, `['ai_speaking']` = feature VIP).
6. `AchievementsModule`: `TypeOrmModule.forFeature([5 entities + User + Subscription + PracticeAttempt + MistakeBook])`, providers (ExpService, ActivityService, StreakService, AchievementsService, RewardsService — stub), controllers (AchievementsController, RewardsController — stub), exports [ExpService, ActivityService]. **Chưa wire vào app.module** (phase 04 xong rồi wire).
7. DTOs: `RedeemRewardDto` (idempotencyKey optional), `RewardQueryDto` (type filter, pagination), `TimelineQueryDto` (range week/month, cursor), `CreateRewardDto`/`UpdateRewardDto` (admin).

## Todo
- [ ] 5 entities (column name snake_case, type đúng)
- [ ] Subscription entity + scope JSONB column
- [ ] AchievementsModule skeleton (providers/controllers stub)
- [ ] DTOs class-validator
- [ ] `npm run build` pass (stub compile)

## Success criteria
- `nest build` sạch. Entities map đúng column (so migration).
- Module export ExpService/ActivityService (cho phase 04 inject).

## Security
- DTOs validate tất cả input; redeem DTO chỉ nhận `idempotencyKey` (không nhận amount — chống tự set EXP).
