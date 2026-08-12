'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GameSelectionModal } from '../components/game-selection-modal';
import { curriculumApi } from '@/lib/api/endpoints/curriculum';
import { resourceApi } from '@/lib/api/endpoints/resource';
import type { HskLevel, Topic, Assignment, MistakeBookEntry } from '@/lib/api/types';

type LessonItem = { id: string; title: string; count: number; desc: string };

export function LessonSelectionFeature() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedLesson, setSelectedLesson] = useState<{ id: string; title: string } | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);

  const mode = searchParams.get('mode') || 'topic';
  const title =
    mode === 'hsk' ? 'Select HSK Level'
    : mode === 'topic' ? 'Select a Topic'
    : mode === 'assignment' ? "Teacher's Assignments"
    : mode === 'mistakes' ? 'Mistake Book'
    : 'Select Lesson';

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
            desc: `HSK Level — ${l.vocabularyCount} words`,
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
          const assignments = await curriculumApi.listAssignments({ limit: 100 });
          setLessons(assignments.map((a: Assignment) => ({
            id: a.id,
            title: a.title,
            count: a.vocabularyCount,
            desc: a.description ?? '',
          })));
        } else if (mode === 'mistakes') {
          // recent mistakes (last 7 days) + total
          const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
          const [recent, all] = await Promise.all([
            resourceApi.listMistakes({ since: sevenDaysAgo, limit: 100 }),
            resourceApi.listMistakes({ limit: 100 }),
          ]);
          setLessons([
            { id: 'recent', title: 'Recent Mistakes', count: recent.length, desc: 'Words you got wrong this week' },
            { id: 'all', title: 'All Mistakes', count: all.length, desc: 'Complete list of all mistakes' },
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

  const handleLessonClick = useCallback((lessonId: string, lessonTitle: string) => {
    if (mode === 'assignment') {
      router.push(`/games/balloon?mode=assignment&lesson=${lessonId}`);
    } else {
      setSelectedLesson({ id: lessonId, title: lessonTitle });
    }
  }, [mode, router]);

  const handleGameSelect = useCallback((gameId: string) => {
    if (selectedLesson) {
      router.push(`/games/${gameId}?mode=${mode}&lesson=${selectedLesson.id}`);
      setSelectedLesson(null);
    }
  }, [selectedLesson, mode, router]);

  return (
    <div className="w-full flex flex-col min-h-full py-4 sm:py-0 relative">
      <div className="flex items-center gap-4 mb-8 pl-2">
        <button onClick={() => router.back()} className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 text-[#215b3b] transition-colors border-2 border-transparent hover:border-[#aadd4a]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-3xl sm:text-4xl font-black text-[#3e5c46] font-heading tracking-tight">{title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 mb-8">
        {loading ? (
          <div className="col-span-1 md:col-span-2 text-center py-20 text-gray-400 font-medium text-xl">Loading...</div>
        ) : lessons.length > 0 ? lessons.map((lesson) => (
          <button key={lesson.id} onClick={() => handleLessonClick(lesson.id, lesson.title)} className="text-left bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-4 border-transparent hover:border-[#aadd4a] hover:shadow-md transition-all group flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#215b3b] mb-1 group-hover:text-[#4a6b38] transition-colors">{lesson.title}</h2>
              <p className="text-gray-500 font-medium">{lesson.desc}</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className="hidden sm:inline-block px-4 py-1.5 bg-[#e5f5eb] text-[#215b3b] font-bold rounded-full text-sm whitespace-nowrap">{lesson.count} words</span>
              <div className="w-12 h-12 rounded-full bg-[#aadd4a] flex items-center justify-center text-white transform group-hover:scale-110 transition-transform shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </button>
        )) : (
          <div className="col-span-1 md:col-span-2 text-center py-20 text-gray-500 font-medium text-xl">No lessons available for this mode yet.</div>
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
