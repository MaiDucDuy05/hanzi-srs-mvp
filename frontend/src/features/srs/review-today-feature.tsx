'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { srsApi } from '@/lib/api/endpoints/srs';
import type { Vocabulary } from '@/lib/api/types';
import { FlashcardGameFeature } from '@/features/games/page-features/flashcard-game-feature';
import { GameSummary } from '@/features/games/components/game-summary';
import { Loader2 } from 'lucide-react';

export function ReviewTodayFeature() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    srsApi.getDueItems()
      .then((items) => {
        setVocabularies(items);
        if (items.length === 0) {
          setIsFinished(true);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load review items'))
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = () => {
    setIsFinished(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#8BC34A] mb-4" />
        <p className="text-[#215b3b] font-medium">Đang tải thẻ ôn tập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[60vh]">
        <GameSummary
          title={vocabularies.length === 0 ? 'Không có từ mới!' : 'Hoàn thành ôn tập! 🎉'}
          subtitle={vocabularies.length === 0 ? 'Bạn đã ôn tập xong tất cả thẻ cho hôm nay.' : 'Bạn đã hoàn thành phiên ôn tập hôm nay.'}
          result={{
            score: vocabularies.length * 10,
            correctCount: vocabularies.length,
            wrongCount: 0,
            moveCount: 0,
            answerData: {}
          }}
          elapsed={0}
          onReplay={() => window.location.reload()}
          onExit={() => router.push('/dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="h-full pt-4 pb-12 w-full max-w-4xl mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-black text-[#215b3b]">Ôn tập hôm nay</h2>
        <p className="text-gray-500">Bạn có {vocabularies.length} từ cần ôn</p>
      </div>
      <FlashcardGameFeature
        vocabularies={vocabularies}
        onComplete={handleComplete}
      />
    </div>
  );
}
