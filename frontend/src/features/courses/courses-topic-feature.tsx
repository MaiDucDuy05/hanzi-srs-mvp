'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookMarked, BookOpen, ArrowRight } from 'lucide-react';
import { curriculumApi } from '@/lib/api/endpoints';
import type { Topic } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';

const TOPIC_GRADIENTS = [
  'from-[#fcfbe8] to-[#f3f4e1]',
  'from-[#e8f5e9] to-[#c8e6c9]',
  'from-[#f3e5f5] to-[#e1bee7]',
  'from-[#fff3e0] to-[#ffe0b2]',
  'from-[#e3f2fd] to-[#bbdefb]',
  'from-[#fce4ec] to-[#f8bbd9]',
];

export function CoursesTopicFeature() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    curriculumApi.listTopics({ status: 'PUBLISHED', limit: 100 }).then((data) => {
      if (cancelled) return;
      setTopics(data);
      setLoading(false);
    }).catch((e) => {
      if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.');
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageLoading label="Đang tải chủ đề..." />;
  if (error) return <ErrorState message={error} onRetry={() => location.reload()} />;

  return (
    <div className="pb-10 max-w-[1200px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-2xl bg-[#c7cf35] flex items-center justify-center shadow-sm">
            <BookMarked className="h-6 w-6 text-[#11321e]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#11321e]">Khóa học theo Topic</h1>
            <p className="text-sm text-gray-500 font-medium">Học theo chủ đề phổ biến</p>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      {topics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10 text-gray-300" />
          </div>
          <p className="text-gray-500 font-bold">Chưa có chủ đề nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((topic, idx) => {
            const gradient = TOPIC_GRADIENTS[idx % TOPIC_GRADIENTS.length];
            return (
              <button
                key={topic.id}
                onClick={() => router.push(`/study?topicId=${topic.id}`)}
                className="group bg-white rounded-[28px] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 text-left hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${gradient} p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <BookMarked className="h-5 w-5 text-[#11321e]" strokeWidth={2.5} />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#85d038] bg-white/70 px-3 py-1 rounded-full backdrop-blur-sm">
                      <BookOpen className="h-3.5 w-3.5" strokeWidth={2.5} />
                      {topic.vocabularyCount} từ
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-extrabold text-[#11321e] mb-1">{topic.name}</h3>
                  {topic.description && (
                    <p className="text-sm text-gray-400 font-medium mb-4 line-clamp-2">{topic.description}</p>
                  )}

                  {/* Action */}
                  <div className="flex items-center gap-2 text-[#85d038] font-bold text-sm group-hover:gap-3 transition-all">
                    <span>Học ngay</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
