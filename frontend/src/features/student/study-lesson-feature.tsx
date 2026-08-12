'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FlashcardGameFeature } from '@/features/games/page-features/flashcard-game-feature';
import { curriculumApi } from '@/lib/api/endpoints/curriculum';
import { srsApi } from '@/lib/api/endpoints/srs';
import type { Vocabulary, GrammarPoint, UserVocabProgress } from '@/lib/api/types';

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
    srsApi.getProgress(lessonId).then(setProgressMap).catch(console.error);
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
    srsApi.getProgress(lessonId).then(setProgressMap);
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
            <div className="flex flex-col lg:flex-row gap-4 mb-10">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search Chinese words, pinyin, meaning..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8BC34A] focus:border-transparent font-medium"
                />
              </div>
              <div className="flex gap-4">
                <select className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-600 font-medium focus:outline-none cursor-pointer">
                  <option>HSK Level: All</option>
                </select>
                <select className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-600 font-medium focus:outline-none cursor-pointer">
                  <option>Tag: All</option>
                </select>
                <select className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-600 font-medium focus:outline-none cursor-pointer">
                  <option>Mastery: All</option>
                </select>
              </div>
            </div>
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
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f9fdf5] text-xs font-bold text-[#4a6b38] uppercase tracking-wider border-b-2 border-white">
                    <th className="p-4 rounded-tl-xl whitespace-nowrap">Hanzi <span className="inline-block ml-1 opacity-50">↕</span></th>
                    <th className="p-4 whitespace-nowrap">Pinyin <span className="inline-block ml-1 opacity-50">↕</span></th>
                    <th className="p-4 whitespace-nowrap">Meaning <span className="inline-block ml-1 opacity-50">↕</span></th>
                    <th className="p-4 whitespace-nowrap">Part of Speech <span className="inline-block ml-1 opacity-50">↕</span></th>
                    <th className="p-4 whitespace-nowrap">Mastery Level <span className="inline-block ml-1 opacity-50">↕</span></th>
                    <th className="p-4 rounded-tr-xl text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocab.map((item) => {
                    const progress = progressMap[item.id];
                    const mastery = progress?.masteryLevel ?? 0;
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <span className="text-3xl font-bold text-[#111]">{item.hanzi}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-base font-semibold text-[#215b3b]">{item.pinyin}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-bold text-gray-700">{item.meaningVi}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-bold text-gray-500">{item.partOfSpeech ?? '—'}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 items-end h-6">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`w-3 rounded-sm ${level <= mastery ? 'bg-[#8BC34A]' : 'bg-[#e5f5eb]'}`}
                                style={{ height: `${25 + (level - 1) * 25}%` }}
                              ></div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            {item.audioKey && (
                              <button
                                onClick={() => new Audio(`https://cdn.duguyih.cn/audio/${item.audioKey}`).play().catch(() => {})}
                                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#215b3b] transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                            <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#215b3b] transition-colors">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {grammarPoints.map((item) => (
                <div key={item.id} className="w-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black text-[#215b3b]">
                        {item.structure ?? item.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 font-medium">{item.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
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
