# Phase 07 — Seed Rewards Catalog

> Spec: §2.3 examples. Dep: phase 06. Next: phase 08.

## Overview
Seed script tạo catalog `rewards` khởi tạo (tune sau qua admin).

## Related code files
- Create: `backend/src/database/seeds/seed-rewards.ts`
- Modify: `backend/package.json` (add `seed:rewards` script)
- Ref: `backend/src/database/seeds/seed-users.ts` (pattern)

## Implementation steps
1. Seed script dùng `dataSource` (data-source.ts), `getRepository(Reward).save(...)`.
2. Items khởi tạo (from spec §2.3):
   - `vip_speaking_24h` — TEMPORARY_VIP, 500 EXP, metadata `{ durationHours: 24, scope: ['ai_speaking'] }` (a-la-carte feature VIP).
   - `voucher_course_10pct` — DISCOUNT_VOUCHER, 2000 EXP, `{ percent: 10, target: 'course' }`.
   - `voucher_vip_30pct` — DISCOUNT_VOUCHER, 5000 EXP, `{ percent: 30, target: 'vip_annual' }`.
   - `flashcard_hsk_advanced` — CONTENT_UNLOCK, 1000 EXP, `{ contentId: '...' }`.
   - `avatar_panda_gold` — COSMETIC, 800 EXP, `{ asset: 'avatar-panda-gold' }`.
3. Idempotent: `upsert` by `code` (skip nếu đã có).
4. Add `package.json` script `"seed:rewards": "tsx src/database/seeds/seed-rewards.ts"`.

## Todo
- [ ] Seed script + 5 items
- [ ] Idempotent upsert by code
- [ ] package.json script
- [ ] Run pass, `SELECT * FROM rewards` 5 rows

## Success criteria
- `npm run seed:rewards` tạo 5 active rewards; chạy lại không duplicate.
