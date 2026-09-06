'use client';

import React, { use, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { curriculumApi } from '@/lib/api/endpoints';
import { studentApi } from '@/lib/api/endpoints/student';
import type { HskLevel, Lesson } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';

export function CourseDetailFeature({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const t = useTranslations('Courses.detail');
  const [level, setLevel] = useState<HskLevel | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [levelData, lessonsData, progressData] = await Promise.all([
          curriculumApi.getLevel(resolvedParams.id),
          curriculumApi.listLessons({ levelId: resolvedParams.id, status: 'PUBLISHED' }),
          studentApi.getLevelLessonProgress(resolvedParams.id).catch(() => []),
        ]);
        if (cancelled) return;
        setLevel(levelData);
        setLessons(lessonsData.slice().sort((a, b) => a.displayOrder - b.displayOrder));

        const pMap: Record<string, number> = {};
        for (const p of progressData) {
          let score = 0;
          if (p.vocabCompleted) score += 0.5;
          if (p.grammarCompleted) score += 0.5;
          pMap[p.lessonId] = score;
        }
        setProgressMap(pMap);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : t('loadError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [resolvedParams.id, t]);

  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons;
    const lowerQuery = searchQuery.toLowerCase();
    return lessons.filter(l =>
      l.title.toLowerCase().includes(lowerQuery) ||
      (l.description ?? '').toLowerCase().includes(lowerQuery)
    );
  }, [lessons, searchQuery]);

  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const currentLessons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLessons.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLessons, currentPage]);

  if (loading) return <PageLoading label={t('loading')} />;
  if (error) return <ErrorState message={error} onRetry={() => location.reload()} />;

  const lessonBtnLabel = (id: string) => {
    const p = progressMap[id];
    if (p === 1) return t('btnReview');
    if (p > 0) return t('btnResume');
    return t('btnStart');
  };

  const pageStart = (currentPage - 1) * itemsPerPage + 1;
  const pageEnd = Math.min(currentPage * itemsPerPage, filteredLessons.length);

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#eef7e9] rounded-full transform -rotate-12 scale-110 z-0" />
            <img src="/assets/illustrations/bamboo/bamboo.png" alt="Bamboo" className="w-auto h-24 sm:h-32 object-contain relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#215b3b] font-heading">
              {level ? `${level.code} — ${level.name}` : t('fallbackTitle')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t('lessonCount', { count: lessons.length })}</p>
          </div>
        </div>
        <div className="relative w-full md:w-80 flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-2 border-transparent focus:border-[#8BC34A] focus:outline-none shadow-sm transition-all text-[#215b3b] font-medium placeholder:font-normal"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 flex-1">
        {currentLessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-[2rem] p-5 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-1">
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#eef7e9" strokeWidth="6" fill="none" />
                <circle cx="32" cy="32" r="28" stroke="#8BC34A" strokeWidth="6" fill="none"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={(2 * Math.PI * 28) * (1 - (progressMap[lesson.id] ?? 0))}
                  strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <span className="absolute text-sm font-bold text-[#4a6b38]">{lesson.displayOrder}</span>
            </div>
            <h2 className="text-lg font-bold text-[#215b3b] mb-1 line-clamp-2">{lesson.title}</h2>
            {lesson.description && (
              <p className="text-[#4a6b38] text-sm mb-4 line-clamp-2">{lesson.description}</p>
            )}
            <div className="mt-auto w-full pt-2">
              <Link href={`/study/${lesson.id}`} className="w-full block">
                <button className="w-full py-2.5 px-4 bg-[#8BC34A] hover:bg-[#7CB342] text-white font-bold rounded-full transition-colors shadow-sm">
                  {lessonBtnLabel(lesson.id)}
                </button>
              </Link>
            </div>
          </div>
        ))}
        {currentLessons.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#4a6b38]">
            {searchQuery ? t('noLessonsSearch', { query: searchQuery }) : t('noLessons')}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 mb-4 flex items-center justify-center md:justify-end gap-2 text-sm font-medium text-[#4a6b38]">
          <span className="mr-4 hidden sm:inline">
            {t('paginationLabel', { start: pageStart, end: pageEnd, total: filteredLessons.length })}
          </span>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">{t('prev')}</button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                  <button onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${currentPage === page ? 'bg-[#8BC34A] text-white font-bold' : 'hover:bg-white'}`}>
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">{t('next')}</button>
        </div>
      )}
    </div>
  );
}
