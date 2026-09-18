'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { curriculumApi } from '@/lib/api/endpoints/curriculum';
import { ListeningGameFeature } from '@/features/games/page-features/listening-game-feature';
import { PageLoading } from '@/features/ui/components/spinner';

function ListeningGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const lesson = searchParams.get('lesson');

  const [vocabularies, setVocabularies] = useState<any[]>([]);
  const [allVocabularies, setAllVocabularies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchVocabs = async () => {
      setLoading(true);
      try {
        // Lấy danh sách từ vựng toàn cục để làm distractor (đáp án gây nhiễu) cho 4 phương án
        const globalList = await curriculumApi.listVocabularies({ limit: 200 });
        if (!isMounted) return;
        setAllVocabularies(globalList);

        if (lesson) {
          const params: any = { limit: 100 };
          if (mode === 'hsk') params.levelId = lesson;
          if (mode === 'topic') params.topicId = lesson;
          const targetList = await curriculumApi.listVocabularies(params);
          if (!isMounted) return;
          setVocabularies(targetList.length > 0 ? targetList : globalList);
        } else {
          setVocabularies(globalList);
        }
      } catch (err) {
        console.error('Failed to load vocabularies for listening game:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVocabs();
    return () => {
      isMounted = false;
    };
  }, [mode, lesson]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <PageLoading label="Đang chuẩn bị bộ câu hỏi luyện nghe..." />
      </div>
    );
  }

  if (!vocabularies.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có từ vựng</h2>
        <p className="text-gray-500 mb-6">Không tìm thấy từ vựng nào để luyện nghe.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-[#215b3b] text-white font-bold rounded-xl hover:bg-[#1a4a2f] transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <ListeningGameFeature
      vocabularies={vocabularies}
      allVocabularies={allVocabularies}
      questionCount={20}
      onExit={() => router.back()}
    />
  );
}

export default function ListeningGamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <PageLoading label="Đang tải trò chơi..." />
        </div>
      }
    >
      <ListeningGameContent />
    </Suspense>
  );
}
