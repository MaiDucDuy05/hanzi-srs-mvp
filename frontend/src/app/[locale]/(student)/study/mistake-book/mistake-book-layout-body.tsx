'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

type MockKind = 'BANK' | 'BUY' | 'SELL' | 'LIBRARY';
type MockType = 'VOCAB' | 'GRAMMAR';

const MOCK_MISTAKES: { id: string; word: string; pinyin: string; kind: MockKind; type: MockType; date: string }[] = [
  { id: '1', word: '银行', pinyin: 'yínháng', kind: 'BANK', type: 'VOCAB', date: '2023-10-01' },
  { id: '2', word: '买', pinyin: 'mǎi', kind: 'BUY', type: 'VOCAB', date: '2023-10-05' },
  { id: '3', word: '卖', pinyin: 'mài', kind: 'SELL', type: 'GRAMMAR', date: '2023-10-05' },
  { id: '4', word: '图书馆', pinyin: 'túshūguǎn', kind: 'LIBRARY', type: 'VOCAB', date: '2023-10-10' },
];

function meaningKey(kind: MockKind): string {
  switch (kind) {
    case 'BANK': return 'meaningBank';
    case 'BUY': return 'meaningBuy';
    case 'SELL': return 'meaningSell';
    case 'LIBRARY': return 'meaningLibrary';
  }
}

function typeKey(type: MockType): string {
  return type === 'VOCAB' ? 'typeVocabulary' : 'typeGrammar';
}

export function MistakeBookLayoutBody({ children }: { children: React.ReactNode }) {
  const t = useTranslations('MistakeBook');

  return (
    <div className="flex h-[calc(100vh-140px)] w-full gap-6">
      {/* LEFT COLUMN: Master List */}
      <aside className="w-[300px] flex-shrink-0 border-r border-gray-100 pr-4 flex flex-col h-full">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{t('heading')}</h2>
          <p className="text-sm text-gray-500 mt-1">{t('subheading')}</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {MOCK_MISTAKES.map((mistake) => (
            <Link
              key={mistake.id}
              href={`/mistake-book/${mistake.id}`}
              className="block p-4 bg-white border border-gray-100 rounded-xl hover:border-green-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-green-500 outline-none"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-lg text-gray-900">{mistake.word}</span>
                <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-600 rounded-full">
                  {t(typeKey(mistake.type))}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                {mistake.pinyin} - {t(meaningKey(mistake.kind))}
              </p>
              <p className="text-xs text-gray-400">
                {t('lastMistake', { date: mistake.date })}
              </p>
            </Link>
          ))}
        </div>
      </aside>

      {/* RIGHT COLUMN: Detail content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
