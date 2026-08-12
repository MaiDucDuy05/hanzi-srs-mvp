/**
 * Response shapes cho admin dashboard overview endpoint.
 * Đây là response-only DTO (không validation) — trả về từ GET /admin/dashboard/overview.
 */
import { Role } from '../../../common/enums/user.enums';
import { SubscriptionPlan } from '../../../common/enums/subscription.enums';

/** Thống kê người dùng theo vai trò + số VIP active. */
export interface UserStats {
  total: number;
  byRole: Record<Role, number>;
  vipCount: number;
}

/** Doanh thu tháng + target (từ VIP subscriptions × giá env). */
export interface RevenueMetrics {
  monthlyRevenue: number;
  revenueTarget: number;
  currency: string;
}

export type HealthStatus = 'Optimal' | 'Degraded' | 'Critical';

/** Tình trạng hệ thống (DB ping + uptime). */
export interface SystemHealth {
  healthPercent: number;
  statusLabel: HealthStatus;
  statusMessage: string;
  lastCheckedAt: string;
}

/** Một dòng trong bảng pending subscriptions (top N VIP active gần nhất). */
export interface PendingSubscriptionItem {
  id: string;
  userId: string;
  userFullName: string;
  plan: SubscriptionPlan;
}

/** Payload tổng hợp cho admin dashboard — 1 round-trip. */
export interface DashboardOverview {
  userStats: UserStats;
  pendingVipCount: number;
  revenue: RevenueMetrics;
  health: SystemHealth;
  pendingSubscriptions: PendingSubscriptionItem[];
}
