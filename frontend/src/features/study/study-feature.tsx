'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FlashcardGameFeature } from '@/features/games/page-features/flashcard-game-feature';
import { curriculumApi, srsApi } from '@/lib/api/endpoints';
import type { Vocabulary, UserVocabProgress } from '@/lib/api/types';
import { StudyLessonVocabTable } from '@/features/student/components/study-lesson-vocab-table';
import { StudyLessonGrammarList } from '@/features/student/components/study-lesson-grammar-list';
import { StudyLessonFilterBar } from '@/features/student/components/study-lesson-filter-bar';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';

type StudyMode = 'level' | 'topic';

export function StudyFeature() {
  const searchParams = useSearchParams();
  const levelId = searchParams.get('levelId');
  const topicId = searchParams.get('topicId');

  const [mode, setMode] = useState<'list' | 'flashcard'>('list');
  const [listTab, setListTab] = useState<'vocab' | 'grammar'>('vocab');
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserVocabProgress>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine study mode
  const studyMode: StudyMode | null = levelId ? 'level' : topicId ? 'topic' : null;
  const studyKey = levelId ?? topicId ?? '';

  // Fetch vocabularies based on levelId or topicId
  useEffect(() => {
    if (!studyMode) return;
    let cancelled = false;
    setLoading(true);

    const params: Record<string, string> = { limit: '500' };
    if (studyMode === 'level') params.levelId = levelId!;
    if (studyMode === 'topic') params.topicId = topicId!;

    curriculumApi.listVocabularies(params).then((data) => {
      if (cancelled) return;
      setVocabularies(data);
      setLoading(false);
    }).catch((e) => {
      if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.');
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [studyMode, levelId, topicId]);

  // Fetch SRS progress
  useEffect(() => {
    if (!studyKey || !studyMode) return;
    const type = studyMode === 'level' ? 'level' : 'topic';
    srsApi.getProgress(studyKey, type).then(setProgressMap).catch(console.error);
  }, [studyKey, studyMode]);

  // Filtered vocabularies
  const filteredVocab = useMemo(() => {
    if (!search.trim()) return vocabularies;
    const q = search.toLowerCase();
    return vocabularies.filter(
      (v) =>
        v.hanzi.toLowerCase().includes(q) ||
        v.pinyin.toLowerCase().includes(q) ||
        v.meaningVi.toLowerCase().includes(q),
    );
  }, [vocabularies, search]);

  const handleComplete = () => {
    setMode('list');
    if (!studyKey || !studyMode) return;
    const type = studyMode === 'level' ? 'level' : 'topic';
    srsApi.getProgress(studyKey, type).then(setProgressMap);
  };

  if (error) return <ErrorState message={error} onRetry={() => location.reload()} />;

  // Flashcard mode — unified for all sources
  if (mode === 'flashcard') {
    return (
      <div className="w-full h-[80vh] pt-4 pb-12">
        <FlashcardGameFeature
          vocabularies={vocabularies.map((v) => ({
            id: v.id,
            hanzi: v.hanzi,
            pinyin: v.pinyin,
            meaningVi: v.meaningVi,
            example: v.example,
            audioKey: v.audioKey,
          }))}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  // List mode
  return (
    <div className="w-full flex flex-col pt-0 pb-32 px-4 relative">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-sm p-6 sm:p-10 min-h-[600px] relative z-10">

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={() => setListTab('vocab')}
            className={`px-8 py-3 rounded-full font-bold transition-all border-2 ${listTab === 'vocab' ? 'bg-white border-gray-100 shadow-sm text-[#215b3b]' : 'bg-[#f9f9f9] border-transparent text-gray-500 hover:bg-gray-100'}`}
          >
            Từ vựng ({vocabularies.length})
          </button>
          <button
            onClick={() => setListTab('grammar')}
            className={`px-8 py-3 rounded-full font-bold transition-all border-2 ${listTab === 'grammar' ? 'bg-white border-gray-100 shadow-sm text-[#215b3b]' : 'bg-[#f9f9f9] border-transparent text-gray-500 hover:bg-gray-100'}`}
          >
            Ngữ pháp (0)
          </button>
        </div>

        {/* Filters (vocab tab only) */}
        {listTab === 'vocab' && (
          <StudyLessonFilterBar search={search} onSearchChange={setSearch} />
        )}

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#111] mb-2 font-heading">
            {listTab === 'vocab' ? 'Vocabulary Library List' : 'Grammar Points'}
          </h1>
          <p className="text-gray-500 text-sm">
            {listTab === 'vocab'
              ? `${vocabularies.length} từ vựng — Học theo ${studyMode === 'level' ? 'cấp độ HSK' : 'chủ đề'}`
              : 'Key grammar structures to master'}
          </p>
        </div>

        {listTab === 'vocab' ? (
          loading ? (
            <div className="flex justify-center py-12">
              <PageLoading label="Đang tải..." />
            </div>
          ) : filteredVocab.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-gray-500 font-bold">
                {search ? 'Không tìm thấy từ phù hợp.' : 'Chưa có từ vựng nào.'}
              </p>
            </div>
          ) : (
            <StudyLessonVocabTable filteredVocab={filteredVocab} progressMap={progressMap} />
          )
        ) : (
          <StudyLessonGrammarList grammarPoints={[]} />
        )}
      </div>

      {/* Floating Action Button */}
      {vocabularies.length > 0 && !loading && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={() => setMode('flashcard')}
            className="px-12 py-4 bg-[#8BC34A] hover:bg-[#7CB342] text-white text-lg font-bold rounded-full shadow-[0_8px_30px_rgb(139,195,74,0.3)] transition-transform hover:scale-105 flex items-center gap-2"
          >
            Bắt đầu ôn tập Flashcard
          </button>
        </div>
      )}
    </div>
  );
}
