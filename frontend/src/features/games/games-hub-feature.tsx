'use client';

import { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SourceType } from '@/lib/api/types';
import { GameSession } from '@/features/games/components/game-session';
import { SourcePicker, type PickedSource } from '@/features/practice/components/source-picker';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { cn } from '@/lib/utils/cn';
import { Wind, Layers, PenTool, type LucideIcon } from 'lucide-react';

type GameType = 'PINYIN_BALLOON_GAME' | 'MEMORY_GAME' | 'HANZI_WRITING';

type GameDef = {
  type: GameType;
  icon: LucideIcon;
  titleKey: 'balloonTitle' | 'memoryTitle' | 'hanziWritingTitle';
  descKey: 'balloonDesc' | 'memoryDesc' | 'hanziWritingDesc';
};

const GAMES: GameDef[] = [
  { type: 'PINYIN_BALLOON_GAME', icon: Wind, titleKey: 'balloonTitle', descKey: 'balloonDesc' },
  { type: 'MEMORY_GAME', icon: Layers, titleKey: 'memoryTitle', descKey: 'memoryDesc' },
  { type: 'HANZI_WRITING', icon: PenTool, titleKey: 'hanziWritingTitle', descKey: 'hanziWritingDesc' },
];

function sourceLabelKey(sourceType: SourceType | null): 'sourceLesson' | 'sourceTopic' | 'sourceLevel' {
  if (sourceType === 'LESSON') return 'sourceLesson';
  if (sourceType === 'TOPIC') return 'sourceTopic';
  return 'sourceLevel';
}

export function GamesHubFeature() {
  const t = useTranslations('Games');
  const router = useRouter();
  const searchParams = useSearchParams();
  const game = searchParams.get('game') as GameType | null;
  const sourceType = searchParams.get('sourceType') as SourceType | null;
  const sourceId = searchParams.get('sourceId');

  const [picked, setPicked] = useState<PickedSource | null>(null);
  const [gameType, setGameType] = useState<GameType | null>(null);

  if (game && sourceType && sourceId && GAMES.some((g) => g.type === game)) {
    return (
      <GameSession
        practiceType={game}
        sourceType={sourceType}
        sourceId={sourceId}
        sourceLabel={t(sourceLabelKey(sourceType))}
        onExit={() => router.replace('/games')}
      />
    );
  }

  const start = () => {
    if (!picked || !gameType) return;
    router.push(`/games?game=${gameType}&sourceType=${picked.sourceType}&sourceId=${picked.sourceId}`);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-heading text-4xl font-black text-[#215b3b] mb-6">{t('pageHeading')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('pageSubheading')}</p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-bold">{t('step1Heading')}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {GAMES.map((g) => {
            const Icon = g.icon;
            return (
              <button key={g.type} onClick={() => setGameType(g.type)} className={cn('rounded-xl border p-5 text-left transition-colors', gameType === g.type ? 'border-brand bg-brand-light ' : 'border-gray-200 bg-white hover:border-brand ')}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-3 font-bold">{t(g.titleKey)}</p>
                <p className="mt-1 text-sm text-gray-500">{t(g.descKey)}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">{t('step2Heading')}</h2>
        <SourcePicker value={picked} onChange={setPicked} />
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={start} disabled={!picked || !gameType}>{t('startButton')}</Button>
        {(!picked || !gameType) && <p className="text-sm text-gray-400">{t('pleasePick')}</p>}
      </div>
    </div>
  );
}

export default function GamesPage() {
  const t = useTranslations('Games');
  return (
    <Suspense fallback={<PageLoading label={t('pageLoadingLabel')} />}>
      <GamesHubFeature />
    </Suspense>
  );
}
