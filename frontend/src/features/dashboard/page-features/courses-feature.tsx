'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { curriculumApi } from '@/lib/api/endpoints';
import type { HskLevel } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';

export function CoursesFeature() {
  const [levels, setLevels] = useState<HskLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    curriculumApi.listLevels()
      .then((list) => setLevels(list.slice().sort((a, b) => a.displayOrder - b.displayOrder)))
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải danh sách cấp.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading label="Đang tải cấp độ..." />;
  if (error) return <ErrorState message={error} onRetry={() => location.reload()} />;

  return (
    <div className="w-full">
      <h1 className="text-4xl font-black text-[#215b3b] mb-8 font-heading">Khóa học HSK</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {levels.map((level, i) => (
          <Link href={`/dashboard/courses/${level.id}`} key={level.id}>
            <div className="bg-white rounded-[2rem] p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow h-full cursor-pointer">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-20 h-24 flex-shrink-0 flex items-center justify-center">
                  <img src="/assets/illustrations/bamboo/bamboo.png" alt="Bamboo" className="w-auto h-48 object-contain relative z-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black text-[#215b3b] mb-2">{level.code} — {level.name}</h2>
                  <p className="text-xs font-semibold text-gray-500">Cấp độ HSK {level.code.replace('HSK ', '')}</p>
                </div>
              </div>
              <button className="w-full py-3 px-4 bg-[#8BC34A] hover:bg-[#7CB342] text-white font-bold rounded-full transition-colors text-sm shadow-sm pointer-events-none">
                Học ngay
              </button>
            </div>
          </Link>
        ))}
        {levels.length === 0 && (
          <p className="text-sm text-gray-500 col-span-full">Chưa có cấp độ nào.</p>
        )}
      </div>
    </div>
  );
}
