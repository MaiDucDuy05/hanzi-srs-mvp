'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { GameSelectionModal } from '../components/game-selection-modal';
import { curriculumApi } from '@/lib/api/endpoints/curriculum';
import { resourceApi } from '@/lib/api/endpoints/resource';
import { testAssignmentsApi, testApi } from '@/lib/api/endpoints';
import type { HskLevel, Topic, Assignment, } from '@/lib/api/types';

type LessonItem = { id: string; title: string; count: number; desc: string; isExam?: boolean; testId?: string; };

export function LessonSelectionFeature() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('LessonSelection');
  const [selectedLesson, setSelectedLesson] = useState<{ id: string; title: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);

  const mode = searchParams.get('mode') || 'topic';
  const title =
    mode === 'hsk' ? t('titleHsk')
    : mode === 'topic' ? t('titleTopic')
    : mode === 'assignment' ? t('titleAssignment')
    : mode === 'mistakes' ? t('titleMistakes')
    : t('titleDefault');

  // Fetch data based on mode
  useEffect(() => {
    setLoading(true);
    setLessons([]);

    const fetchData = async () => {
      try {
        if (mode === 'hsk') {
          const { hskLevels } = await curriculumApi.getLessonSelectionOverview();
          setLessons(hskLevels.map((l: HskLevel) => ({
            id: l.id,
            title: l.name,
            count: l.vocabularyCount,
            desc: t('descHsk', { count: l.vocabularyCount }),
          })));
        } else if (mode === 'topic') {
          const { topics } = await curriculumApi.getLessonSelectionOverview();
          setLessons(topics.map((t: Topic) => ({
            id: t.id,
            title: t.name,
            count: t.vocabularyCount,
            desc: t.description ?? '',
          })));
        } else if (mode === 'assignment') {
          const assignments = await testAssignmentsApi.getAssigned();
          const customExams = assignments.filter((a) => a.test?.category === 'CUSTOM' || !a.test?.templateId);
          setLessons(customExams.map((a) => ({
            id: a.id,
            testId: a.testId,
            title: a.test?.name || 'Unnamed Exam',
            count: a.test?.timeLimitMinutes || 0,
            desc: a.test?.description || '',
            isExam: true,
          })));
        } else if (mode === 'mistakes') {
          // recent mistakes (last 7 days) + total
          const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
          const [recent, all] = await Promise.all([
            resourceApi.listMistakes({ since: sevenDaysAgo, limit: 100 }),
            resourceApi.listMistakes({ limit: 100 }),
          ]);
          setLessons([
            { id: 'recent', title: t('recentMistakes'), count: recent.length, desc: t('descRecentMistakes') },
            { id: 'all', title: t('allMistakes'), count: all.length, desc: t('descAllMistakes') },
          ]);
        }
      } catch (err) {
        console.error('[LessonSelection] fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode]);

  const handleLessonClick = useCallback(async (lessonId: string, lessonTitle: string, isExam?: boolean, testId?: string) => {
    if (mode === 'assignment' && isExam && testId) {
      if (!window.confirm(`Bạn có chắc muốn bắt đầu làm bài thi "${lessonTitle}"?`)) return;
      try {
        const attempt = await testApi.startAttempt(testId, lessonId);
        router.push(`/dashboard/exams/${attempt.id}`);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Có lỗi xảy ra khi bắt đầu bài thi');
      }
    } else if (mode === 'mistakes') {
      router.push(`/games/mistakes/review?filter=${lessonId}`);
    } else {
      setSelectedLesson({ id: lessonId, title: lessonTitle });
    }
  }, [mode, router]);

  const category = (searchParams.get('category') as 'vocab' | 'sentence') || 'vocab';

  const handleGameSelect = useCallback((gameId: string) => {
    if (selectedLesson) {
      router.push(`/games/${gameId}?mode=${mode}&lesson=${selectedLesson.id}`);
      setSelectedLesson(null);
    }
  }, [selectedLesson, mode, router]);

  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    lesson.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col min-h-full py-4 sm:py-0 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pl-2 pr-2">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 text-[#215b3b] transition-colors border-2 border-transparent hover:border-[#aadd4a]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-3xl sm:text-4xl font-black text-[#3e5c46] font-heading tracking-tight">{title}</h1>
        </div>

        {mode === 'topic' && (
          <div className="relative max-w-sm w-full">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('searchTopicPlaceholder') || 'Tìm kiếm chủ đề...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-gray-100 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-[#aadd4a] focus:ring-4 focus:ring-[#aadd4a]/20 transition-all font-medium text-gray-700 shadow-sm"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 mb-8">
        {loading ? (
          <div className="col-span-1 md:col-span-2 text-center py-20 text-gray-400 font-medium text-xl">{t('loading')}</div>
        ) : filteredLessons.length > 0 ? filteredLessons.map((lesson) => (
          <button key={lesson.id} onClick={() => handleLessonClick(lesson.id, lesson.title, lesson.isExam, lesson.testId)} className="text-left bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-4 border-transparent hover:border-[#aadd4a] hover:shadow-md transition-all group flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#215b3b] mb-1 group-hover:text-[#4a6b38] transition-colors">{lesson.title}</h2>
              <p className="text-gray-500 font-medium">{lesson.desc}</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="hidden sm:inline-block px-4 py-1.5 bg-[#e5f5eb] text-[#215b3b] font-bold rounded-full text-sm whitespace-nowrap">
                {lesson.isExam ? `${lesson.count} Phút` : t('words', { count: lesson.count })}
              </span>
              <div className="w-12 h-12 rounded-full bg-[#aadd4a] flex items-center justify-center text-white transform group-hover:scale-110 transition-transform shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </button>
        )) : (
          <div className="col-span-1 md:col-span-2 text-center py-20 text-gray-500 font-medium text-xl">{searchQuery ? 'Không tìm thấy chủ đề nào' : t('noLessons')}</div>
        )}
      </div>

      {selectedLesson && (
        <GameSelectionModal
          selectedLesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onGameSelect={handleGameSelect}
        />
      )}
    </div>
  );
}
