/**
 * Admin API — endpoint dashboard overview cho admin dashboard.
 * Backend: GET /admin/dashboard/overview (ADMIN-only).
 */
import { apiFetch, unwrap } from '../client';
import type { Single, DashboardOverview } from '../types';

export const adminApi = {
  /** Tổng hợp stats cho admin dashboard — 1 round-trip. */
  getDashboardOverview: () =>
    unwrap(apiFetch<Single<DashboardOverview>>('/admin/dashboard/overview')),
};
