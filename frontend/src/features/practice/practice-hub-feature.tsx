'use client';

import { Suspense, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import type { PracticeType, SourceType } from '@/lib/api/types';
import { PracticeSession } from '@/features/practice/components/session';
import { SourcePicker, type PickedSource } from '@/features/practice/components/source-picker';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { cn } from '@/lib/utils/cn';

const getPracticeTypes = (t: any): { type: PracticeType; title: string; desc: string }[] => [
  { type: 'WORD_MATCHING', title: t('matchTitle'), desc: t('matchDesc') },
  { type: 'FLASHCARD', title: t('flashcardTitle'), desc: t('flashcardDesc') },
  { type: 'FILL_BLANK', title: t('fillTitle'), desc: t('fillDesc') },
  { type: 'SENTENCE_ORDERING', title: t('orderTitle'), desc: t('orderDesc') },
];

const GAME_TYPES: PracticeType[] = ['PINYIN_BALLOON_GAME', 'MEMORY_GAME', 'HANZI_WRITING'];

export function PracticeHubFeature() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as PracticeType | null;
  const sourceType = searchParams.get('sourceType') as SourceType | null;
  const sourceId = searchParams.get('sourceId');
  const t = useTranslations('Practice');

  const [picked, setPicked] = useState<PickedSource | null>(null);
  const [practiceType, setPracticeType] = useState<PracticeType | null>(null);

  if (type && sourceType && sourceId) {
    if (GAME_TYPES.includes(type)) {
      return (
        <Card className="mx-auto max-w-md">
          <CardBody className="space-y-3 text-center">
            <p className="text-3xl">🎮</p>
            <p>
              {t('gamesWarning')}{' '}
              <button
                className="font-medium text-brand hover:underline"
                onClick={() => router.push('/games')}
              >
                {t('gamesLink')}
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
          sourceType === 'LESSON' ? t('lesson') : sourceType === 'TOPIC' ? t('topic') : t('level')
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
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t('subtitle')}
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-bold">{t('step1')}</h2>
        <SourcePicker value={picked} onChange={setPicked} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">{t('step2')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {getPracticeTypes(t).map((tItem) => (
            <button
              key={tItem.type}
              onClick={() => setPracticeType(tItem.type)}
              className={cn(
                'rounded-lg border p-4 text-left transition-colors',
                practiceType === tItem.type
                  ? 'border-brand bg-brand-light '
                  : 'border-gray-200 bg-white hover:border-brand  ',
              )}
            >
              <p className="font-bold">{tItem.title}</p>
              <p className="text-sm text-gray-500">{tItem.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button onClick={start} disabled={!picked || !practiceType}>
          {t('start')}
        </Button>
        {(!picked || !practiceType) && (
          <p className="text-sm text-gray-400">{t('pleaseSelect')}</p>
        )}
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<PageLoading label="Loading..." />}>
      <PracticeHubFeature />
    </Suspense>
  );
}
