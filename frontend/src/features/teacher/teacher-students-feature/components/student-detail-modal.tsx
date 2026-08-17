'use client';

import { useEffect, useState, useCallback } from 'react';
import { resourceApi } from '@/lib/api/endpoints';
import { testApi } from '@/lib/api/endpoints/test';
import type { Student, StudentDetail, StudentActivity, Mistake, TestAttemptSummary } from '../types';
import { clampPct, getInitials, sortByFailCount } from '../utils';
import { MistakeCard } from './mistake-card';
import { ActivityItem } from './activity-item';
import { TestScoreItem } from './test-score-item';

export function StudentDetailModal({
  student,
  open,
  onClose,
}: {
  student: Student | null;
  open: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'mistakes' | 'tests'>('overview');
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [testAttempts, setTestAttempts] = useState<TestAttemptSummary[]>([]);

  const loadData = useCallback(async () => {
    if (!student?.id) return;
    setLoading(true);

    try {
      const [activitiesRes, mistakesRes, attemptsRes] = await Promise.all([
        resourceApi.listStudentActivities({ limit: 10 }),
        resourceApi.listMistakes({ userId: String(student.id), limit: 10 }),
        testApi.listAttempts({ userId: String(student.id), status: 'SUBMITTED', limit: 10 }),
      ]);

      setActivities(Array.isArray(activitiesRes) ? activitiesRes : []);
      setMistakes(sortByFailCount(Array.isArray(mistakesRes) ? mistakesRes : []));
      setTestAttempts(Array.isArray(attemptsRes) ? attemptsRes : []);

      setDetail({
        id: student.id as string,
        fullName: student.fullName || 'Unknown',
        email: student.email,
        totalExp: Number(student.totalExp) || 0,
        currentStreak: Number(student.currentStreak) || 0,
        dailyGoal: 50,
        createdAt: new Date().toISOString(),
      });
    } catch {
      setDetail({
        id: student.id as string,
        fullName: student.fullName || 'Unknown',
        totalExp: Number(student.totalExp) || 0,
        currentStreak: Number(student.currentStreak) || 0,
        dailyGoal: 50,
        createdAt: new Date().toISOString(),
      });
      setActivities([]);
      setMistakes([]);
      setTestAttempts([]);
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    if (open && student) {
      loadData();
    }
  }, [open, student, loadData]);

  if (!open || !student) return null;

  const tabs: { key: typeof activeTab; label: string; icon: string; badge?: number }[] = [
    { key: 'overview', label: 'Tổng quan', icon: '⭐' },
    { key: 'activities', label: 'Hoạt động', icon: '📊' },
    { key: 'mistakes', label: 'Lỗi sai', icon: '❌', badge: mistakes.length || undefined },
    { key: 'tests', label: 'Bài kiểm tra', icon: '📝', badge: testAttempts.length || undefined },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-[24px] shadow-2xl w-[720px] max-w-full h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#1f5333] font-extrabold text-xl shadow-inner">
                {getInitials(student.fullName)}
              </div>
              <div>
                <h2 className="font-extrabold text-xl text-[#1f5333]">{student.fullName || 'Unknown Student'}</h2>
                {detail?.email && <p className="text-[13px] text-gray-400">{detail.email}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-[#fcfce8] px-3 py-1.5 rounded-full">
              <svg className="h-4 w-4 text-[#78993a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="text-[13px] font-bold text-[#1f5333]">{detail?.totalExp || 0} EXP</span>
            </div>
            <div className="flex items-center gap-2 bg-[#fff4f4] px-3 py-1.5 rounded-full">
              <svg className="h-4 w-4 text-[#e55353]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
              <span className="text-[13px] font-bold text-[#e55353]">{detail?.currentStreak || 0} ngày streak</span>
            </div>
            <div className="flex items-center gap-2 bg-[#f3f4e1] px-3 py-1.5 rounded-full">
              <svg className="h-4 w-4 text-[#1f5333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="text-[13px] font-bold text-[#1f5333]">HSK 1</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-100 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-[13px] font-bold transition-colors relative ${
                activeTab === tab.key
                  ? 'bg-[#f3f4e1] text-[#1f5333]'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.badge ? (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] bg-[#e55353] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-3 border-[#78993a] border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#f0fdf4] rounded-xl p-4 text-center">
                      <div className="text-2xl font-extrabold text-[#1f5333] mb-1">{clampPct(student.courseProgress)}%</div>
                      <div className="text-[11px] text-gray-500 font-medium">Tiến độ khóa học</div>
                      <div className="h-1.5 bg-white/60 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-[#78993a] rounded-full" style={{ width: `${clampPct(student.courseProgress)}%` }} />
                      </div>
                    </div>
                    <div className="bg-[#fcfce8] rounded-xl p-4 text-center">
                      <div className="text-2xl font-extrabold text-[#1f5333] mb-1">{clampPct(student.vocabMastery)}%</div>
                      <div className="text-[11px] text-gray-500 font-medium">Vocab Mastery</div>
                      <div className="h-1.5 bg-white/60 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-[#c7cf35] rounded-full" style={{ width: `${clampPct(student.vocabMastery)}%` }} />
                      </div>
                    </div>
                    <div className="bg-[#fffbeb] rounded-xl p-4 text-center">
                      <div className="text-2xl font-extrabold text-[#1f5333] mb-1">{clampPct(student.testAvg)}%</div>
                      <div className="text-[11px] text-gray-500 font-medium">Test Average</div>
                      <div className="h-1.5 bg-white/60 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${clampPct(student.testAvg)}%` }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <span>📊</span> Hoạt động gần đây
                    </h3>
                    <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                      {activities.length > 0 ? (
                        activities.slice(0, 5).map((a) => <ActivityItem key={a.id} activity={a} />)
                      ) : (
                        <p className="text-[13px] text-gray-400 italic text-center py-4">Chưa có hoạt động</p>
                      )}
                    </div>
                  </div>

                  {mistakes.length > 0 && (
                    <div>
                      <h3 className="text-[14px] font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span>❌</span> Lỗi sai gần đây
                      </h3>
                      <div className="space-y-2">
                        {mistakes.slice(0, 3).map((m, i) => <MistakeCard key={m.id} mistake={m} index={i} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Activities Tab */}
              {activeTab === 'activities' && (
                <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                  {activities.length > 0 ? (
                    activities.map((a) => <ActivityItem key={a.id} activity={a} />)
                  ) : (
                    <div className="text-center py-12">
                      <span className="text-5xl">📊</span>
                      <p className="text-gray-400 font-medium mt-3">Chưa có hoạt động nào</p>
                    </div>
                  )}
                </div>
              )}

              {/* Mistakes Tab */}
              {activeTab === 'mistakes' && (
                <div className="space-y-2">
                  {mistakes.length > 0 ? (
                    mistakes.map((m, i) => <MistakeCard key={m.id} mistake={m} index={i} />)
                  ) : (
                    <div className="text-center py-12">
                      <span className="text-5xl">✅</span>
                      <p className="text-gray-400 font-medium mt-3">Chưa có lỗi sai nào được ghi nhận!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tests Tab */}
              {activeTab === 'tests' && (
                <div className="space-y-3">
                  {testAttempts.length > 0 ? (
                    testAttempts.map((t) => <TestScoreItem key={t.id} attempt={t} />)
                  ) : (
                    <div className="text-center py-12">
                      <span className="text-5xl">📚</span>
                      <p className="text-gray-400 font-medium mt-3">Chưa có bài kiểm tra nào</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
