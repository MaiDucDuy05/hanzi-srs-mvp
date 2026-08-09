'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PracticeType, SourceType } from '@/lib/api/types';
import { PracticeSession } from '@/components/practice/session';
import { SourcePicker, type PickedSource } from '@/components/practice/source-picker';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/spinner';
import { cn } from '@/lib/utils/cn';

const PRACTICE_TYPES: { type: PracticeType; title: string; desc: string }[] = [
  { type: 'WORD_MATCHING', title: 'Nối từ', desc: 'Nối chữ Hán với nghĩa & pinyin' },
  { type: 'FLASHCARD', title: 'Flashcard', desc: 'Lật thẻ ôn từ vựng nhanh' },
  { type: 'FILL_BLANK', title: 'Điền chỗ trống', desc: 'Gõ chữ Hán theo pinyin & nghĩa' },
  { type: 'SENTENCE_ORDERING', title: 'Sắp xếp câu', desc: 'Ghép các chữ thành từ đúng' },
];

const GAME_TYPES: PracticeType[] = ['PINYIN_BALLOON_GAME', 'MEMORY_GAME', 'HANZI_WRITING'];

export function PracticeHubFeature() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as PracticeType | null;
  const sourceType = searchParams.get('sourceType') as SourceType | null;
  const sourceId = searchParams.get('sourceId');

  const [picked, setPicked] = useState<PickedSource | null>(null);
  const [practiceType, setPracticeType] = useState<PracticeType | null>(null);

  if (type && sourceType && sourceId) {
    if (GAME_TYPES.includes(type)) {
      return (
        <Card className="mx-auto max-w-md">
          <CardBody className="space-y-3 text-center">
            <p className="text-3xl">🎮</p>
            <p>
              Chế độ này nằm trong mục{' '}
              <button
                className="font-medium text-brand hover:underline"
                onClick={() => router.push('/games')}
              >
                Trò chơi
              </button>
              .
            </p>
          </CardBody>
        </Card>
      );
    }
    return (
      <PracticeSession
        practiceType={type}
        sourceType={sourceType}
        sourceId={sourceId}
        sourceLabel={
          sourceType === 'LESSON' ? 'Bài học' : sourceType === 'TOPIC' ? 'Chủ đề' : 'Cấp độ'
        }
        onExit={() => router.replace('/practice')}
      />
    );
  }

  const start = () => {
    if (!picked || !practiceType) return;
    router.push(
      `/practice?sourceType=${picked.sourceType}&sourceId=${picked.sourceId}&type=${practiceType}`,
    );
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Luyện tập</h1>
        <p className="mt-1 text-sm text-gray-500">
          Chọn nguồn từ vựng và chế độ luyện tập để bắt đầu.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-bold">1. Chọn nguồn từ vựng</h2>
        <SourcePicker value={picked} onChange={setPicked} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">2. Chọn chế độ</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRACTICE_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => setPracticeType(t.type)}
              className={cn(
                'rounded-lg border p-4 text-left transition-colors',
                practiceType === t.type
                  ? 'border-brand bg-brand-light '
                  : 'border-gray-200 bg-white hover:border-brand  ',
              )}
            >
              <p className="font-bold">{t.title}</p>
              <p className="text-sm text-gray-500">{t.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={start} disabled={!picked || !practiceType}>
          Bắt đầu luyện tập
        </Button>
        {(!picked || !practiceType) && (
          <p className="text-sm text-gray-400">Vui lòng chọn nguồn và chế độ.</p>
        )}
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<PageLoading label="Đang tải luyện tập..." />}>
      <PracticeHubFeature />
    </Suspense>
  );
}
