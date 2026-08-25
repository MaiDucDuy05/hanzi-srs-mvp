'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FlashcardGameFeature } from '@/features/games/page-features/flashcard-game-feature';
import { curriculumApi } from '@/lib/api/endpoints/curriculum';
import { srsApi } from '@/lib/api/endpoints/srs';
import { studentApi } from '@/lib/api/endpoints/student';
import type { Vocabulary, GrammarPoint, UserVocabProgress, UserLessonProgress } from '@/lib/api/types';
import { StudyLessonVocabTable } from './components/study-lesson-vocab-table';
import { StudyLessonGrammarList } from './components/study-lesson-grammar-list';
import { StudyLessonFilterBar } from './components/study-lesson-filter-bar';
import { LearnWordFlow } from '@/features/study/learn-word/learn-word-flow';
import { LearnGrammarFlow } from '@/features/study/learn-grammar/learn-grammar-flow';
import { CheckCircle2 } from 'lucide-react';

export function StudyLessonFeature({ params }: { params: Promise<{ lessonId: string }> }) {
  const resolvedParams = React.use(params);
  const { lessonId } = resolvedParams;

  const [mode, setMode] = useState<'list' | 'flashcard' | 'learn-word' | 'learn-grammar'>('list');
  const [listTab, setListTab] = useState<'vocab' | 'grammar'>('vocab');

  const [learnIndex, setLearnIndex] = useState(0);
  const [learnGrammarIndex, setLearnGrammarIndex] = useState(0);

  // Data states
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [grammarPoints, setGrammarPoints] = useState<GrammarPoint[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserVocabProgress>>({});
  const [lessonProgress, setLessonProgress] = useState<UserLessonProgress | null>(null);
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

  // Fetch SRS progress and Lesson progress
  useEffect(() => {
    srsApi.getProgress(lessonId, 'lesson').then(setProgressMap).catch(console.error);
    studentApi.getLessonProgress(lessonId).then(setLessonProgress).catch(console.error);
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

  const handleComplete = (type?: 'vocab' | 'grammar') => {
    setMode('list');
    
    if (type === 'vocab') {
      studentApi.completeLessonVocab(lessonId).then(setLessonProgress).catch(console.error);
    } else if (type === 'grammar') {
      studentApi.completeLessonGrammar(lessonId).then(setLessonProgress).catch(console.error);
    }

    // Refresh progress after completing flashcards
    srsApi.getProgress(lessonId, 'lesson').then(setProgressMap);
  };

  if (mode === 'learn-word') {
    return (
      <div className="w-full h-[80vh] pt-4 pb-12">
        <LearnWordFlow
          vocabularies={vocabularies}
          initialIndex={learnIndex}
          onClose={() => setMode('list')}
          onComplete={() => handleComplete('vocab')}
        />
      </div>
    );
  }

  if (mode === 'learn-grammar') {
    return (
      <div className="w-full h-[80vh] pt-4 pb-12">
        <LearnGrammarFlow
          grammarPoints={grammarPoints}
          initialIndex={learnGrammarIndex}
          onClose={() => setMode('list')}
          onComplete={() => handleComplete('grammar')}
        />
      </div>
    );
  }

  if (mode === 'list') {
    return (
      <div className="w-full flex flex-col pt-0 pb-32 px-4 relative">
        <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-sm p-6 sm:p-10 min-h-[600px] relative z-10">

          {/* Tab Switcher */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              onClick={() => setListTab('vocab')}
              className={`px-8 py-3 flex items-center gap-2 rounded-full font-bold transition-all border-2 ${listTab === 'vocab' ? 'bg-white border-gray-100 shadow-sm text-[#215b3b]' : 'bg-[#f9f9f9] border-transparent text-gray-500 hover:bg-gray-100'}`}
            >
              Từ vựng ({vocabularies.length})
              {lessonProgress?.vocabCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            </button>
            <button
              onClick={() => setListTab('grammar')}
              className={`px-8 py-3 flex items-center gap-2 rounded-full font-bold transition-all border-2 ${listTab === 'grammar' ? 'bg-white border-gray-100 shadow-sm text-[#215b3b]' : 'bg-[#f9f9f9] border-transparent text-gray-500 hover:bg-gray-100'}`}
            >
              Ngữ pháp ({grammarPoints.length})
              {lessonProgress?.grammarCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
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
            <StudyLessonVocabTable 
              filteredVocab={filteredVocab} 
              progressMap={progressMap} 
              onLearn={(id) => {
                const idx = vocabularies.findIndex(v => v.id === id);
                setLearnIndex(idx !== -1 ? idx : 0);
                setMode('learn-word');
              }}
            />
          ) : (
            <StudyLessonGrammarList grammarPoints={grammarPoints} />
          )}
        </div>

        {/* Floating Action Button */}
        {listTab === 'vocab' && vocabularies.length > 0 && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex gap-4">
            <button
              onClick={() => setMode('learn-word')}
              className="px-12 py-4 bg-[#1f5333] hover:bg-[#163f25] text-white text-lg font-bold rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
            >
              Bắt đầu học từ mới
            </button>
            <button
              onClick={() => setMode('flashcard')}
              className="px-12 py-4 bg-[#8BC34A] hover:bg-[#7CB342] text-white text-lg font-bold rounded-full shadow-[0_8px_30px_rgb(139,195,74,0.3)] transition-transform hover:scale-105 flex items-center gap-2"
            >
              Ôn tập Flashcard
            </button>
          </div>
        )}
        
        {listTab === 'grammar' && grammarPoints.length > 0 && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex gap-4">
            <button
              onClick={() => {
                setLearnGrammarIndex(0);
                setMode('learn-grammar');
              }}
              className="px-12 py-4 bg-[#1f5333] hover:bg-[#163f25] text-white text-lg font-bold rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
            >
              Bắt đầu học ngữ pháp
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
