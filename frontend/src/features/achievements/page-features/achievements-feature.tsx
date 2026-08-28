'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  achievementsApi,
  type AchievementsDashboard,
  type RewardItem,
  type UserRewardItem,
  type HeatmapEntry,
  type RadarEntry,
  type TimelineResult,
} from '@/lib/api/endpoints/achievements';
import { SkillRadar } from '../components/skill-radar';
import { StreakHeatmap } from '../components/streak-heatmap';
import { RedeemModal } from '../components/redeem-modal';
import { ErrorNotebookModal } from '@/features/teacher/teacher-students-feature/components/error-notebook-modal';

type Tab = 'overview' | 'shop' | 'inventory';

const getTabs = (t: any): { key: Tab; label: string; icon: string }[] => [
  { key: 'overview', label: t('overview'), icon: '📊' },
  { key: 'shop', label: t('shop'), icon: '🎁' },
  { key: 'inventory', label: t('inventory'), icon: '🎒' },
];

export function AchievementsFeature() {
  const t = useTranslations('Achievements');
  const [tab, setTab] = useState<Tab>('overview');
  const [dashboard, setDashboard] = useState<AchievementsDashboard | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [radar, setRadar] = useState<RadarEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineResult | null>(null);
  
  const [catalog, setCatalog] = useState<RewardItem[]>([]);
  const [inventory, setInventory] = useState<UserRewardItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, c, i, h, r, t] = await Promise.all([
        achievementsApi.getDashboard(),
        achievementsApi.getCatalog(),
        achievementsApi.getInventory(),
        achievementsApi.getHeatmap().catch(() => []),
        achievementsApi.getRadar().catch(() => []),
        achievementsApi.getTimeline('month').catch(() => null),
      ]);
      setDashboard(d);
      setCatalog(c);
      setInventory(i);
      setHeatmap(h);
      setRadar(r);
      setTimeline(t);
    } catch (e: any) {
      setError(e?.message ?? t('loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleRedeemClick = (reward: RewardItem) => {
    setSelectedReward(reward);
    setRedeemModalOpen(true);
  };

  const handleConfirmRedeem = async (rewardId: string) => {
    try {
      await achievementsApi.redeem(rewardId, `${rewardId}:${Date.now()}`);
      await loadAll();
    } catch (e: any) {
      setError(e?.message ?? t('redeemError'));
    }
  };

  if (loading) return <div className="p-8 text-center text-[#4a5a3a]">{t('loading')}</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="w-full px-2 py-4 sm:px-6 sm:py-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-black text-[#215b3b]">{t('title')}</h1>

        {/* Tab bar */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-white p-2 shadow-sm">
          {getTabs(t).map((tItem) => (
            <button
              key={tItem.key}
              onClick={() => setTab(tItem.key)}
              className={`flex-1 rounded-xl px-4 py-3 text-sm sm:text-base font-bold transition-all ${
                tab === tItem.key
                  ? 'bg-[#e5f5eb] text-[#215b3b]'
                  : 'text-[#4a5a3a] hover:bg-[#f3f9f5]'
              }`}
            >
              {tItem.icon} {tItem.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <OverviewTab 
            dashboard={dashboard} 
            heatmap={heatmap} 
            radar={radar} 
            timeline={timeline} 
          />
        )}
        {tab === 'shop' && (
          <ShopTab catalog={catalog} onRedeem={handleRedeemClick} />
        )}
        {tab === 'inventory' && (
          <InventoryTab inventory={inventory} />
        )}
      </div>

      <RedeemModal
        isOpen={redeemModalOpen}
        reward={selectedReward}
        onClose={() => setRedeemModalOpen(false)}
        onConfirm={handleConfirmRedeem}
      />
    </div>
  );
}

function OverviewTab({ 
  dashboard, 
  heatmap, 
  radar, 
  timeline 
}: { 
  dashboard: AchievementsDashboard | null;
  heatmap: HeatmapEntry[];
  radar: RadarEntry[];
  timeline: TimelineResult | null;
}) {
  const [mistakeModalOpen, setMistakeModalOpen] = useState(false);
  const t = useTranslations('Achievements');

  if (!dashboard) return null;
  const { balance, level, streak } = dashboard;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Cột trái: Stats & Radar */}
      <div className="space-y-6 lg:col-span-1">
        {/* Balance + Level card */}
        <div className="rounded-[2rem] bg-[#d4ed8f] p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-sm font-bold text-[#4a6b38]">{t('currentLevel')}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#215b3b]">Lv {level.level}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[#4a6b38] font-bold mb-1">
              <span>EXP</span>
              <span>{level.progress * 100}%</span>
            </div>
            <div className="h-4 w-full rounded-full bg-[#c2df7a] overflow-hidden">
              <div 
                className="h-full rounded-full bg-[#5e7f26] transition-all duration-1000" 
                style={{ width: `${level.progress * 100}%` }} 
              />
            </div>
            <p className="mt-1 text-xs text-[#4a6b38] font-medium text-right">{t('expToNext', { exp: level.expToNext, nextLv: level.level + 1 })}</p>
          </div>

          <div className="mt-6 rounded-2xl bg-white/60 p-4 backdrop-blur-sm">
            <p className="text-sm font-bold text-[#4a6b38]">{t('availableExp')}</p>
            <p className="text-3xl font-black text-[#5e7f26]">{balance.current} 💎</p>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-[#215b3b]">{t('skillAnalysis')}</h3>
          <SkillRadar data={radar} />
        </div>
      </div>

      {/* Cột phải: Heatmap, Mistake Book, Timeline */}
      <div className="space-y-6 lg:col-span-2">
        {/* Streak Heatmap */}
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#215b3b]">{t('attendanceLevel')}</h3>
            <div className="flex items-center gap-2 rounded-xl bg-[#fff4e5] px-3 py-1">
              <span>🔥</span>
              <span className="font-bold text-[#d97706]">{t('streakDays', { streak })}</span>
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[600px]">
              <StreakHeatmap data={heatmap} days={90} />
            </div>
          </div>
        </div>

        {/* Mistake Book Snapshot */}
        <div className="rounded-[2rem] bg-[#fff0f0] p-6 shadow-sm border border-[#ffcdcd]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📓</span>
              <div>
                <h3 className="text-lg font-bold text-[#c53030]">{t('mistakeBook')}</h3>
                <p className="text-sm text-[#9b2c2c]">{t('mistakeBookDesc')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setMistakeModalOpen(true)}
                className="rounded-xl bg-white px-4 py-2 font-bold text-[#c53030] transition-colors border border-[#ffcdcd] hover:bg-[#fff5f5]"
              >
                {t('details')}
              </button>
              <Link 
                href="/dashboard/practice" 
                className="rounded-xl bg-[#c53030] px-4 py-2 font-bold text-white transition-colors hover:bg-[#9b2c2c]"
              >
                {t('reviewNow')}
              </Link>
            </div>
          </div>
        </div>

        <ErrorNotebookModal open={mistakeModalOpen} onClose={() => setMistakeModalOpen(false)} />

        {/* Timeline */}
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#215b3b]">{t('activityTimeline')}</h3>
            <span className="text-sm font-medium text-[#4a5a3a]">{t('last30Days')}</span>
          </div>
          
          {!timeline || timeline.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="mb-2 text-4xl">📭</span>
              <p className="text-[#4a5a3a] font-medium">{t('noActivity')}</p>
              <p className="text-sm text-gray-400">{t('noActivityDesc')}</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {timeline.data.map((item) => {
                let label = item.activityType.replace(/_/g, ' ');
                if (item.activityType === 'LESSON_COMPLETED') label = t('actLessonCompleted');
                else if (item.activityType === 'PRACTICE_COMPLETED') {
                  const pType = item.details?.type as string | undefined;
                  if (pType === 'SENTENCE_ORDERING') label = t('actPracticeSentence');
                  else if (pType === 'HANZI_WRITING') label = t('actPracticeHanzi');
                  else if (pType === 'FILL_BLANK') label = t('actPracticeFill');
                  else if (pType === 'WORD_MATCHING') label = t('actPracticeMatch');
                  else if (pType === 'FLASHCARD') label = t('actPracticeFlashcard');
                  else if (pType === 'PINYIN_BALLOON_GAME') label = t('actPracticeBalloon');
                  else if (pType === 'MEMORY_GAME') label = t('actPracticeMemory');
                  else if (pType === 'TEST') label = t('actTestCompleted', { score: item.details?.score || 0 });
                  else label = t('actPracticeGeneral');
                }
                else if (item.activityType.includes('BONUS')) label = t('actBonusExp');
                else if (item.activityType === 'MISTAKE_REVIEWED') label = t('actMistakeReview');

                return (
                <div key={item.id} className="flex items-start gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f3f9f5] text-lg">
                    {item.activityType === 'LESSON_COMPLETED' ? '📚' : 
                     item.activityType === 'PRACTICE_COMPLETED' ? '🎯' : 
                     item.activityType.includes('BONUS') ? '✨' : 
                     item.activityType === 'MISTAKE_REVIEWED' ? '🔧' : '🕹️'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#215b3b]">{label}</p>
                    {!!item.details?.lessonId && (
                      <p className="text-sm text-gray-500">{t('lessonId')} {String(item.details.lessonId)}</p>
                    )}
                    {item.details?.score !== undefined && (
                      <p className="text-sm text-gray-500">{t('score')} {String(item.details.score)}%</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  {item.expAwarded > 0 && (
                    <div className="flex items-center gap-1 font-black text-[#5e7f26]">
                      <span>+{item.expAwarded}</span>
                      <span className="text-xs">EXP</span>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopTab({ catalog, onRedeem }: { catalog: RewardItem[]; onRedeem: (reward: RewardItem) => void }) {
  const t = useTranslations('Achievements');
  if (catalog.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-[2rem] shadow-sm">
        <span className="mb-2 text-4xl">🛍️</span>
        <p className="text-[#4a5a3a] font-medium">{t('shopEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {catalog.map((r) => {
        const icon = r.type === 'TEMPORARY_VIP' ? '👑' : r.type === 'DISCOUNT_VOUCHER' ? '🎟️' : '🎁';
        const progress = Math.min(100, (r.expNeeded ? ((r.costExp - r.expNeeded) / r.costExp) * 100 : 100));

        return (
          <div key={r.id} className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-[#dde8a6]">
            {/* Tag */}
            <div className="absolute right-0 top-0 rounded-bl-2xl bg-[#f3f8d7] px-3 py-1 text-xs font-bold text-[#5e7f26]">
              {r.type.replace(/_/g, ' ')}
            </div>

            <div className="mb-4 mt-2">
              <span className="mb-3 inline-block rounded-full bg-[#f3f9f5] p-3 text-2xl">{icon}</span>
              <h3 className="text-lg font-black text-[#215b3b] line-clamp-2 leading-tight">{r.title}</h3>
            </div>
            
            <div className="mt-auto">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1 font-black text-[#5e7f26] text-xl">
                  {r.costExp} 💎
                </span>
              </div>
              
              {!r.affordable && (
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                    <span>{t('progress')}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div className="h-1.5 rounded-full bg-[#c2df7a]" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-center text-gray-400 font-medium">{t('needMoreExp', { exp: r.expNeeded })}</p>
                </div>
              )}

              <button
                onClick={() => onRedeem(r)}
                disabled={!r.affordable}
                className={`w-full rounded-xl py-3 font-bold transition-all ${
                  r.affordable
                    ? 'bg-[#5e7f26] text-white hover:bg-[#4a6520] hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {r.affordable ? t('redeemNow') : t('notEnoughExp')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InventoryTab({ inventory }: { inventory: UserRewardItem[] }) {
  const t = useTranslations('Achievements');
  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-[2rem] shadow-sm">
        <span className="mb-2 text-4xl">🎒</span>
        <p className="text-[#4a5a3a] font-medium">{t('inventoryEmpty')}</p>
        <p className="text-sm text-gray-400">{t('inventoryEmptyDesc')}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {inventory.map((r) => {
        const isExpired = r.expiresAt ? new Date(r.expiresAt).getTime() < Date.now() : false;
        const icon = r.type === 'TEMPORARY_VIP' ? '👑' : r.type === 'DISCOUNT_VOUCHER' ? '🎟️' : '🎁';
        const voucherCode = r.metadata?.voucherCode as string | undefined;

        return (
          <div key={r.id} className={`flex flex-col rounded-[2rem] p-6 shadow-sm border ${r.isUsed ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-[#eaf3c5]'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f9f5] text-2xl">{icon}</span>
                <div>
                  <h3 className="font-black text-[#215b3b] text-lg">{r.type.replace(/_/g, ' ')}</h3>
                  <p className="text-sm text-gray-500">
                    {t('redeemedOn')} {new Date(r.redeemedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`rounded-lg px-2 py-1 text-xs font-bold ${
                  r.isUsed ? 'bg-gray-200 text-gray-500' : 'bg-[#e5f5eb] text-[#215b3b]'
                }`}>
                  {r.isUsed ? t('statusUsed') : t('statusReady')}
                </span>
                {isExpired && !r.isUsed && (
                  <span className="rounded-lg px-2 py-1 text-xs font-bold bg-red-100 text-red-600">
                    {t('statusExpired')}
                  </span>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
              {r.type === 'DISCOUNT_VOUCHER' && voucherCode && (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="font-mono font-bold text-gray-700 tracking-wider">{voucherCode}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(voucherCode)}
                    className="text-xs font-bold text-[#5e7f26] hover:underline"
                  >
                    {t('copyCode')}
                  </button>
                </div>
              )}
              
              {r.type === 'TEMPORARY_VIP' && !r.isUsed && (
                <div className="flex items-center gap-2 text-sm text-[#d97706] font-medium bg-[#fff4e5] p-3 rounded-xl">
                  <span>⚡</span> {t('autoActivate')}
                </div>
              )}

              {r.expiresAt && !r.isUsed && !isExpired && (
                <p className="mt-3 text-xs text-red-500 font-medium">
                  {t('expiresAt')} {new Date(r.expiresAt).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
