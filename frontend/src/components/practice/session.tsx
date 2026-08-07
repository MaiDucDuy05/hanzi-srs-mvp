'use client';

import { usePracticeEngine } from './practice-engine';
import { MatchingMode, type MatchingState } from './matching-mode';
import { FlashcardMode, type FlashcardState } from './flashcard-mode';
import { FillBlankMode, type FillBlankState } from './fill-blank-mode';
import { SentenceOrderingMode, type OrderingState } from './sentence-ordering-mode';
import { LimitScreen, SummaryCard } from './session-frame';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { PRACTICE_TYPE_LABELS, SOURCE_TYPE_LABELS } from '@/lib/utils/constants';
import { formatDuration } from '@/lib/utils/format';
import type { PracticeType, SourceType } from '@/lib/api/types';

/** Trạng thái mode mà engine quản lý — mỗi chế độ có state riêng (P2-7). */
type PracticeModeState = MatchingState | FlashcardState | FillBlankState | OrderingState;

interface SessionProps {
  practiceType: PracticeType;
  sourceType: SourceType;
  sourceId: string;
  sourceLabel: string;
  onExit: () => void;
}

export function PracticeSession({
  practiceType,
  sourceType,
  sourceId,
  sourceLabel,
  onExit,
}: SessionProps) {
  const sessionKey = `practice:${practiceType}:${sourceType}:${sourceId}`;
  const engine = usePracticeEngine<PracticeModeState>({
    practiceType,
    sourceType,
    sourceId,
    sessionKey,
  });

  if (engine.status === 'loading') {
    return <PageLoading label="Đang chuẩn bị phiên luyện tập..." />;
  }

  if (engine.status === 'limit' && engine.limit) {
    return (
      <LimitScreen
        practiceType={practiceType}
        usedCount={engine.limit.usedCount}
        onExit={onExit}
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
        <span className="rounded-full bg-gray-100 px-3 py-1 font-mono text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {formatDuration(engine.elapsed)}
        </span>
      </header>

      {practiceType === 'WORD_MATCHING' && (
        <MatchingMode
          items={engine.items}
          initialState={engine.modeState as MatchingState | null}
          onStateChange={engine.setModeState}
          onComplete={engine.handleComplete}
        />
      )}
      {practiceType === 'FLASHCARD' && (
        <FlashcardMode
          items={engine.items}
          initialState={engine.modeState as FlashcardState | null}
          onStateChange={engine.setModeState}
          onComplete={engine.handleComplete}
        />
      )}
      {practiceType === 'FILL_BLANK' && (
        <FillBlankMode
          items={engine.items}
          initialState={engine.modeState as FillBlankState | null}
          onStateChange={engine.setModeState}
          onComplete={engine.handleComplete}
        />
      )}
      {practiceType === 'SENTENCE_ORDERING' && (
        <SentenceOrderingMode
          items={engine.items}
          initialState={engine.modeState as OrderingState | null}
          onStateChange={engine.setModeState}
          onComplete={engine.handleComplete}
        />
      )}
    </div>
  );
}
