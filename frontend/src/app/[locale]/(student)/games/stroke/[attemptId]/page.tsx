'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { practiceApi } from '@/lib/api/endpoints';
import { PracticeSession } from '@/features/practice/components/session';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import type { PracticeType, SourceType } from '@/lib/api/types';
import { useTranslations } from 'next-intl';

interface PageProps {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function HanziWritingPracticePage({ params, searchParams }: PageProps) {
  const { attemptId } = use(params);
  const search = use(searchParams);
  const router = useRouter();

  const queryString = new URLSearchParams(search as Record<string, string>).toString();
  const backUrl = queryString ? `/games/stroke?${queryString}` : '/games/stroke';

  return (
    <PracticeSessionLoader
      attemptId={attemptId}
      onExit={() => router.push(backUrl)}
    />
  );
}

function PracticeSessionLoader({
  attemptId,
  onExit,
}: {
  attemptId: string;
  onExit: () => void;
}) {
  const tCommon = useTranslations('Common');
  const tPractice = useTranslations('Practice');
  const tConstants = useTranslations('Constants');
  const [attempt, setAttempt] = useState<{
    id: string;
    practiceType: string;
    sourceType: string;
    sourceId: string;
    questionData?: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await practiceApi.getAttempt(attemptId);
        if (!cancelled) {
          setAttempt(res);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError(tPractice('initError'));
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [attemptId, tPractice]);

  if (loading) return <PageLoading label={tCommon('loading')} />;
  if (error || !attempt) return <ErrorState message={error ?? tCommon('errorLoading')} onRetry={onExit} />;

  const sourceLabel =
    attempt.sourceType === 'LESSON' ? tConstants('sourceTypeLesson')
    : attempt.sourceType === 'TOPIC' ? tConstants('sourceTypeTopic')
    : tConstants('sourceTypeLevel');

  return (
    <PracticeSession
      practiceType={attempt.practiceType as PracticeType}
      sourceType={attempt.sourceType as SourceType}
      sourceId={attempt.sourceId}
      sourceLabel={sourceLabel}
      onExit={onExit}
      attemptId={attempt.id}
      hanziChars={attempt.questionData?.characters}
    />
  );
}
