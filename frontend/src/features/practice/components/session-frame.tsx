'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardBody, CardHeader } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { labelForPracticeType } from '@/lib/utils/constants';
import { formatDuration } from '@/lib/utils/format';
import type { PracticeType } from '@/lib/api/types';
import type { ModeResult } from './practice-models';

/**
 * Các màn hình chung của một phiên luyện tập/trò chơi:
 * hết lượt (PR-14), và kết quả hoàn thành. Dùng cho cả PracticeSession
 * lẫn GameSession để tránh duplicate JSX.
 */

export function LimitScreen({
  practiceType,
  usedCount,
  onExit,
  kind = 'practice',
}: {
  practiceType: PracticeType;
  usedCount: number;
  onExit: () => void;
  kind?: 'practice' | 'game';
}) {
  const t = useTranslations('Constants');
  const tLimit = useTranslations('PracticeLimit');
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader
        title={kind === 'game' ? tLimit('limitTitleGame') : tLimit('limitTitlePractice')}
        subtitle={labelForPracticeType(t, practiceType)}
      />
      <CardBody className="space-y-3">
        <p className="text-sm text-gray-600">
          {tLimit('limitDescription', {
            usedCount,
            kind: kind === 'game' ? tLimit('kindGame') : tLimit('kindPractice'),
          })}
        </p>
        <div className="flex gap-2">
          <Link href="/upgrade-vip">
            <Button size="sm">{tLimit('upgradeVip')}</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={onExit}>
            {tLimit('back')}
          </Button>
        </div>
      </CardBody>
    </Card>
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
  const tPractice = useTranslations('Practice');
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody className="space-y-4 text-center">
        <p className="text-5xl font-bold text-brand">{result.score}%</p>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg bg-gray-50 p-3 ">
            <p className="font-semibold text-green-600">{result.correctCount}</p>
            <p className="text-xs text-gray-500">{tPractice('correct')}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 ">
            <p className="font-semibold text-red-600">{result.wrongCount}</p>
            <p className="text-xs text-gray-500">{tPractice('wrong')}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 ">
            <p className="font-semibold">{formatDuration(elapsed)}</p>
            <p className="text-xs text-gray-500">{tPractice('duration')}</p>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <Button onClick={onExit}>{tPractice('back')}</Button>
        </div>
      </CardBody>
    </Card>
  );
}
