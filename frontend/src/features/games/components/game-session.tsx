'use client';

import { useTranslations } from 'next-intl';
import { usePracticeEngine } from '../../practice/components/practice-engine';
import { BalloonMode } from './balloon-mode';
import type { ShooterCtx } from '../sec/shooter-sec';
import { MemoryMode } from './memory-mode';
import { WritingMode } from './writing-mode';
import type { MemoryState } from './memory-mode';
import type { WritingState } from './writing-mode';
import { LimitScreen, SummaryCard } from '../../practice/components/session-frame';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { labelForPracticeType, labelForSourceType } from '@/lib/utils/constants';
import { formatDuration } from '@/lib/utils/format';
import type { SourceType } from '@/lib/api/types';

type GameType = 'PINYIN_BALLOON_GAME' | 'MEMORY_GAME' | 'HANZI_WRITING';

type GameModeState = ShooterCtx | MemoryState | WritingState;

interface GameSessionProps {
  practiceType: GameType;
  sourceType: SourceType;
  sourceId: string;
  sourceLabel: string;
  onExit: () => void;
}

export function GameSession({
  practiceType,
  sourceType,
  sourceId,
  sourceLabel,
  onExit,
}: GameSessionProps) {
  const t = useTranslations('Constants');
  const tPractice = useTranslations('Practice');
  const sessionKey = `game:${practiceType}:${sourceType}:${sourceId}`;
  const engine = usePracticeEngine<GameModeState>({
    practiceType,
    sourceType,
    sourceId,
    sessionKey,
  });

  if (engine.status === 'loading') {
    return <PageLoading label={tPractice('gameLoading')} />;
  }

  if (engine.status === 'limit' && engine.limit) {
    return (
      <LimitScreen
        practiceType={practiceType}
        usedCount={engine.limit.usedCount}
        onExit={onExit}
        kind="game"
      />
    );
  }

  if (engine.status === 'error') {
    return <ErrorState message={engine.error ?? tPractice('initError')} onRetry={onExit} />;
  }

  if (engine.status === 'finished' && engine.result) {
    return (
      <SummaryCard
        title={tPractice('finishedTitle')}
        subtitle={labelForPracticeType(t, practiceType)}
        result={engine.result}
        elapsed={engine.elapsed}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <button onClick={onExit} className="text-sm text-brand hover:underline">
            ← {tPractice('exit')}
          </button>
          <h1 className="text-xl font-bold">{labelForPracticeType(t, practiceType)}</h1>
          <p className="text-sm text-gray-500">
            {labelForSourceType(t, sourceType)}: {sourceLabel}
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 font-mono text-sm text-gray-600  ">
          {formatDuration(engine.elapsed)}
        </span>
      </header>

      {practiceType === 'PINYIN_BALLOON_GAME' && (
        <BalloonMode
          items={engine.items}
          onComplete={engine.handleComplete}
        />
      )}
      {practiceType === 'MEMORY_GAME' && (
        <MemoryMode
          items={engine.items}
          initialState={engine.modeState as MemoryState | null}
          onStateChange={engine.setModeState}
          onComplete={engine.handleComplete}
        />
      )}
      {practiceType === 'HANZI_WRITING' && (
        <WritingMode
          items={engine.items}
          initialState={engine.modeState as WritingState | null}
          onStateChange={engine.setModeState}
          onComplete={engine.handleComplete}
        />
      )}
    </div>
  );
}
