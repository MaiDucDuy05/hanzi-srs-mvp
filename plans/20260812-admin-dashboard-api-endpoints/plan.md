# Plan: Admin Dashboard API Endpoints

## Context
- Previous gap analysis: `admin-dashboard-feature.tsx` 100% mock, cần backend overview endpoint + frontend wiring.
- Decisions: revenue = VIP subs × giá (env); skip system-resources; single `/admin/dashboard/overview` endpoint.

## Backend — new `admin` module

### Create
| File | Responsibility |
|---|---|
| `modules/admin/dto/admin.dto.ts` | Response interfaces: UserStats, RevenueMetrics, SystemHealth, PendingSubscriptionItem, DashboardOverview |
| `modules/admin/services/user-stats.service.ts` | `getStats()`: count users GROUP BY role (where deletedAt IS NULL) + vipCount (DISTINCT userId where plan=VIP, status=ACTIVE, expiresAt null OR > now) |
| `modules/admin/services/revenue.service.ts` | `getMetrics()`: activeVipCount × `VIP_PRICE_MONTHLY` (env, default 9.99) + `REVENUE_TARGET_MONTHLY` (env, default 45000) + currency `USD` |
| `modules/admin/services/health.service.ts` | `getHealth()`: DB ping (`SELECT 1`) + `process.uptime()` → healthPercent 100/0, statusLabel Optimal/Critical, statusMessage, lastCheckedAt |
| `modules/admin/admin.service.ts` | Orchestrator `getOverview()`: gọi 3 sub-services + pendingVipCount (VipUpgradeRequest status=PENDING) + pendingSubscriptions (top 5 subs status=ACTIVE plan=VIP, join user fullName) |
| `modules/admin/admin.controller.ts` | `@Controller('admin')` `@Roles(ADMIN)` — `GET dashboard/overview` → `adminService.getOverview()`, wrap `ok()` |
| `modules/admin/admin.service.spec.ts` | Unit test orchestrator (mock sub-services + repos) |

### Modify
- `backend/src/app.module.ts` — import `AdminModule`
- `backend/.env.example` — add `VIP_PRICE_MONTHLY=9.99`, `REVENUE_TARGET_MONTHLY=45000`

### Response shape
```
GET /api/v1/admin/dashboard/overview  (ADMIN)
→ { data: {
    userStats: { total, byRole: {FREE,TEACHER,ADMIN}, vipCount },
    pendingVipCount,
    revenue: { monthlyRevenue, revenueTarget, currency },
    health: { healthPercent, statusLabel, statusMessage, lastCheckedAt },
    pendingSubscriptions: [{ id, userId, userFullName, plan }]  // top 5
  }, message }
```

## Frontend — admin API + wiring

### Create
- `frontend/src/lib/api/endpoints/admin.ts` — `adminApi.getDashboardOverview()` → `unwrap(apiFetch<Single<DashboardOverview>>('/admin/dashboard/overview'))`

### Modify
- `frontend/src/lib/api/types.ts` — add `DashboardOverview`, `UserStats`, `RevenueMetrics`, `SystemHealth`, `PendingSubscriptionItem` types
- `frontend/src/lib/api/endpoints.ts` — `export * from './endpoints/admin'`
- `frontend/src/lib/api/endpoints/subscription.ts` — add `update(id, data)` (PATCH, backend đã có)
- `frontend/src/lib/api/endpoints/resource.ts` — thêm param `status` vào `listVipRequests`
- `frontend/src/features/admin/admin-dashboard-feature.tsx` — fetch overview (useState/useEffect), pass props to 5 cards, wire onApprove/onReject (gọi `subscriptionApi.update`), loading/error states (PageLoading/ErrorState). storagePercent/serverLoadPercent giữ default (skipped).

## Out of scope
- System-resources endpoint (skipped — card giữ default storage/server load)
- Separate endpoints (chỉ overview)
- Bổ sung user relation vào `GET /subscriptions` list (overview đã join riêng)

## Success criteria
- `npm run build` backend pass (compile)
- `npm run lint` pass
- Unit test admin.service pass
- Frontend dashboard hiển thị real data từ API (không còn mock)
- 403 cho non-admin gọi overview

## Unresolved
- none
