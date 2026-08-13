import { SentenceGameFeature } from '@/features/games/page-features/sentence-game-feature';
import { SourceType } from '@/lib/api/types';
import Link from 'next/link';

export default function SentenceGamePage({
  searchParams,
}: {
  searchParams: { type?: string; id?: string };
}) {
  const type = (searchParams.type as SourceType) || 'LESSON';
  const id = searchParams.id;

  if (!id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy bài luyện tập</h1>
        <p className="text-gray-600 mb-6">Bạn cần chọn một bài học hoặc chủ đề cụ thể từ danh sách để bắt đầu.</p>
        <Link href="/dashboard/courses" className="px-6 py-2 bg-[#215b3b] text-white rounded-lg hover:bg-[#1a4a2f] transition-colors">
          Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  return <SentenceGameFeature sourceType={type} sourceId={id} />;
}
