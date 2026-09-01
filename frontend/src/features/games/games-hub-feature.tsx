'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SourceType } from '@/lib/api/types';
import { GameSession } from '@/features/games/components/game-session';
import { SourcePicker, type PickedSource } from '@/features/practice/components/source-picker';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { cn } from '@/lib/utils/cn';

type GameType = 'PINYIN_BALLOON_GAME' | 'MEMORY_GAME' | 'HANZI_WRITING';

const GAMES: { type: GameType; emoji: string; title: string; desc: string }[] = [
  { type: 'PINYIN_BALLOON_GAME', emoji: '🎈', title: 'Bắn bóng Pinyin', desc: 'Chọn bóng có pinyin đúng cho chữ Hán' },
  { type: 'MEMORY_GAME', emoji: '🃏', title: 'Trò chơi trí nhớ', desc: 'Lật thẻ tìm cặp chữ Hán & pinyin' },
  { type: 'HANZI_WRITING', emoji: '✍️', title: 'Luyện viết chữ Hán', desc: 'Viết chữ đúng thứ tự nét trên màn hình' },
];

export function GamesHubFeature() {
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
        sourceLabel={sourceType === 'LESSON' ? 'Bài học' : sourceType === 'TOPIC' ? 'Chủ đề' : 'Cấp độ'}
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
        <h1 className="font-heading text-4xl font-black text-[#215b3b] mb-6">Trò chơi</h1>
        <p className="mt-1 text-sm text-gray-500">Vừa chơi vừa học — chọn trò chơi và nguồn từ vựng.</p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-bold">1. Chọn trò chơi</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {GAMES.map((g) => (
            <button key={g.type} onClick={() => setGameType(g.type)} className={cn('rounded-xl border p-5 text-left transition-colors', gameType === g.type ? 'border-brand bg-brand-light ' : 'border-gray-200 bg-white hover:border-brand ')}>
              <p className="text-3xl">{g.emoji}</p>
              <p className="mt-2 font-bold">{g.title}</p>
              <p className="mt-1 text-sm text-gray-500">{g.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">2. Chọn nguồn từ vựng</h2>
        <SourcePicker value={picked} onChange={setPicked} />
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={start} disabled={!picked || !gameType}>Bắt đầu chơi</Button>
        {(!picked || !gameType) && <p className="text-sm text-gray-400">Vui lòng chọn trò chơi và nguồn.</p>}
      </div>
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<PageLoading label="Đang tải trò chơi..." />}>
      <GamesHubFeature />
    </Suspense>
  );
}
