'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import type { Vocabulary, UserVocabProgress } from '@/lib/api/types';
import { ClickableHanzi } from '@/features/ui/components/clickable-hanzi';
import { speakText } from '@/lib/utils/tts';
import { useTranslations } from 'next-intl';

interface StudyLessonVocabTableProps {
  filteredVocab: Vocabulary[];
  progressMap: Record<string, UserVocabProgress>;
  onLearn?: (id: string) => void;
}

export function StudyLessonVocabTable({ filteredVocab, progressMap, onLearn }: StudyLessonVocabTableProps) {
  const t = useTranslations('Study.vocabTable');
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#f9fdf5] text-xs font-bold text-[#4a6b38] uppercase tracking-wider border-b-2 border-white">
            <th className="p-4 rounded-tl-xl whitespace-nowrap">{t('hanzi')} <span className="inline-block ml-1 opacity-50">↕</span></th>
            <th className="p-4 whitespace-nowrap">{t('pinyin')} <span className="inline-block ml-1 opacity-50">↕</span></th>
            <th className="p-4 whitespace-nowrap">{t('meaning')} <span className="inline-block ml-1 opacity-50">↕</span></th>
            <th className="p-4 whitespace-nowrap">{t('partOfSpeech')} <span className="inline-block ml-1 opacity-50">↕</span></th>
            <th className="p-4 whitespace-nowrap">{t('masteryLevel')} <span className="inline-block ml-1 opacity-50">↕</span></th>
            <th className="p-4 rounded-tr-xl text-center whitespace-nowrap">{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredVocab.map((item, index) => {
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
                    <button
                      onClick={() => onLearn?.(item.id)}
                      className="px-3 h-10 rounded-xl bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9] font-bold text-sm flex items-center transition-colors"
                    >
                      {t('learnThisWord')}
                    </button>
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
                        title={t('playAudioTitle')}
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    )}
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

