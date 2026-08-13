'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FlashcardGameFeature } from '@/features/games/page-features/flashcard-game-feature';
import { curriculumApi } from '@/lib/api/endpoints/curriculum';
import { srsApi } from '@/lib/api/endpoints/srs';
import type { Vocabulary, GrammarPoint, UserVocabProgress } from '@/lib/api/types';
import { StudyLessonVocabTable } from './components/study-lesson-vocab-table';
import { StudyLessonGrammarList } from './components/study-lesson-grammar-list';
import { StudyLessonFilterBar } from './components/study-lesson-filter-bar';

export function StudyLessonFeature({ params }: { params: Promise<{ lessonId: string }> }) {
  const resolvedParams = React.use(params);
  const { lessonId } = resolvedParams;

  const [mode, setMode] = useState<'list' | 'flashcard'>('list');
  const [listTab, setListTab] = useState<'vocab' | 'grammar'>('vocab');

  // Data states
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [grammarPoints, setGrammarPoints] = useState<GrammarPoint[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserVocabProgress>>({});
  const [search, setSearch] = useState('');

  // Fetch lesson contents
  useEffect(() => {
    curriculumApi.getLessonContents(lessonId)
      .then(({ vocabularies: v, grammarPoints: g }) => {
        setVocabularies(v);
        setGrammarPoints(g);
      })
      .catch(console.error);
  }, [lessonId]);

  // Fetch SRS progress
  useEffect(() => {
    srsApi.getProgress(lessonId, 'lesson').then(setProgressMap).catch(console.error);
  }, [lessonId]);

  // Filtered vocabularies by search
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
    // Refresh progress after completing flashcards
    srsApi.getProgress(lessonId, 'lesson').then(setProgressMap);
  };

  if (mode === 'list') {
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
              Ngữ pháp ({grammarPoints.length})
            </button>
          </div>

          {/* Filters (only for Vocab) */}
          {listTab === 'vocab' && (
            <StudyLessonFilterBar search={search} onSearchChange={setSearch} />
          )}

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-[#111] mb-2 font-heading">
              {listTab === 'vocab' ? 'Vocabulary Library List' : 'Grammar Points'}
            </h1>
            <p className="text-gray-500 text-sm">
              {listTab === 'vocab' ? 'Your personal collection of Chinese words and phrases' : 'Key grammar structures to master'}
            </p>
          </div>

          {listTab === 'vocab' ? (
            <StudyLessonVocabTable filteredVocab={filteredVocab} progressMap={progressMap} />
          ) : (
            <StudyLessonGrammarList grammarPoints={grammarPoints} />
          )}
        </div>

        {/* Floating Action Button */}
        {vocabularies.length > 0 && (
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

  // Flashcard Mode — pass real vocabularies
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
