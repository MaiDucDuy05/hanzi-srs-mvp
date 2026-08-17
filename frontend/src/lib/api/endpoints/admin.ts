import { apiFetch, unwrap } from '../client';
import type { 
  Single, 
  DashboardSummary, 
  DashboardCharts, 
  DashboardPendingItems, 
  DashboardSystemHealth 
} from '../types';

export const adminApi = {
  getSummary: () =>
    unwrap(apiFetch<Single<DashboardSummary>>('/admin/dashboard/summary')),
    
  getCharts: () =>
    unwrap(apiFetch<Single<DashboardCharts>>('/admin/dashboard/charts')),
    
  getPendingItems: () =>
    unwrap(apiFetch<Single<DashboardPendingItems>>('/admin/dashboard/pending-items')),
    
  getSystemHealth: () =>
    unwrap(apiFetch<Single<DashboardSystemHealth>>('/admin/dashboard/system-health')),
};
