'use client';

import Link from 'next/link';
import { usePracticeEngine } from './practice-engine';
import {
  type ModeResult,
} from './practice-models';
import { MatchingMode, type MatchingState } from './matching-mode';
import { FlashcardMode, type FlashcardState } from './flashcard-mode';
import { FillBlankMode, type FillBlankState } from './fill-blank-mode';
import { SentenceOrderingMode, type OrderingState } from './sentence-ordering-mode';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { PRACTICE_TYPE_LABELS, SOURCE_TYPE_LABELS } from '@/lib/utils/constants';
import { formatDuration } from '@/lib/utils/format';
import type { PracticeType, SourceType } from '@/lib/api/types';

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
  const engine = usePracticeEngine({ practiceType, sourceType, sourceId, sessionKey });

  if (engine.status === 'loading') {
    return <PageLoading label="Đang chuẩn bị phiên luyện tập..." />;
  }

  if (engine.status === 'limit' && engine.limit) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader
          title="Hết lượt luyện tập hôm nay"
          subtitle={PRACTICE_TYPE_LABELS[practiceType]}
        />
        <CardBody className="space-y-3">
          <p className="text-sm text-gray-600">
            Bạn đã dùng hết lượt miễn phí hôm nay cho chế độ này (đã dùng{' '}
            {engine.limit.usedCount} lượt). Lượt sẽ được làm mới vào ngày mai, hoặc
            nâng cấp VIP để luyện không giới hạn.
          </p>
          <div className="flex gap-2">
            <Link href="/upgrade-vip">
              <Button size="sm">Nâng cấp VIP</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={onExit}>
              Quay lại
            </Button>
          </div>
        </CardBody>
      </Card>
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

export function SummaryCard({
  title,
  subtitle,
  result,
  elapsed,
  onExit,
}: {
  title: string;
  subtitle: string;
  result: ModeResult;
  elapsed: number;
  onExit: () => void;
}) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody className="space-y-4 text-center">
        <p className="text-5xl font-bold text-brand">{result.score}%</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <p className="font-semibold text-green-600">{result.correctCount}</p>
            <p className="text-xs text-gray-500">Đúng</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <p className="font-semibold text-red-600">{result.wrongCount}</p>
            <p className="text-xs text-gray-500">Sai</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <p className="font-semibold">{formatDuration(elapsed)}</p>
            <p className="text-xs text-gray-500">Thời gian</p>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <Button onClick={onExit}>Quay lại</Button>
        </div>
      </CardBody>
    </Card>
  );
}
