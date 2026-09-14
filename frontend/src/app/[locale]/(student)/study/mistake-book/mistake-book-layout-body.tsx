'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { resourceApi } from '@/lib/api/endpoints';
import type { MistakeBookEntry } from '@/lib/api/types';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { PageLoading } from '@/features/ui/components/spinner';
import { RefreshCw, Search, Settings, X, Clock } from 'lucide-react';

export function MistakeBookLayoutBody({ children }: { children: React.ReactNode }) {
  const t = useTranslations('MistakeBook');
  const params = useParams();
  const router = useRouter();
  const currentId = params.id as string | undefined;

  const [mistakes, setMistakes] = useState<MistakeBookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<'ALL' | 'GRAMMAR' | 'VOCAB' | 'HSK1_2'>('ALL');

  useEffect(() => {
    resourceApi.listMistakes({ limit: 100 }).then((data) => {
      setMistakes(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filteredMistakes = mistakes.filter((m) => {
    if (filter === 'ALL') return true;
    if (filter === 'GRAMMAR') return m.questionType !== 'VOCAB';
    if (filter === 'VOCAB') return m.questionType === 'VOCAB';
    if (filter === 'HSK1_2') return m.sourceId?.toLowerCase().includes('hsk');
    return true;
  });

  return (
    <div className="flex flex-col bg-white rounded-[2rem] shadow-2xl w-full h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] mt-2 md:mt-4 overflow-hidden border border-gray-100">
      {/* Header inside the white container */}
      <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => router.push(`/${params.locale}/dashboard/achievements`)} 
             className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
           >
             <X className="w-5 h-5" />
           </button>
           <div>
             <h2 className="text-xl font-bold flex items-center gap-3 text-gray-800">
               {t('heading', { fallback: 'Sổ tay lỗi sai' })}
               <span className="text-xs font-bold px-2.5 py-1 bg-[#e8f5e9] text-[#2e7d32] rounded-full">
                 {t('itemsToReview', { count: filteredMistakes.length })}
               </span>
             </h2>
             <p className="text-xs text-gray-500 mt-0.5">{t('subheadingDesc')}</p>
           </div>
        </div>
        
        {/* Filters */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-full p-1 gap-1 border border-gray-100">
          <button 
            onClick={() => setFilter('ALL')}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-colors", filter === 'ALL' ? "bg-white shadow-sm text-gray-900 border border-gray-100" : "text-gray-500 hover:text-gray-900")}
          >
            {t('filterAll', { count: mistakes.length })}
          </button>
          <button 
            onClick={() => setFilter('GRAMMAR')}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-colors", filter === 'GRAMMAR' ? "bg-white shadow-sm text-gray-900 border border-gray-100" : "text-gray-500 hover:text-gray-900")}
          >
            {t('filterGrammar')}
          </button>
          <button 
            onClick={() => setFilter('VOCAB')}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-colors", filter === 'VOCAB' ? "bg-white shadow-sm text-gray-900 border border-gray-100" : "text-gray-500 hover:text-gray-900")}
          >
            {t('filterVocab')}
          </button>
          <button 
            onClick={() => setFilter('HSK1_2')}
            className={cn("px-4 py-1.5 text-sm font-medium rounded-full transition-colors", filter === 'HSK1_2' ? "bg-white shadow-sm text-gray-900 border border-gray-100" : "text-gray-500 hover:text-gray-900")}
          >
            {t('filterHSK')}
          </button>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COLUMN: Master List */}
        <aside className="w-[340px] shrink-0 border-r border-gray-100 bg-white flex flex-col h-full relative z-10">
          <div className="px-5 py-5 flex items-center justify-between shrink-0">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('listHeading')}</h3>
             <span className="text-[10px] font-bold px-2 py-1 bg-[#e8f5e9] text-[#2e7d32] rounded uppercase">
               {t('recordedItems', { count: filteredMistakes.length })}
             </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="py-8"><PageLoading label={t('loadingMistakes', { fallback: 'Đang tải...' })} /></div>
            ) : filteredMistakes.length === 0 ? (
              <div className="py-8 text-center text-gray-500">{t('emptyHeading', { fallback: 'Chưa có lỗi sai nào' })}</div>
            ) : filteredMistakes.map((mistake) => {
              const qs = mistake.questionSnapshot || {};
              const word = qs.prompt || qs.word || qs.char || mistake.sourceId;
              const pinyin = qs.pinyin || '';
              const meaning = qs.translation || qs.meaning || '';
              const isVocab = mistake.questionType === 'VOCAB';
              const lastWrong = mistake.lastFailedAt ? new Date(mistake.lastFailedAt).toLocaleDateString('vi-VN') : '';
              const isActive = currentId === mistake.id;

              return (
                <Link
                  key={mistake.id}
                  href={`/study/mistake-book/${mistake.id}`}
                  className={cn(
                    "block p-4 bg-white border rounded-2xl transition-all outline-none group",
                    isActive ? "border-[#2e7d32] shadow-sm ring-1 ring-[#2e7d32] bg-[#fdfdfd]" : "border-gray-200 hover:border-[#4caf50]"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-2xl text-gray-900 group-hover:text-[#2e7d32] transition-colors">{word}</span>
                    <span className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full",
                      isVocab ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-500"
                    )}>
                      {isVocab ? t('filterVocab') : t('filterGrammar')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-3 truncate">
                    {pinyin} {meaning ? `- ${meaning}` : ''}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-50">
                    <div className="flex items-center text-xs text-gray-400 gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {lastWrong ? t('lastMistake', { date: lastWrong }) : ''}
                    </div>
                    <span className="text-xs font-medium text-gray-400">
                      {t('failCount', { count: mistake.failCount })}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-white shrink-0">
            <button 
              onClick={() => router.push(`/${params.locale}/games/mistakes/review?filter=${filter.toLowerCase()}`)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-[#2e7d32] text-[#2e7d32] font-semibold hover:bg-[#e8f5e9] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t('reviewAll', { count: filteredMistakes.length })}
            </button>
          </div>
        </aside>

        {/* RIGHT COLUMN: Detail */}
        <main className="flex-1 bg-[#f9fafb] overflow-y-auto relative custom-scrollbar">
           {children}
        </main>
      </div>
    </div>
  );
}
