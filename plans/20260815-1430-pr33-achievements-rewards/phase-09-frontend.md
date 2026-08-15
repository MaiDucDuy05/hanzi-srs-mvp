# Phase 09 — Frontend (Stub)

> Spec: §8 UI/UX. Dep: phase 05, 06 backend API. Owner: frontend dev (NestJS-expert handoff).

## Overview
NextJS pages/components cho dashboard 3 tab (Thống kê & Timeline | Sổ lỗi sai | Shop) + inventory. Tuân thủ design system Cute Panda Forest.

## Related code files
- Create: `frontend/src/features/achievements/` (api hooks, components)
- Create: `frontend/src/app/(student)/achievements/page.tsx`
- Modify: bottom navigation (Leaderboard → Thành tích icon)
- Ref: `frontend/src/features/games/components/game-summary.tsx` (Cute Panda Forest palette), `frontend/src/lib/api/endpoints/` (api pattern)

## Implementation steps
1. API client: `achievementsApi.getDashboard()`, `.getTimeline()`, `.getHeatmap()`; `rewardsApi.list()`, `.redeem()`, `.inventory()`.
2. Page `/achievements` 3 tab:
   - Tab 1: card EXP + level, streak heatmap (react-calendar-heatmap hoặc custom), radar chart (recharts), timeline (dọc node tròn, cursor load more, filter week/month).
   - Tab 2: mistake book deep-dive (card từ sai + context + nút "Ôn tập ngay").
   - Tab 3: shop (grid item, gray-out + progress bar khi thiếu EXP, tab "Giảm giá"/"VIP"/"Trang trí"), redeem modal + confetti + voucher copy.
3. Inventory page/section: list user_rewards (status, expires).
4. Bottom nav: đổi icon Leaderboard → Thành tích (cúp/huy chương).
5. Design: palette forest `#5e7f26`/`#eaf3c5`/`#c7cf35`, panda mascot, card soft-lime, pill button.

## Todo
- [ ] API client endpoints
- [ ] Page /achievements 3 tab
- [ ] Heatmap + radar + timeline components
- [ ] Mistake book deep-dive tab + "Ôn tập ngay"
- [ ] Shop tab + redeem modal + confetti
- [ ] Inventory
- [ ] Bottom nav icon swap
- [ ] `npm run build` (frontend) pass

## Success criteria
- Dashboard hiển thị EXP/streak/heatmap/radar/timeline đúng từ API.
- Shop gray-out item thiếu EXP; redeem → modal + voucher copy.
- Tuân thủ Cute Panda Forest design system.

## Note
- Phase này ngoài scope NestJS-expert — handoff frontend dev. Backend API (phase 05/06) phải ready trước.
