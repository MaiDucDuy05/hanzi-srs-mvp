'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePracticeEngine } from '@/features/practice/components/practice-engine';
import { MemoryBoard, type MemoryState } from '@/features/games/components/memory-board';
import { GameSummary } from '@/features/games/components/game-summary';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import type { SourceType } from '@/lib/api/types';

function MemoryGameContent({ searchParams }: { searchParams: URLSearchParams }) {
  const router = useRouter();
  const t = useTranslations('Games');
  const mode = searchParams.get('mode');
  const id = searchParams.get('lesson');

  let sourceType: SourceType = 'LESSON';
  if (mode === 'hsk') sourceType = 'LEVEL';
  else if (mode === 'topic') sourceType = 'TOPIC';

  const engine = usePracticeEngine<MemoryState>({
    practiceType: 'MEMORY_GAME',
    sourceType,
    sourceId: id || '',
    sessionKey: `practice:MEMORY_GAME:${sourceType}:${id}`,
  });

  if (engine.status === 'loading') {
    return <div className="flex-1 flex items-center justify-center min-h-[50vh]"><PageLoading label={t('memoryLoading')} /></div>;
  }

  if (engine.status === 'error' && engine.error) {
    return <ErrorState message={engine.error} onRetry={() => window.location.reload()} />;
  }

  if (engine.status === 'finished' && engine.result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[60vh]">
        <GameSummary
          title={t('memoryTitle')}
          subtitle={t('memoryDesc')}
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
    <MemoryBoard
      items={engine.items}
      initialState={engine.modeState}
      onStateChange={engine.setModeState}
      onComplete={engine.handleComplete}
      elapsed={engine.elapsed}
    />
  );
}

export function MemoryGameFeature() {
  const t = useTranslations('Games');
  return (
    <Suspense fallback={<PageLoading label={t('memoryGenericLoading')} />}>
      <MemoryGameContent searchParams={useSearchParams()} />
    </Suspense>
  );
}
