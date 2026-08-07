'use client';

import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PRACTICE_TYPE_LABELS } from '@/lib/utils/constants';
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
  kind = 'luyện tập',
}: {
  practiceType: PracticeType;
  usedCount: number;
  onExit: () => void;
  kind?: 'luyện tập' | 'chơi';
}) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader
        title={kind === 'chơi' ? 'Hết lượt chơi hôm nay' : 'Hết lượt luyện tập hôm nay'}
        subtitle={PRACTICE_TYPE_LABELS[practiceType]}
      />
      <CardBody className="space-y-3">
        <p className="text-sm text-gray-600">
          Bạn đã dùng hết lượt miễn phí hôm nay cho chế độ này (đã dùng {usedCount} lượt).
          Lượt mới có vào ngày mai, hoặc nâng cấp VIP để {kind} không giới hạn.
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
