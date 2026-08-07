'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTakeTest } from '@/components/tests/use-take-test';
import { TestResultCard } from '@/components/tests/test-result-card';
import { TestQuestionNav } from '@/components/tests/test-question-nav';
import { TestQuestionForm } from '@/components/tests/test-question-form';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { formatDuration } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export default function TakeTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();
  const t = useTakeTest(testId);

  if (t.phase === 'loading')
    return <AuthGuard><PageLoading label="Đang tải bài kiểm tra..." /></AuthGuard>;
  if (t.phase === 'error' || !t.test)
    return (
      <AuthGuard>
        <ErrorState
          message={t.error ?? 'Không tìm thấy bài kiểm tra.'}
          onRetry={() => router.push('/tests/join')}
        />
      </AuthGuard>
    );

  if (t.phase === 'info') {
    return (
      <AuthGuard>
        <Card className="mx-auto max-w-lg">
          <CardHeader title={t.test.name} subtitle={t.test.description ?? ''} />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              <span>⏱ {t.test.timeLimitMinutes} phút</span>
              <span>❓ {t.questions.length} câu</span>
              <span>🔁 Tối đa {t.test.attemptLimit} lần</span>
            </div>
            <p className="text-sm text-gray-600">
              Khi bấm bắt đầu, đồng hồ sẽ chạy. Bạn có thể trả lời từng câu và nộp bài
              trước khi hết giờ.
            </p>
            <Button className="w-full" onClick={() => void t.start()}>
              Bắt đầu làm bài
            </Button>
          </CardBody>
        </Card>
      </AuthGuard>
    );
  }

  if (t.phase === 'finished' && t.result) {
    return (
      <AuthGuard>
        <TestResultCard
          test={t.test}
          result={t.result}
          onExit={() => router.push('/tests/join')}
        />
      </AuthGuard>
    );
  }

  const q = t.questions[t.current];
  if (!q) return null;
  const answeredCount = t.questions.filter((x) => t.answers[x.id] !== undefined).length;
  const timeLeft = Math.max(0, t.test.timeLimitMinutes * 60 - t.elapsed);

  return (
    <AuthGuard>
      <div className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">{t.test.name}</h1>
            <p className="text-sm text-gray-500">
              Đã trả lời {answeredCount}/{t.questions.length} câu
            </p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 font-mono text-sm',
              timeLeft < 60 ? 'bg-red-100 text-red-700 ' : 'bg-gray-100 text-gray-600  ',
            )}
          >
            ⏱ {formatDuration(timeLeft)}
          </span>
        </header>

        <Card>
          <CardHeader
            title={`Câu ${t.current + 1}/${t.questions.length}`}
            subtitle={q.questionType === 'SINGLE_CHOICE' ? 'Trắc nghiệm' : q.questionType === 'TRUE_FALSE' ? 'Đúng / Sai' : 'Trả lời ngắn'}
          />
          <CardBody className="space-y-4">
            <p className="text-lg font-medium">{q.content}</p>
            <TestQuestionForm
              question={q}
              value={t.answers[q.id]}
              onChange={(answer) => t.setAnswer(q.id, answer)}
            />
          </CardBody>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={t.current === 0}
              onClick={() => t.setCurrent((c) => c - 1)}
            >
              ← Câu trước
            </Button>
            <Button
              variant="outline"
              disabled={t.current >= t.questions.length - 1}
              onClick={() => t.setCurrent((c) => c + 1)}
            >
              Câu sau →
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {t.confirmSubmit ? (
              <>
                <Button variant="danger" size="sm" onClick={() => void t.submit()}>
                  Xác nhận nộp bài
                </Button>
                <Button variant="ghost" size="sm" onClick={() => t.setConfirmSubmit(false)}>
                  Hủy
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => t.setConfirmSubmit(true)}>
                Nộp bài
              </Button>
            )}
          </div>
        </div>

        <TestQuestionNav
          count={t.questions.length}
          current={t.current}
          answered={(i) => t.answers[t.questions[i].id] !== undefined}
          onSelect={t.setCurrent}
        />
      </div>
    </AuthGuard>
  );
}
