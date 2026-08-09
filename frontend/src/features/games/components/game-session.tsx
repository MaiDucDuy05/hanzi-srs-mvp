'use client';

import { usePracticeEngine } from '../../practice/components/practice-engine';
import { BalloonMode, type BalloonState } from './balloon-mode';
import { MemoryMode, type MemoryState } from './memory-mode';
import { WritingMode, type WritingState } from './writing-mode';
import { LimitScreen, SummaryCard } from '../../practice/components/session-frame';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { PRACTICE_TYPE_LABELS, SOURCE_TYPE_LABELS } from '@/lib/utils/constants';
import { formatDuration } from '@/lib/utils/format';
import type { SourceType } from '@/lib/api/types';

type GameType = 'PINYIN_BALLOON_GAME' | 'MEMORY_GAME' | 'HANZI_WRITING';

/** Trạng thái mode của các trò chơi (P2-7). */
type GameModeState = BalloonState | MemoryState | WritingState;

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
  const sessionKey = `game:${practiceType}:${sourceType}:${sourceId}`;
  const engine = usePracticeEngine<GameModeState>({
    practiceType,
    sourceType,
    sourceId,
    sessionKey,
  });

  if (engine.status === 'loading') {
    return <PageLoading label="Đang chuẩn bị trò chơi..." />;
  }

  if (engine.status === 'limit' && engine.limit) {
    return (
      <LimitScreen
        practiceType={practiceType}
        usedCount={engine.limit.usedCount}
        onExit={onExit}
        kind="chơi"
      />
    );
  }

  if (engine.status === 'error') {
    return <ErrorState message={engine.error ?? 'Có lỗi xảy ra.'} onRetry={onExit} />;
  }

  if (engine.status === 'finished' && engine.result) {
    return (
      <SummaryCard
        title="Hoàn thành! 🎉"
        subtitle={PRACTICE_TYPE_LABELS[practiceType]}
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
            ← Thoát
          </button>
          <h1 className="text-xl font-bold">{PRACTICE_TYPE_LABELS[practiceType]}</h1>
          <p className="text-sm text-gray-500">
            {SOURCE_TYPE_LABELS[sourceType]}: {sourceLabel}
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 font-mono text-sm text-gray-600  ">
          {formatDuration(engine.elapsed)}
        </span>
      </header>

      {practiceType === 'PINYIN_BALLOON_GAME' && (
        <BalloonMode
          items={engine.items}
          initialState={engine.modeState as BalloonState | null}
          onStateChange={engine.setModeState}
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
