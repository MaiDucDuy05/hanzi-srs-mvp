# Plan — PR-33: Achievements & Rewards System

> Source spec: [`docs/modules/progress-tracking/pr-33-achievements-rewards.md`](../../docs/modules/progress-tracking/pr-33-achievements-rewards.md)
> Scope: **Backend (NestJS) primary** + frontend stub. NestJS-expert owns phases 01–08.

## Overview
Gamification cá nhân hóa: EXP ledger + activity timeline + reward shop. EXP chỉ cộng server-side trong cùng transaction với grading (chống gian lận). Redeem EXP → voucher/VIP ngắn hạn/content/cosmetic.

## Phases

| # | Phase | Status | Files |
| :-- | :--- | :--- | :--- |
| 01 | [Database migration](./phase-01-database-migration.md) | Pending | `migrations/005-pr33-achievements.ts` |
| 02 | [Entities + module skeleton](./phase-02-entities-module-skeleton.md) | Pending | `achievements/` entities, module, dto |
| 03 | [ExpService + ActivityService (internal)](./phase-03-exp-activity-services.md) | Pending | `exp.service.ts`, `activity.service.ts` |
| 04 | [Grading hooks + StreakService](./phase-04-grading-hooks-streak.md) | Pending | wire into `practice` controllers |
| 05 | [Achievements controller/service](./phase-05-achievements-controller.md) | Pending | dashboard, timeline, heatmap, radar |
| 06 | [Rewards catalog + redemption](./phase-06-rewards-redemption.md) | Pending | `rewards/` service+controller, admin CRUD |
| 07 | [Seed rewards catalog](./phase-07-seed-catalog.md) | Pending | `seeds/seed-rewards.ts` |
| 08 | [Tests](./phase-08-tests.md) | Pending | unit + e2e |
| 09 | [Frontend (stub)](./phase-09-frontend.md) | Pending | NextJS pages/components |

## Key dependencies
- `practice` module → export `GradingService`/controllers cho phase 04 hook (đã export).
- `subscription` module → `Subscription` entity cho VIP ngắn hạn (phase 06).
- `student` → `StudentProgressService.recordActivity` refactor → `StreakService` (phase 04).
- `mistake_books` → thêm `context` JSONB (phase 01) + review hook (phase 04).
- **New dep**: `@nestjs/schedule` (phase 08) — cron purge `user_activities` > 90 ngày. Official NestJS, nhỏ.

## Key decisions (ADRs from spec §5 + §11 configs)
- ADR-1: Award EXP+activity trong cùng tx, **không event bus** (codebase chưa có, KISS + nguyên tử).
- ADR-2: Ledger append-only + cache balance trên `users`.
- ADR-3: Daily cap via `exp_daily_earnings` upsert. **`MAX_DAILY_EXP = 200`**.
- ADR-4: Catalog `rewards` DB (admin-managed).
- ADR-5: VIP ngắn hạn tái dùng `subscriptions` + **`scope` JSONB (a-la-carte)** — Full VIP `scope=[]`, feature VIP `scope=['ai_speaking']`.
- ADR-6: Timeline từ `user_activities` riêng.
- **Level**: Fixed thresholds in code (L1:0-100, L2:100-300, L3:300-600, L4:600-1000, L5:1000-1500, sau +500/level). Helper chia FE/BE.
- **Purge**: `user_activities` xóa > 90 ngày (cron); `exp_transactions` **không xóa** vĩnh viễn.

## Resolved configs (spec §11)
- `MAX_DAILY_EXP=200`. Seed costs: AI Speaking 24h=500, Flashcard HSK=1000, Voucher 10%=2000, Voucher 30% VIP=5000.
- `subscriptions.scope` JSONB added in MVP (a-la-carte entitlement).

## Risks (spec §7)
Race redeem → `SELECT FOR UPDATE` lock users. EXP oan → cùng tx. Ledger phình → partition tháng + purge 90 ngày (activity only). Gian lận → không có public EXP endpoint.
