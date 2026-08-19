'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePracticeEngine } from '@/features/practice/components/practice-engine';
import { MatchBoard, type MatchingState } from '@/features/games/components/match-game-board';
import { GameSummary } from '@/features/games/components/game-summary';
import { BambooProgressBar } from '@/features/ui/components/bamboo-progress-bar';
import { LimitScreen } from '@/features/practice/components/session-frame';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Button } from '@/features/ui/components/button';
import type { SourceType } from '@/lib/api/types';

function MatchGameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get('mode');
  const id = searchParams.get('lesson');

  if (!mode || !id) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800">Không tìm thấy bài học</h1>
          <p className="text-gray-500">Vui lòng chọn một bài học từ Bảng điều khiển để bắt đầu trò chơi.</p>
        </div>
        <Button onClick={() => router.push('/dashboard/practice')}>Về Bảng điều khiển</Button>
      </div>
    );
  }

  let sourceType: SourceType = 'LESSON';
  if (mode === 'hsk') sourceType = 'LEVEL';
  else if (mode === 'topic') sourceType = 'TOPIC';

  const engine = usePracticeEngine<MatchingState>({
    practiceType: 'WORD_MATCHING',
    sourceType,
    sourceId: id,
    sessionKey: `practice:WORD_MATCHING:${sourceType}:${id}`,
  });

  if (engine.status === 'loading') return <PageLoading label="Đang chuẩn bị phiên luyện tập..." />;

  if (engine.status === 'limit' && engine.limit) {
    return <LimitScreen practiceType="WORD_MATCHING" usedCount={engine.limit.usedCount} onExit={() => router.back()} />;
  }

  if (engine.status === 'error') {
    return <ErrorState message={engine.error ?? 'Có lỗi xảy ra.'} onRetry={() => router.back()} />;
  }

  if (engine.status === 'finished' && engine.result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <GameSummary
          title="Tuyệt vời! 🎉"
          subtitle="Hoàn thành Ghép thẻ (Match Game)"
          result={engine.result}
          elapsed={engine.elapsed}
          onReplay={() => window.location.reload()}
          onExit={() => router.back()}
        />
      </div>
    );
  }

  return (
    <MatchBoard
      items={engine.items}
      initialState={engine.modeState}
      onStateChange={engine.setModeState}
      onComplete={engine.handleComplete}
      elapsed={engine.elapsed}
    />
  );
}

export function MatchGameFeature() {
  return (
    <Suspense fallback={<PageLoading label="Đang tải trò chơi..." />}>
      <MatchGameContent />
    </Suspense>
  );
}
