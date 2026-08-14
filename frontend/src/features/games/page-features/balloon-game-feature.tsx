'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePracticeEngine } from '@/features/practice/components/practice-engine';
import { BalloonMode } from '@/features/games/components/balloon-mode';
import { GameSummary } from '@/features/games/components/game-summary';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import type { SourceType } from '@/lib/api/types';

function BalloonGameContent({ searchParams }: { searchParams: URLSearchParams }) {
  const router = useRouter();
  const mode = searchParams.get('mode');
  const id = searchParams.get('lesson');

  let sourceType: SourceType = 'LESSON';
  if (mode === 'hsk') sourceType = 'LEVEL';
  else if (mode === 'topic') sourceType = 'TOPIC';

  const engine = usePracticeEngine<any>({
    practiceType: 'PINYIN_BALLOON_GAME',
    sourceType,
    sourceId: id || '',
    sessionKey: `practice:PINYIN_BALLOON_GAME:${sourceType}:${id}`,
  });

  if (engine.status === 'loading') {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><PageLoading label="Đang nạp đạn và bơm bóng bay..." /></div>;
  }

  if (engine.status === 'error' && engine.error) {
    return <ErrorState message={engine.error ?? 'Có lỗi xảy ra'} onRetry={() => window.location.reload()} />;
  }

  if (engine.status === 'finished' && engine.result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[60vh]">
        <GameSummary
          title="Tuyệt vời! 🎉"
          subtitle="Hoàn thành Bảo Vệ Căn Cứ (Balloon Game)"
          result={engine.result}
          elapsed={engine.elapsed}
          onReplay={() => window.location.reload()}
          onExit={() => router.back()}
        />
      </div>
    );
  }

  if (!engine.items.length) return null;

  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-80px)] min-h-[600px] relative z-10">
      <BalloonMode
        items={engine.items}
        onComplete={engine.handleComplete}
      />
    </div>
  );
}

export function BalloonGameFeature() {
  return (
    <Suspense fallback={<PageLoading label="Đang tải..." />}>
      <BalloonGameContent searchParams={useSearchParams()} />
    </Suspense>
  );
}
