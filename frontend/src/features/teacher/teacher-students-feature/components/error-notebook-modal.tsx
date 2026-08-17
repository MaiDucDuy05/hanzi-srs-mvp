'use client';

import { useEffect, useState, useCallback } from 'react';
import { resourceApi } from '@/lib/api/endpoints';
import type { Mistake } from '../types';
import { sortByFailCount } from '../utils';
import { MistakeCard } from './mistake-card';

export function ErrorNotebookModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (lim: number) => {
    setLoading(true);
    try {
      const data = await resourceApi.listMistakes({ limit: lim });
      setMistakes(sortByFailCount(Array.isArray(data) ? data : []));
    } catch {
      setMistakes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (open) load(limit); }, [open, limit, load]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-[24px] shadow-2xl w-[600px] max-w-full h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-8 pb-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#fff4f4] flex items-center justify-center text-[#e55353]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h2 className="font-extrabold text-[#1f5333] text-xl">Sổ lỗi sai</h2>
              <p className="text-[12px] text-gray-400 font-medium">Nhấn vào dòng để xem chi tiết câu hỏi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="appearance-none bg-[#f3f4e1] text-[#1f5333] font-bold text-[13px] pl-4 pr-8 py-2 rounded-full cursor-pointer focus:outline-none"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#1f5333] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-8 pt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="animate-spin h-6 w-6 border-2 border-[#78993a] border-t-transparent rounded-full mr-3" />
              Đang tải...
            </div>
          ) : mistakes.length ? (
            mistakes.map((m, i) => <MistakeCard key={m.id} mistake={m} index={i} />)
          ) : (
            <div className="text-center py-16">
              <svg className="h-12 w-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-400 font-medium">Chưa có lỗi sai nào được ghi nhận.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
