'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, HelpCircle } from 'lucide-react';
import { adminApi, subscriptionApi } from '@/lib/api/endpoints';
import type { DashboardOverview, PendingSubscriptionItem } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import {
  UserStatsCard,
  PendingVipCard,
  RevenueResourcesStack,
  PendingSubscriptionsTable,
  SystemHealthCard,
} from './dashboard';

/** Map API pending subscription → display shape cho table (tên + initials + plan). */
function toDisplaySub(s: PendingSubscriptionItem) {
  const initials = s.userFullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  return { id: s.id, name: s.userFullName, initials, plan: s.plan };
}

/** Format doanh thu dạng "$38,240". */
function formatCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`;
}

/** Format target dạng "$45k". */
function formatTarget(amount: number): string {
  return `$${Math.round(amount / 1000)}k`;
}

export function AdminDashboardFeature() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setOverview(await adminApi.getDashboardOverview());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  /** Duyệt subscription → status ACTIVE, rồi refetch overview. */
  const handleApprove = useCallback(async (id: string) => {
    try {
      await subscriptionApi.update(id, { status: 'ACTIVE' });
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Duyệt gói thất bại.');
    }
  }, []);

  /** Từ chối subscription → status CANCELLED, rồi refetch overview. */
  const handleReject = useCallback(async (id: string) => {
    try {
      await subscriptionApi.update(id, { status: 'CANCELLED' });
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Từ chối gói thất bại.');
    }
  }, []);

  // Free users = role FREE trừ đi VIP subscribers (xấp xỉ non-VIP free).
  const freeUsers = overview
    ? Math.max(0, overview.userStats.byRole.FREE - overview.userStats.vipCount)
    : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Guardian Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back to the canopy. Here&apos;s today&apos;s summary.
          </p>
        </div>
        <div className="flex items-center gap-4 text-forest">
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading && <PageLoading label="Đang tải dashboard..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => void load()} />}

      {overview && !loading && !error && (
        <>
          {/* Stats Grid Top */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UserStatsCard
              totalUsers={overview.userStats.total}
              freeUsers={freeUsers}
              vipUsers={overview.userStats.vipCount}
              teacherUsers={overview.userStats.byRole.TEACHER}
            />
            <PendingVipCard pendingCount={overview.pendingVipCount} />
            <RevenueResourcesStack
              monthlyRevenue={formatCurrency(overview.revenue.monthlyRevenue)}
              revenueTarget={formatTarget(overview.revenue.revenueTarget)}
            />
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PendingSubscriptionsTable
              subscriptions={overview.pendingSubscriptions.map(toDisplaySub)}
              onApprove={(id) => void handleApprove(id)}
              onReject={(id) => void handleReject(id)}
            />
            <SystemHealthCard
              healthPercent={overview.health.healthPercent}
              statusLabel={overview.health.statusLabel}
              statusMessage={overview.health.statusMessage}
            />
          </div>
        </>
      )}
    </div>
  );
}
