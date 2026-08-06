'use client';

import Link from 'next/link';
import { usePracticeEngine } from '../practice/practice-engine';
import { BalloonMode, type BalloonState } from './balloon-mode';
import { MemoryMode, type MemoryState } from './memory-mode';
import { WritingMode, type WritingState } from './writing-mode';
import { SummaryCard } from '../practice/session';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { PRACTICE_TYPE_LABELS, SOURCE_TYPE_LABELS } from '@/lib/utils/constants';
import { formatDuration } from '@/lib/utils/format';
import type { SourceType } from '@/lib/api/types';

type GameType = 'PINYIN_BALLOON_GAME' | 'MEMORY_GAME' | 'HANZI_WRITING';

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
  const engine = usePracticeEngine({ practiceType, sourceType, sourceId, sessionKey });

  if (engine.status === 'loading') {
    return <PageLoading label="Đang chuẩn bị trò chơi..." />;
  }

  if (engine.status === 'limit' && engine.limit) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader
          title="Hết lượt chơi hôm nay"
          subtitle={PRACTICE_TYPE_LABELS[practiceType]}
        />
        <CardBody className="space-y-3">
          <p className="text-sm text-gray-600">
            Bạn đã dùng hết lượt miễn phí hôm nay (đã dùng {engine.limit.usedCount} lượt).
            Lượt mới có vào ngày mai, hoặc nâng cấp VIP để chơi không giới hạn.
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
