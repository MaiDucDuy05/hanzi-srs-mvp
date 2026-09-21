'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { yctApi, type YctLevel } from '@/lib/api/endpoints/yct';
import { BookOpen, Layers, ArrowRight } from 'lucide-react';
import { Spinner } from '@/features/ui/components/spinner';

export function YctLevelsView() {
  const [levels, setLevels] = useState<YctLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'vi';

  useEffect(() => {
    yctApi.getLevels()
      .then((data) => {
        setLevels(data);
      })
      .catch((err) => {
        console.error('Failed to load YCT levels:', err);
        setError('Không thể tải danh sách cấp độ YCT. Vui lòng thử lại sau.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Spinner className="w-10 h-10" />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center">
          <p className="font-bold">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((lvl) => {
            return (
              <div
                key={lvl.id}
                className="bg-white rounded-3xl border border-[#eaf3c5] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1"
              >
                {/* Banner đầu card — Màu xanh thương hiệu hệ thống */}
                <div className="bg-gradient-to-r from-[#1c4d32] to-[#256642] p-6 text-white relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl font-black tracking-wider text-white">
                      {lvl.code}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 text-emerald-100 border border-white/20">
                      YCT
                    </span>
                  </div>
                  <h3 className="text-2xl font-black mt-3">{lvl.name}</h3>
                </div>

                {/* Nội dung card */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {lvl.description || 'Chương trình chuẩn hoá cho thiếu nhi với từ vựng minh hoạ trực quan.'}
                  </p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 py-3 px-4 bg-[#f3f8d7]/40 rounded-2xl border border-[#eaf3c5]">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#215b3b]" />
                        <div>
                          <span className="text-xs text-gray-500 block font-medium">Bài học</span>
                          <span className="font-bold text-[#11321e] text-sm">
                            {lvl.totalLessons ?? 0} bài
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#215b3b]" />
                        <div>
                          <span className="text-xs text-gray-500 block font-medium">Từ vựng</span>
                          <span className="font-bold text-[#11321e] text-sm">
                            {lvl.totalVocabularies ?? 0} từ
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/dashboard/yct/${lvl.code.toLowerCase()}`}
                      className="w-full flex items-center justify-center gap-2 bg-[#215b3b] hover:bg-[#18452b] text-white font-bold py-3 px-4 rounded-2xl shadow-sm transition-all active:scale-95"
                    >
                      <span>Vào học ngay</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
