import { apiFetch } from '../client';

// ── Types ──

export interface LevelInfo {
  level: number;
  currentLevelFloor: number;
  nextLevelFloor: number;
  progress: number;
  expToNext: number;
}

export interface AchievementsDashboard {
  balance: { current: number; total: number };
  level: LevelInfo;
  streak: number;
  dailyGoal: number;
  dailyXp: number;
  progressPercent: number;
  recentActivities: UserActivity[];
}

export interface UserActivity {
  id: string;
  activityType: string;
  details: Record<string, unknown> | null;
  expAwarded: number;
  createdAt: string;
}

export interface TimelineResult {
  data: UserActivity[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface RadarEntry {
  type: string;
  count: number;
  avgCorrect: number;
}

export interface RewardItem {
  id: string;
  code: string;
  title: string;
  type: string;
  costExp: number;
  metadata: Record<string, unknown>;
  active: boolean;
  affordable: boolean;
  expNeeded: number;
}

export interface UserRewardItem {
  id: string;
  rewardId: string;
  type: string;
  metadata: Record<string, unknown>;
  isUsed: boolean;
  redeemedAt: string;
  expiresAt: string | null;
}

// ── API ──

export const achievementsApi = {
  getDashboard: (): Promise<AchievementsDashboard> =>
    apiFetch<{ data: AchievementsDashboard }>('/achievements').then((r) => r.data),

  getTimeline: (range: 'week' | 'month' = 'month'): Promise<TimelineResult> =>
    apiFetch<{ data: TimelineResult }>(`/achievements/timeline?range=${range}`).then(
      (r) => r.data,
    ),

  getHeatmap: (): Promise<HeatmapEntry[]> =>
    apiFetch<{ data: HeatmapEntry[] }>('/achievements/heatmap').then((r) => r.data),

  getRadar: (): Promise<RadarEntry[]> =>
    apiFetch<{ data: RadarEntry[] }>('/achievements/radar').then((r) => r.data),

  getCatalog: (): Promise<RewardItem[]> =>
    apiFetch<{ data: RewardItem[] }>('/rewards').then((r) => r.data),

  getInventory: (): Promise<UserRewardItem[]> =>
    apiFetch<{ data: UserRewardItem[] }>('/rewards/inventory').then((r) => r.data),

  redeem: (rewardId: string, idempotencyKey?: string): Promise<UserRewardItem> =>
    apiFetch<{ data: UserRewardItem }>(`/rewards/${rewardId}/redeem`, {
      method: 'POST',
      body: JSON.stringify({ idempotencyKey }),
    }).then((r) => r.data),
};
