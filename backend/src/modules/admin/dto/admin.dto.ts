import { Role } from '../../../common/enums/user.enums';
import { SubscriptionPlan } from '../../../common/enums/subscription.enums';

export interface MetricWithChange {
  value: number;
  changePercent?: number; // % change
  changeValue?: number;   // absolute change
}

/** 4 Thẻ thống kê nhanh trên cùng */
export interface DashboardSummary {
  totalUsers: MetricWithChange;
  activeVip: MetricWithChange;
  todayAttempts: { value: number; yesterday: number };
  monthlyRevenue: { value: number; lastMonth: number };
}

export interface ChartDataPoint {
  date: string;
  count: number;
}

/** Biểu đồ 30 ngày */
export interface DashboardCharts {
  registrations: ChartDataPoint[];
  attempts: ChartDataPoint[];
}

export interface PendingVipItem {
  id: string;
  userFullName: string;
  plan: SubscriptionPlan;
  createdAt: string;
}

export interface ExpiringVipItem {
  id: string;
  userFullName: string;
  expiresAt: string;
}

export interface PendingContactItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  createdAt: string;
}

export interface SystemErrorItem {
  id: string;
  jobName: string;
  errorMessage: string;
  createdAt: string;
}

/** Danh sách chờ xử lý */
export interface DashboardPendingItems {
  pendingVip: PendingVipItem[];
  expiringVip: ExpiringVipItem[];
  pendingContacts: PendingContactItem[];
  recentSystemErrors: SystemErrorItem[];
}

export type HealthStatus = 'Optimal' | 'Degraded' | 'Critical';

export interface CronJobStatus {
  name: string;
  lastRun: string;
  status: 'OK' | 'ERROR';
  errorMessage?: string;
}

/** Tình trạng hệ thống */
export interface DashboardSystemHealth {
  healthPercent: number;
  statusLabel: HealthStatus;
  statusMessage: string;
  lastCheckedAt: string;
  aiCallsToday: number;
  storageUsedMb: number;
  cronJobs: CronJobStatus[];
}
