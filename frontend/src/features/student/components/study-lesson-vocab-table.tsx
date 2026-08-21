import React from 'react';
import { Eye, Headset, Volume2 } from 'lucide-react';
import type { Vocabulary, UserVocabProgress } from '@/lib/api/types';
import { ClickableHanzi } from '@/features/ui/components/clickable-hanzi';
import { speakText } from '@/lib/utils/tts';

interface StudyLessonVocabTableProps {
  filteredVocab: Vocabulary[];
  progressMap: Record<string, UserVocabProgress>;
}

export function StudyLessonVocabTable({ filteredVocab, progressMap }: StudyLessonVocabTableProps) {
  return (
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
                  <ClickableHanzi text={item.hanzi} charClassName="text-3xl font-bold text-[#111]" />
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
                    {(item.audioKey || item.hanzi) && (
                      <button
                        onClick={() => {
                          if (item.hanzi) {
                            speakText(item.hanzi);
                          } else if (item.audioKey) {
                            new Audio(`https://cdn.duguyih.cn/audio/${item.audioKey}`).play().catch(() => {});
                          }
                        }}
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
  );
}
