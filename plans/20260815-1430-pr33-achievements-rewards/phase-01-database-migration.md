# Phase 01 — Database Migration

> Spec: §3 Thiết kế CSDL. Dep: none. Next: phase 02.

## Overview
Thêm cột `users` + 5 bảng mới + mở rộng `mistake_books` + index/constraint/partition.

## Related code files
- Create: `backend/src/database/migrations/005-pr33-achievements-rewards.ts`
- Ref: `backend/src/database/migrations/004-user-progress.ts` (pattern), `data-source.ts` (CLI)

## Implementation steps
1. Tạo `005-pr33-achievements-rewards.ts` implement `MigrationInterface`.
2. `up(qr)`:
   - `ALTER TABLE users ADD COLUMN total_exp int NOT NULL DEFAULT 0, ADD COLUMN current_exp int NOT NULL DEFAULT 0;`
   - `mistake_books`: `ADD COLUMN context jsonb` (nullable).
   - `subscriptions`: `ADD COLUMN scope jsonb NOT NULL DEFAULT '[]'::jsonb;` (a-la-carte feature scope; `[]` = Full VIP, `['ai_speaking']` = feature VIP). Add GIN index `CREATE INDEX idx_subscriptions_scope ON subscriptions USING gin (scope);`
   - `exp_transactions`: UUID PK, `user_id uuid FK`, `amount int CHECK (amount != 0)`, `type varchar(30)`, `ref_type varchar(30)`, `ref_id uuid`, `idempotency_key varchar(64)`, `created_at timestamptz default now()`. **PARTITION by RANGE (created_at)** monthly (như `practice_attempts`). Partial unique: `CREATE UNIQUE INDEX ... ON exp_transactions(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;` Index `(user_id, created_at DESC)`.
   - `exp_daily_earnings`: PK `(user_id, date)`, `earned int default 0`.
   - `user_activities`: UUID PK, `user_id`, `activity_type varchar(30)`, `details jsonb`, `exp_awarded int default 0`, `created_at`. **PARTITION monthly**. Index `(user_id, created_at DESC)`.
   - `rewards`: UUID PK, `code varchar(50) unique`, `title varchar(120)`, `type varchar(30)`, `cost_exp int`, `metadata jsonb`, `active bool default true`.
   - `user_rewards`: UUID PK, `user_id`, `reward_id FK`, `type varchar(30)`, `metadata jsonb`, `is_used bool default false`, `redeemed_at timestamptz`, `expires_at timestamptz`. Index `(user_id, is_used)`.
3. `down(qr)`: drop ngược lại (drop tables, drop columns, drop indexes).
4. Partition: tạo parent table + default partition; child partitions tạo bằng script/cron tháng (note: MVP có thể tạo trước 12 tháng tới).

## Todo
- [ ] Tạo file migration 005
- [ ] up(): users columns + mistake_books.context + subscriptions.scope
- [ ] up(): exp_transactions (partition + unique + index)
- [ ] up(): exp_daily_earnings (PK composite)
- [ ] up(): user_activities (partition + index)
- [ ] up(): rewards + user_rewards
- [ ] down() đảo ngược đầy đủ
- [ ] Chạy `npx typeorm migration:run -d src/database/data-source.ts` pass

## Success criteria
- Migration run sạch trên DB dev; `down` rollback sạch.
- `\d exp_transactions` cho thấy partition + partial unique index.
- `users` có `total_exp`/`current_exp`. `subscriptions` có `scope` JSONB + GIN index.

## Risk
- Partition trên table có FK: PostgreSQL không cho FK trỏ vào partitioned parent trực tiếp tốt → dùng `user_id uuid` (không FK cứng) hoặc FK reference users. Quyết: bỏ FK cứng trên `user_id` cho partitioned tables (như `practice_attempts` đã làm), validate ở app.
