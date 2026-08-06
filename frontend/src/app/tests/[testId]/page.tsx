'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { testApi } from '@/lib/api/endpoints';
import type { Test, TestQuestion } from '@/lib/api/types';
import { AuthGuard } from '@/components/layout/auth-guard';
import { TestQuestionForm } from '@/components/tests/test-question-form';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { formatDuration } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

type Phase = 'loading' | 'info' | 'running' | 'submitting' | 'finished' | 'error';

interface TestResult {
  score: number;
  correct: number;
  pointsEarned: number;
  totalPoints: number;
  duration: number;
}

export default function TakeTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [current, setCurrent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const [t, qs] = await Promise.all([
          testApi.get(testId),
          testApi.listQuestions({ testId }),
        ]);
        setTest(t);
        setQuestions(qs.slice().sort((a, b) => a.displayOrder - b.displayOrder));
        setPhase('info');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi tải bài kiểm tra.');
        setPhase('error' as Phase);
      }
    })();
  }, [testId]);

  const start = async () => {
    try {
      const attempt = await testApi.startAttempt(testId);
      setAttemptId(attempt.id);
      setPhase('running');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể bắt đầu bài kiểm tra.');
      setPhase('error' as Phase);
    }
  };

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setPhase('submitting');
    try {
      const duration = elapsed || 1;
      // Gửi từng câu trả lời — backend chấm từng câu phía server (PR-05 §3.4).
      for (const q of questions) {
        const a = answers[q.id];
        if (a === undefined) continue;
        await testApi.submitAnswer(attemptId!, {
          questionId: q.id,
          answer: { answer: a },
        });
      }
      // Nộp bài — backend tính điểm tổng, không tin điểm từ client.
      const attempt = await testApi.submitAttempt(attemptId!, duration);
      // Đọc kết quả đã chấm để hiển thị số câu đúng/điểm đạt.
      const graded = await testApi.listAnswers(attemptId!);
      const correct = graded.filter((a) => a.isCorrect).length;
      const pointsEarned = graded.reduce((s, a) => s + a.pointsAwarded, 0);
      const totalPoints = questions.reduce((s, q) => s + q.points, 0);
      setResult({
        score: attempt.score,
        correct,
        pointsEarned,
        totalPoints,
        duration,
      });
      setPhase('finished');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi khi nộp bài.');
      setPhase('error' as Phase);
    }
  }, [answers, attemptId, elapsed, questions]);

  // Giữ tham chiếu submit luôn mới nhất để bộ đếm giờ tự nộp không dùng closure cũ.
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  // Đồng hồ + tự nộp khi hết giờ.
  useEffect(() => {
    if (phase !== 'running' || !test) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    const deadline = setTimeout(() => {
      clearInterval(t);
      void submitRef.current();
    }, test.timeLimitMinutes * 60 * 1000);
    return () => {
      clearInterval(t);
      clearTimeout(deadline);
    };
  }, [phase, test]);

  if (phase === 'loading') return <AuthGuard><PageLoading label="Đang tải bài kiểm tra..." /></AuthGuard>;
  if (phase === 'error' || !test)
    return <AuthGuard><ErrorState message={error ?? 'Không tìm thấy bài kiểm tra.'} onRetry={() => router.push('/tests/join')} /></AuthGuard>;

  if (phase === 'info') {
    return (
      <AuthGuard>
        <Card className="mx-auto max-w-lg">
          <CardHeader title={test.name} subtitle={test.description ?? ''} />
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm text-gray-500">
              <span>⏱ {test.timeLimitMinutes} phút</span>
              <span>❓ {questions.length} câu</span>
              <span>🔁 Tối đa {test.attemptLimit} lần</span>
            </div>
            <p className="text-sm text-gray-600">
              Khi bấm bắt đầu, đồng hồ sẽ chạy. Bạn có thể trả lời từng câu và nộp bài
              trước khi hết giờ.
            </p>
            <Button className="w-full" onClick={start}>
              Bắt đầu làm bài
            </Button>
          </CardBody>
        </Card>
      </AuthGuard>
    );
  }

  if (phase === 'finished' && result) {
    return (
      <AuthGuard>
        <Card className="mx-auto max-w-lg">
          <CardHeader title="Đã nộp bài! 🎉" subtitle={test.name} />
          <CardBody className="space-y-4 text-center">
            {test.showScoreImmediately ? (
              <>
                <p className="text-5xl font-bold text-brand">{result.score}%</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="font-semibold text-green-600">{result.correct}/{questions.length}</p>
                    <p className="text-xs text-gray-500">Câu đúng</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
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
              <Button variant="outline" onClick={() => router.push('/tests/join')}>
                Danh sách đề
              </Button>
            </div>
          </CardBody>
        </Card>
      </AuthGuard>
    );
  }

  const q = questions[current];
  if (!q) return null;
  const answeredCount = questions.filter((x) => answers[x.id] !== undefined).length;
  const timeLeft = Math.max(0, test.timeLimitMinutes * 60 - elapsed);

  return (
    <AuthGuard>
      <div className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold">{test.name}</h1>
            <p className="text-sm text-gray-500">
              Đã trả lời {answeredCount}/{questions.length} câu
            </p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 font-mono text-sm',
              timeLeft < 60 ? 'bg-red-100 text-red-700 dark:bg-red-950' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
            )}
          >
            ⏱ {formatDuration(timeLeft)}
          </span>
        </header>

        <Card>
          <CardHeader
            title={`Câu ${current + 1}/${questions.length}`}
            subtitle={q.questionType === 'SINGLE_CHOICE' ? 'Trắc nghiệm' : q.questionType === 'TRUE_FALSE' ? 'Đúng / Sai' : 'Trả lời ngắn'}
          />
          <CardBody className="space-y-4">
            <p className="text-lg font-medium">{q.content}</p>
            <TestQuestionForm
              question={q}
              value={answers[q.id]}
              onChange={(answer) => setAnswers((a) => ({ ...a, [q.id]: answer }))}
            />
          </CardBody>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
              ← Câu trước
            </Button>
            <Button
              variant="outline"
              disabled={current >= questions.length - 1}
              onClick={() => setCurrent((c) => c + 1)}
            >
              Câu sau →
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {confirmSubmit ? (
              <>
                <Button variant="danger" size="sm" onClick={() => void submit()}>
                  Xác nhận nộp bài
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmSubmit(false)}>
                  Hủy
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setConfirmSubmit(true)}>
                Nộp bài
              </Button>
            )}
          </div>
        </div>

        {/* Thanh điều hướng câu */}
        <div className="flex flex-wrap gap-1.5">
          {questions.map((x, i) => (
            <button
              key={x.id}
              onClick={() => setCurrent(i)}
              className={cn(
                'h-8 w-8 rounded-md text-xs font-medium',
                i === current
                  ? 'bg-brand text-white'
                  : answers[x.id] !== undefined
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
