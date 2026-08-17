'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { testAssignmentsApi, testApi } from '@/lib/api/endpoints';
import type { TestAssignment, TestAttempt } from '@/lib/api/types';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export function StudentExamsFeature() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      testAssignmentsApi.getAssigned(),
      testApi.listAttempts(),
    ])
      .then(([assignRes, attemptRes]) => {
        setAssignments(assignRes);
        setAttempts(attemptRes || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (assignment: TestAssignment) => {
    if (!window.confirm(`Bắt đầu làm bài: ${assignment.test?.name}?`)) return;
    try {
      const attempt = await testApi.startAttempt(assignment.testId, assignment.id);
      router.push(`/exams/${attempt.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể bắt đầu làm bài.');
    }
  };

  const getAssignmentState = (assignment: TestAssignment) => {
    const testAttempts = attempts.filter((a) => a.testId === assignment.testId);
    const inProgress = testAttempts.find((a) => a.status === 'IN_PROGRESS');
    const submittedCount = testAttempts.filter((a) => a.status === 'SUBMITTED' || a.status === 'GRADED').length;
    const limit = assignment.test?.attemptLimit || 1;
    
    // Check if the assignment is still valid based on dates
    const now = new Date();
    const isStarted = new Date(assignment.startTime) <= now;
    const isEnded = new Date(assignment.endTime) < now;

    return { testAttempts, inProgress, submittedCount, limit, isStarted, isEnded };
  };

  if (loading) return <PageLoading label="Đang tải danh sách bài kiểm tra..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Bài kiểm tra của tôi</h1>
        <p className="text-gray-500 mt-1">Danh sách bài kiểm tra bạn được giao.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map(a => {
          const { inProgress, submittedCount, limit, isEnded, isStarted, testAttempts } = getAssignmentState(a);
          const hasReachedLimit = submittedCount >= limit;
          const bestAttempt = testAttempts.filter(t => t.status === 'GRADED').sort((a, b) => (b.score || 0) - (a.score || 0))[0];

          return (
            <Card key={a.id} className={cn(!isStarted && "opacity-60")}>
              <CardBody className="space-y-3">
                <h3 className="font-semibold text-lg">{a.test?.name || 'Bài kiểm tra không tên'}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{a.test?.description || 'Không có mô tả'}</p>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Thời gian làm: <strong>{a.test?.timeLimitMinutes} phút</strong></p>
                  <p>Mở từ: {formatDateTime(a.startTime)}</p>
                  <p>Đóng lúc: {formatDateTime(a.endTime)}</p>
                  <p>Số lần đã làm: {submittedCount} / {limit}</p>
                  {bestAttempt && <p className="text-brand font-medium">Điểm cao nhất: {bestAttempt.score}%</p>}
                </div>

                <div className="pt-2">
                  {!isStarted ? (
                    <Button className="w-full" disabled variant="outline">Chưa tới giờ mở đề</Button>
                  ) : inProgress ? (
                    <Button className="w-full" onClick={() => router.push(`/exams/${inProgress.id}`)}>
                      Tiếp tục làm bài
                    </Button>
                  ) : hasReachedLimit ? (
                    bestAttempt ? (
                      <Button className="w-full" variant="outline" onClick={() => router.push(`/exams/${bestAttempt.id}/result`)}>
                        Xem kết quả
                      </Button>
                    ) : (
                      <Button className="w-full" disabled variant="outline">Đã nộp</Button>
                    )
                  ) : isEnded ? (
                    <Button className="w-full" disabled variant="outline">Đã hết hạn</Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleStart(a)}>
                      Bắt đầu làm bài
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
        
        {assignments.length === 0 && (
          <div className="col-span-full py-8 text-center text-gray-500 border border-dashed rounded-lg">
            Bạn hiện không có bài kiểm tra nào.
          </div>
        )}
      </div>
    </div>
  );
}
