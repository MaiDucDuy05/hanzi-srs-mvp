import { apiFetch, unwrap } from '../client';
import type { Paginated, Single, Subscription, LimitSettings, DailyUsageCheck } from '../types';
import { toQuery } from './utils';

export const subscriptionApi = {
  list: (params: { userId?: string; plan?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Subscription>>(`/subscriptions${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  // Gói của người dùng hiện tại (authenticated, không admin-only) — phân biệt VIP subscriber vs FREE.
  me: () => unwrap(apiFetch<Single<Subscription | null>>('/subscriptions/me')),

  getLimitSettings: () => unwrap(apiFetch<Single<LimitSettings>>('/limit-settings')),

  // userId lấy từ JWT phía server (PR-14 §3.2) — chỉ gửi activityKey.
  checkLimit: (activityKey: string) =>
    unwrap(apiFetch<Single<DailyUsageCheck>>('/daily-usage/checkLimit', { method: 'POST', body: JSON.stringify({ activityKey }) })),
};
