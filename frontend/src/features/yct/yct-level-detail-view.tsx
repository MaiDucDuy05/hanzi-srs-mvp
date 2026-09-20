'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { yctApi, type YctLevel } from '@/lib/api/endpoints/yct';
import { Layers, Play, ArrowLeft } from 'lucide-react';
import { Spinner } from '@/features/ui/components/spinner';

interface YctLevelDetailViewProps {
  code: string;
}

export function YctLevelDetailView({ code }: YctLevelDetailViewProps) {
  const [level, setLevel] = useState<YctLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'vi';

  useEffect(() => {
    yctApi.getLevelByCode(code)
      .then((data) => setLevel(data))
      .catch((err) => {
        console.error('Failed to load level detail:', err);
        setError('Không tìm thấy thông tin cấp độ YCT này.');
      })
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Spinner className="w-10 h-10" />
        </div>
      ) : error || !level ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center">
          <p className="font-bold">{error || 'Không có dữ liệu.'}</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}/dashboard/yct`}
                className="p-2.5 rounded-2xl bg-[#e5f5eb] hover:bg-[#d0eedb] text-[#215b3b] transition-colors shadow-xs"
                title="Quay lại danh sách cấp độ"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h2 className="text-xl font-black text-[#11321e] flex items-center gap-2">
                  <span>{level.name} ({level.code})</span>
                  <span className="text-xs bg-[#e5f5eb] text-[#215b3b] font-bold px-3 py-1 rounded-full border border-[#eaf3c5]">
                    {level.lessons?.length || 0} bài học
                  </span>
                </h2>
                {level.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{level.description}</p>
                )}
              </div>
            </div>
          </div>

          {!level.lessons || level.lessons.length === 0 ? (
            <div className="bg-[#f3f8d7]/40 border-2 border-dashed border-[#eaf3c5] rounded-3xl p-12 text-center">
              <span className="text-5xl">📚</span>
              <h3 className="text-lg font-bold text-[#11321e] mt-3">Chưa có bài học nào</h3>
              <p className="text-sm text-gray-500 mt-1">
                Các bài học của cấp độ {level.code} đang được chuẩn bị. Bạn hãy quay lại sau nhé!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {level.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-3xl border border-[#eaf3c5] hover:border-[#78993a] shadow-xs hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="w-10 h-10 rounded-2xl bg-[#e5f5eb] text-[#215b3b] font-black flex items-center justify-center text-sm shadow-xs group-hover:bg-[#215b3b] group-hover:text-white transition-colors">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#215b3b] bg-[#e5f5eb] border border-[#eaf3c5] px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {lesson.vocabCount ?? 0} từ vựng
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#11321e] group-hover:text-[#215b3b] transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {lesson.description || 'Học từ vựng và câu ngắn qua thẻ hình ảnh.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Link
                      href={`/${locale}/study/yct/${lesson.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#215b3b] hover:bg-[#18452b] text-white font-bold py-3 px-4 rounded-2xl shadow-sm transition-all active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Vào học & Luyện tập</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
