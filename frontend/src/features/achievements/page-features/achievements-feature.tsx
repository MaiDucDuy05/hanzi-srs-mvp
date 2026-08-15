'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  achievementsApi,
  type AchievementsDashboard,
  type RewardItem,
  type UserRewardItem,
} from '@/lib/api/endpoints/achievements';

type Tab = 'overview' | 'shop' | 'inventory';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Tổng quan', icon: '📊' },
  { key: 'shop', label: 'Cửa hàng', icon: '🎁' },
  { key: 'inventory', label: 'Kho đồ', icon: '🎒' },
];

export function AchievementsFeature() {
  const [tab, setTab] = useState<Tab>('overview');
  const [dashboard, setDashboard] = useState<AchievementsDashboard | null>(null);
  const [catalog, setCatalog] = useState<RewardItem[]>([]);
  const [inventory, setInventory] = useState<UserRewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, c, i] = await Promise.all([
        achievementsApi.getDashboard(),
        achievementsApi.getCatalog(),
        achievementsApi.getInventory(),
      ]);
      setDashboard(d);
      setCatalog(c);
      setInventory(i);
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleRedeem = async (rewardId: string) => {
    try {
      await achievementsApi.redeem(rewardId, `${rewardId}:${Date.now()}`);
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? 'Redeem thất bại');
    }
  };

  if (loading) return <div className="p-8 text-center text-[#4a5a3a]">Đang tải... 🐼</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f3f8d7] p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-black text-[#215b3b]">🏆 Thành tựu & Phần thưởng</h1>

        {/* Tab bar */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-[#eaf3c5] p-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-xl px-4 py-3 font-bold transition-all ${
                tab === t.key
                  ? 'bg-[#5e7f26] text-white shadow-lg'
                  : 'text-[#4a5a3a] hover:bg-[#dde8a6]'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab dashboard={dashboard} />}
        {tab === 'shop' && <ShopTab catalog={catalog} onRedeem={handleRedeem} />}
        {tab === 'inventory' && <InventoryTab inventory={inventory} />}
      </div>
    </div>
  );
}

function OverviewTab({ dashboard }: { dashboard: AchievementsDashboard | null }) {
  if (!dashboard) return null;
  const { balance, level, streak, recentActivities } = dashboard;
  return (
    <div className="space-y-4">
      {/* Balance + Level card */}
      <div className="rounded-2xl bg-[#eaf3c5] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#4a5a3a]">EXP khả dụng</p>
            <p className="text-4xl font-black text-[#5e7f26]">{balance.current}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#4a5a3a]">Cấp độ</p>
            <p className="text-4xl font-black text-[#215b3b]">Lv {level.level}</p>
            <p className="text-xs text-[#4a5a3a]">Còn {level.expToNext} EXP lên Lv {level.level + 1}</p>
          </div>
        </div>
        {/* Level progress bar */}
        <div className="mt-4 h-3 rounded-full bg-[#dde8a6]">
          <div className="h-3 rounded-full bg-[#78993a]" style={{ width: `${level.progress * 100}%` }} />
        </div>
      </div>

      {/* Streak */}
      <div className="rounded-2xl bg-[#eaf3c5] p-6">
        <p className="text-sm text-[#4a5a3a]">🔥 Streak</p>
        <p className="text-3xl font-black text-[#215b3b]">{streak} ngày liên tục</p>
      </div>

      {/* Recent activities */}
      <div className="rounded-2xl bg-white p-6">
        <h3 className="mb-3 font-bold text-[#215b3b]">Hoạt động gần đây</h3>
        {recentActivities.length === 0 ? (
          <p className="text-sm text-[#4a5a3a]">Chưa có hoạt động</p>
        ) : (
          <ul className="space-y-2">
            {recentActivities.map((a) => (
              <li key={a.id} className="flex justify-between text-sm">
                <span className="text-[#4a5a3a]">{a.activityType}</span>
                <span className="font-bold text-[#5e7f26]">{a.expAwarded > 0 ? `+${a.expAwarded}` : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ShopTab({ catalog, onRedeem }: { catalog: RewardItem[]; onRedeem: (id: string) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {catalog.map((r) => (
        <div key={r.id} className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="font-bold text-[#215b3b]">{r.title}</h3>
          <p className="text-sm text-[#4a5a3a]">{r.type}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-black text-[#5e7f26]">{r.costExp} EXP</span>
            <button
              onClick={() => onRedeem(r.id)}
              disabled={!r.affordable}
              className={`rounded-xl px-4 py-2 font-bold transition-all ${
                r.affordable
                  ? 'bg-[#5e7f26] text-white hover:bg-[#4a6520]'
                  : 'bg-[#dde8a6] text-[#4a5a3a]/50'
              }`}
            >
              {r.affordable ? 'Đổi' : `Cần ${r.expNeeded} EXP`}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function InventoryTab({ inventory }: { inventory: UserRewardItem[] }) {
  if (inventory.length === 0) {
    return <p className="text-center text-[#4a5a3a]">Chưa đổi phần thưởng nào</p>;
  }
  return (
    <div className="space-y-3">
      {inventory.map((r) => (
        <div key={r.id} className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex justify-between">
            <span className="font-bold text-[#215b3b]">{r.type}</span>
            <span className={`text-sm ${r.isUsed ? 'text-[#4a5a3a]/50' : 'text-[#5e7f26]'}`}>
              {r.isUsed ? 'Đã dùng' : 'Sẵn sàng'}
            </span>
          </div>
          <p className="text-sm text-[#4a5a3a]">Đổi lúc: {new Date(r.redeemedAt).toLocaleDateString('vi-VN')}</p>
        </div>
      ))}
    </div>
  );
}
