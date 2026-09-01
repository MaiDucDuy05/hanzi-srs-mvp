'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { curriculumApi } from '@/lib/api/endpoints';
import type { HskLevel } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';

export function CoursesHskFeature() {
  const router = useRouter();
  const t = useTranslations('Courses');
  const [levels, setLevels] = useState<HskLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    curriculumApi.listLevels({ limit: 100 }).then((data) => {
      if (cancelled) return;
      setLevels(data);
      setLoading(false);
    }).catch((e) => {
      if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageLoading label={t('loadingHsk')} />;
  if (error) return <ErrorState message={error} onRetry={() => location.reload()} />;

  return (
    <div className="pb-10 max-w-[1200px]">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 relative">
        <h1 className="font-heading text-4xl font-black text-[#215b3b]">
          Khóa học HSK
        </h1>
      </header>

      {/* HSK Level Grid */}
      {levels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-gray-300" />
          </div>
          <p className="text-gray-500 font-bold">{t('noHsk')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {levels.map((level, idx) => (
            <button
              key={level.id}
              onClick={() => router.push(`/study?levelId=${level.id}`)}
              className="group bg-white rounded-[28px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 text-left hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Level badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-2xl bg-[#fcfbe8] flex items-center justify-center">
                  <span className="text-base font-black text-[#11321e]">{level.code}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#85d038] bg-[#ecfce7] px-3 py-1 rounded-full">
                  <BookOpen className="h-3.5 w-3.5" strokeWidth={2.5} />
                  {level.vocabularyCount} {t('words')}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-extrabold text-[#11321e] mb-1">{level.name}</h3>
              <p className="text-sm text-gray-400 font-medium mb-4 line-clamp-2">
                {t('hskLevelFormat', { level: level.code.replace('HSK', ''), count: level.vocabularyCount })}
              </p>

              {/* Action */}
              <div className="flex items-center gap-2 text-[#85d038] font-bold text-sm group-hover:gap-3 transition-all">
                <span>{t('learnNow')}</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
