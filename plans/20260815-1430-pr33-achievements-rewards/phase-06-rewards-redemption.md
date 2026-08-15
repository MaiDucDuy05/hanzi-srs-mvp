# Phase 06 — Rewards Catalog + Redemption

> Spec: §2.3, §3.6–3.7, §4.3, §5 ADR-4/5. Dep: phase 05. Next: phase 07.

## Overview
Reward shop: catalog (student read), redemption (student spend EXP → voucher/VIP/content/cosmetic), inventory, admin CRUD.

## Related code files
- Create: `backend/src/modules/achievements/rewards/rewards.controller.ts`
- Create: `backend/src/modules/achievements/rewards/rewards.service.ts`
- Modify: `backend/src/modules/achievements/achievements.module.ts` (wire RewardsService)
- Ref: `subscription/entities/subscription.entity.ts` (VIP grant), `practice/fill-blank.controller.ts` (tx pattern)

## Implementation steps
1. `RewardsController` `@Controller('rewards')`:
   - `GET /` → catalog (active rewards, kèm `affordable` flag + `expNeeded` cho client gray-out).
   - `POST /:id/redeem` → redeem (body `RedeemRewardDto { idempotencyKey? }`).
   - `GET /inventory` → `user_rewards` của user (is_used, expires_at).
2. `RewardsService.redeem(userId, rewardId, idempotencyKey)`:
   - `dataSource.transaction(async em => { ... })`.
   - Idempotency: check `user_rewards` với `idempotencyKey` → return existing nếu có.
   - Load `rewards` by id, check `active`. `SELECT FOR UPDATE users` lock.
   - Check `users.current_exp >= reward.costExp` → throw `BadRequestException('Không đủ EXP')`.
   - `expSvc.debit(em, userId, costExp, rewardId, idempotencyKey)`.
   - Tạo `user_rewards` (snapshot type + metadata). Sinh voucher code (nếu DISCOUNT_VOUCHER) vào metadata — `crypto.randomUUID()`-based, unique.
   - Grant theo type:
     - `TEMPORARY_VIP` → insert/extend `subscriptions` (plan=VIP, status=ACTIVE, expires_at=now+duration, **`scope` từ reward.metadata.scope** — `[]` Full VIP hoặc `['ai_speaking']` feature VIP). Nếu đang VIP cùng scope → `expires_at += duration`; khác scope → tạo record mới.
     - `CONTENT_UNLOCK` → ghi metadata content_id (client check entitlement; hoặc tạo record unlock — defer).
     - `COSMETIC` → metadata only.
   - `activitySvc.log(em, userId, 'REDEEMED_REWARD', { rewardCode, cost }, -cost)`.
   - Return `user_rewards` row.
3. **Entitlement check** (`entitlement.util.ts` — dùng cho mọi feature gate BE):
   ```typescript
   // Full VIP (scope=[]) OR feature VIP (scope contains required)
   hasEntitlement(subscriptions: Subscription[], required: string): boolean
   // = any(sub => sub.status==='ACTIVE' && sub.expiresAt > now && (sub.scope.length===0 || sub.scope.includes(required)))
   ```
   A-la-carte: user mua `['ai_speaking']` → chỉ mở AI Speaking, không mở full. `[]` = mở tất cả.
4. Admin CRUD `@Controller('admin/rewards')` + `@Roles(ADMIN)`: create/update/toggle active `rewards`.
4. Rate-limit `POST /:id/redeem` (ThrottlerGuard đã có).

## Todo
- [ ] RewardsController (catalog + redeem + inventory)
- [ ] RewardsService.redeem (idempotent + lock + debit + grant)
- [ ] Voucher code gen (unique, entropy)
- [ ] TEMPORARY_VIP grant (insert/extend subscriptions + scope)
- [ ] entitlement.util.ts hasEntitlement (scope-based a-la-carte)
- [ ] CONTENT_UNLOCK / COSMETIC grant
- [ ] Admin CRUD rewards (roles guard)
- [ ] Rate-limit redeem
- [ ] `npm run build` pass

## Success criteria
- Catalog trả item + affordable/expNeeded.
- Redeem đủ EXP → trừ balance + tạo user_rewards + grant; không đủ → 400.
- Idempotent: cùng idempotencyKey → return existing, không trừ 2 lần.
- Race redeem song song (2 request cùng lúc) → không vượt balance (lock).
- VIP ngắn hạn hết hạn đúng expires_at (entitlement check hiện có).
- A-la-carte: `scope=['ai_speaking']` chỉ mở AI Speaking; `scope=[]` mở tất cả.

## Security
- `SELECT FOR UPDATE` lock users trong redeem tx.
- Voucher code không lưu sẵn trong `rewards`; sinh khi redeem, lưu `user_rewards.metadata`.
- Admin guard trên CRUD.
- Redeem DTO không nhận amount/exp — chỉ `idempotencyKey`.
- `scope` chỉ set server-side (từ reward catalog), không nhận từ client.
