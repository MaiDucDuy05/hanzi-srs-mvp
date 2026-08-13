'use client';

import React, { use, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { curriculumApi } from '@/lib/api/endpoints';
import type { Topic, Vocabulary } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { AudioButton } from '@/features/ui/components/audio-button';

export function TopicDetailFeature({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const topics = await curriculumApi.listTopics({ status: 'PUBLISHED', limit: 100 });
        if (cancelled) return;
        
        const found = topics.find((t) => t.slug === resolvedParams.slug);
        if (!found) {
          setError('Không tìm thấy chủ đề này.');
          setLoading(false);
          return;
        }
        
        setTopic(found);
        const links = await curriculumApi.listTopicVocabularies({ topicId: found.id, limit: 1000 });
        if (cancelled) return;
        
        const vocabs = await Promise.all(
          links.map((link) => curriculumApi.getVocabulary(link.vocabularyId)),
        );
        
        if (cancelled) return;
        setVocabularies(vocabs);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải chủ đề.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [resolvedParams.slug]);

  const filteredVocabs = useMemo(() => {
    if (!searchQuery.trim()) return vocabularies;
    const lowerQuery = searchQuery.toLowerCase();
    return vocabularies.filter(v =>
      v.hanzi.toLowerCase().includes(lowerQuery) ||
      v.pinyin.toLowerCase().includes(lowerQuery) ||
      v.meaningVi.toLowerCase().includes(lowerQuery)
    );
  }, [vocabularies, searchQuery]);

  const totalPages = Math.ceil(filteredVocabs.length / itemsPerPage);
  const currentVocabs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVocabs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVocabs, currentPage]);

  if (loading) return <PageLoading label="Đang tải chủ đề..." />;
  if (error || !topic) return <ErrorState message={error ?? 'Không tìm thấy chủ đề.'} onRetry={() => location.reload()} />;

  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#eef7e9] rounded-full transform -rotate-12 scale-110 z-0" />
            <img src="/assets/illustrations/bamboo/bamboo.png" alt="Bamboo" className="w-auto h-24 sm:h-32 object-contain relative z-10" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#215b3b] font-heading">
              {topic.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{vocabularies.length} từ vựng</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm từ vựng..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border-2 border-transparent focus:border-[#8BC34A] focus:outline-none shadow-sm transition-all text-[#215b3b] font-medium placeholder:font-normal"
            />
          </div>
          
          <Link href={`/dashboard/practice?sourceType=TOPIC&sourceId=${topic.id}&type=WORD_MATCHING`} className="w-full sm:w-auto">
            <button className="w-full sm:w-auto py-3 px-8 bg-[#8BC34A] hover:bg-[#7CB342] text-white font-extrabold rounded-2xl transition-all shadow-[0_4px_15px_-4px_rgba(139,195,74,0.4)] hover:shadow-[0_6px_20px_-4px_rgba(139,195,74,0.5)] hover:-translate-y-0.5">
              Luyện tập ngay
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm flex-1">
        {topic.description && (
          <p className="text-[#4a6b38] font-medium mb-6 bg-[#f3f9f5] p-4 rounded-2xl border border-[#d6ebd0]">
            {topic.description}
          </p>
        )}

        {currentVocabs.length === 0 ? (
          <div className="py-12 text-center text-[#4a6b38]">
            {searchQuery ? `Không tìm thấy từ vựng cho "${searchQuery}"` : 'Chủ đề này chưa có từ vựng nào.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {currentVocabs.map((v) => (
              <li key={v.id} className="flex items-center gap-4 py-4 hover:bg-[#f9fdf5] transition-colors rounded-xl px-2 sm:px-4 -mx-2 sm:-mx-4">
                <span className="hanzi w-12 sm:w-16 text-2xl sm:text-3xl font-bold text-[#215b3b]">{v.hanzi}</span>
                <span className="w-24 sm:w-32 text-sm sm:text-base font-semibold text-gray-500">{v.pinyin}</span>
                <span className="flex-1 text-sm sm:text-base text-gray-700 font-medium">{v.meaningVi}</span>
                <div className="bg-[#f3f9f5] rounded-full p-1 border border-[#e5f5eb]">
                  <AudioButton audioKey={v.audioKey} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 mb-4 flex items-center justify-center md:justify-end gap-2 text-sm font-medium text-[#4a6b38]">
          <span className="mr-4 hidden sm:inline">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredVocabs.length)} / {filteredVocabs.length} từ
          </span>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">Trước</button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                  <button onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${currentPage === page ? 'bg-[#8BC34A] text-white font-bold' : 'hover:bg-white'}`}>
                    {page}
                  </button>
                </React.Fragment>
              ))}
          </div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded-lg hover:bg-white disabled:opacity-50 transition-colors">Sau</button>
        </div>
      )}
    </div>
  );
}
