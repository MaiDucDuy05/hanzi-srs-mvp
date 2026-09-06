'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { resourceApi } from '@/lib/api/endpoints';
import type { MistakeBookEntry } from '@/lib/api/types';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { PageLoading } from '@/features/ui/components/spinner';

export function MistakeBookLayoutBody({ children }: { children: React.ReactNode }) {
  const t = useTranslations('MistakeBook');
  const params = useParams();
  const currentId = params.id as string | undefined;

  const [mistakes, setMistakes] = useState<MistakeBookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resourceApi.listMistakes({ limit: 100 }).then((data) => {
      setMistakes(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-[calc(100vh-140px)] w-full gap-6">
      {/* LEFT COLUMN: Master List */}
      <aside className="w-[300px] flex-shrink-0 border-r border-gray-100 pr-4 flex flex-col h-full">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{t('heading')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('subheading')}</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {loading ? (
            <div className="py-8"><PageLoading label={t('loadingMistakes', { fallback: 'Đang tải...' })} /></div>
          ) : mistakes.length === 0 ? (
            <div className="py-8 text-center text-gray-500">{t('emptyHeading', { fallback: 'Chưa có lỗi sai nào' })}</div>
          ) : mistakes.map((mistake) => {
            const qs = mistake.questionSnapshot || {};
            const word = qs.prompt || qs.word || qs.char || mistake.sourceId;
            const pinyin = qs.pinyin || '';
            const meaning = qs.translation || qs.meaning || '';
            const typeKeyStr = mistake.questionType === 'VOCAB' ? 'typeVocabulary' : 'typeGrammar';
            const lastWrong = mistake.lastFailedAt ? new Date(mistake.lastFailedAt).toLocaleDateString() : '';
            const isActive = currentId === mistake.id;

            return (
              <Link
                key={mistake.id}
                href={`/study/mistake-book/${mistake.id}`}
                className={cn(
                  "block p-4 bg-white border rounded-xl hover:shadow-sm transition-all outline-none",
                  isActive ? "border-green-500 shadow-sm ring-1 ring-green-500" : "border-gray-100 hover:border-green-300"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-lg text-gray-900">{word}</span>
                  <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-600 rounded-full">
                    {t(typeKeyStr)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2 truncate">
                  {pinyin} {meaning ? `- ${meaning}` : ''}
                </p>
                <p className="text-xs text-gray-400">
                  {t('lastMistake', { date: lastWrong })}
                </p>
              </Link>
            )
          })}
        </div>
      </aside>

      {/* RIGHT COLUMN: Detail content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
