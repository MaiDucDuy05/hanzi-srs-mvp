'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { usePracticeEngine } from './practice-engine';
import { MatchingMode, type MatchingState } from './matching-mode';
import { FlashcardMode, type FlashcardState } from './flashcard-mode';
import { FillBlankMode, type FillBlankState } from './fill-blank-mode';
import { SentenceOrderingMode, type OrderingState } from './sentence-ordering-mode';
import { LimitScreen } from './session-frame';
import { GameSummary } from '@/features/games/components/game-summary';
import { WritingMode, type WritingState } from '@/features/games/components/writing-mode';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { labelForPracticeType, labelForSourceType } from '@/lib/utils/constants';
import { formatDuration } from '@/lib/utils/format';
import type { PracticeType, SourceType, HanziChar } from '@/lib/api/types';
import type { QuestionItem } from './practice-models';

/** Trạng thái mode mà engine quản lý — mỗi chế độ có state riêng (P2-7). */
type PracticeModeState = MatchingState | FlashcardState | FillBlankState | OrderingState | WritingState;

interface SessionProps {
  practiceType: PracticeType;
  sourceType: SourceType;
  sourceId: string;
  sourceLabel: string;
  onExit: () => void;
  attemptId?: string;
  hanziChars?: HanziChar[];
}

export function PracticeSession({
  practiceType,
  sourceType,
  sourceId,
  sourceLabel,
  onExit,
  attemptId,
  hanziChars,
}: SessionProps) {
  const t = useTranslations('Constants');
  const tPractice = useTranslations('Practice');
  const baseSessionKey = `practice:${practiceType}:${sourceType}:${sourceId}`;
  const engine = usePracticeEngine<PracticeModeState>({
    practiceType,
    sourceType,
    sourceId,
    sessionKey: attemptId ? `practice:attempt:${attemptId}` : baseSessionKey,
    initialAttemptId: attemptId,
    initialHanziChars: hanziChars,
  });

  if (engine.status === 'loading') {
    return <PageLoading label={tPractice('preparingReview')} />;
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
    return <ErrorState message={engine.error ?? tPractice('initError')} onRetry={onExit} />;
  }

  if (engine.status === 'finished' && engine.result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <GameSummary
          title={tPractice('greatJob')}
          subtitle={`${tPractice('completedPrefix')} ${labelForPracticeType(t, practiceType)}`}
          result={engine.result}
          elapsed={engine.elapsed}
          onReplay={() => window.location.reload()}
          onExit={onExit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 min-h-full flex flex-col">
      {practiceType !== 'HANZI_WRITING' && practiceType !== 'WORD_MATCHING' && (
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <button onClick={onExit} className="text-sm text-brand hover:underline">
              ← {tPractice('exit', { defaultValue: 'Thoát' })}
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
      )}

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
      {practiceType === 'SENTENCE_ORDERING' && engine.sentenceQuestions.length > 0 && (
        <SentenceOrderingMode
          questions={engine.sentenceQuestions}
          initialState={engine.modeState as OrderingState | null}
          onAnswersChange={engine.setUserAnswers}
          onComplete={engine.handleComplete}
        />
      )}
      {practiceType === 'HANZI_WRITING' && engine.hanziChars.length > 0 && (
        <HanziWritingModeWrapper
          chars={engine.hanziChars}
          initialState={engine.modeState as WritingState | null}
          onStateChange={engine.setModeState}
          onComplete={engine.handleComplete}
        />
      )}
    </div>
  );
}

/** PR-13: Map HanziChar[] → QuestionItem[] rồi render WritingMode. */
function HanziWritingModeWrapper({
  chars,
  initialState,
  onStateChange,
  onComplete,
}: {
  chars: HanziChar[];
  initialState: WritingState | null;
  onStateChange: (s: WritingState) => void;
  onComplete: (r: import('./practice-models').ModeResult) => void;
}) {
  // Map HanziChar → QuestionItem (WritingMode expects QuestionItem[])
  const items = React.useMemo<QuestionItem[]>(() => {
    return chars.map((c) => ({
      id: c.vocabularyId,
      hanzi: c.char,
      pinyin: c.pinyin,
      meaning: c.meaning,
      audioKey: c.audioKey,
    }));
  }, [chars]);

  return (
    <WritingMode
      items={items}
      initialState={initialState}
      onStateChange={onStateChange}
      onComplete={onComplete}
    />
  );
}
