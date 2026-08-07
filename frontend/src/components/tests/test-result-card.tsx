'use client';

import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/utils/format';
import type { Test } from '@/lib/api/types';
import type { TakeTestResult } from './use-take-test';

/**
 * Màn kết quả sau khi nộp bài (P2-6). showScoreImmediately=false chỉ hiện
 * thông báo đã nộp — điểm do giáo viên công bố (UI; server vẫn chấm).
 */
export function TestResultCard({
  test,
  result,
  onExit,
}: {
  test: Test;
  result: TakeTestResult;
  onExit: () => void;
}) {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader title="Đã nộp bài! 🎉" subtitle={test.name} />
      <CardBody className="space-y-4 text-center">
        {test.showScoreImmediately ? (
          <>
            <p className="text-5xl font-bold text-brand">{result.score}%</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-gray-50 p-3 ">
                <p className="font-semibold text-green-600">
                  {result.correct}/{result.totalQuestions}
                </p>
                <p className="text-xs text-gray-500">Câu đúng</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 ">
                <p className="font-semibold">{formatDuration(result.duration)}</p>
                <p className="text-xs text-gray-500">Thời gian</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-600">
            Đã nộp bài thành công. Điểm sẽ được giáo viên công bố.
          </p>
        )}
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={onExit}>
            Danh sách đề
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
