'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Flag, Send, Menu, X } from 'lucide-react';
import { testApi } from '@/lib/api/endpoints/test';
import type { Test, TestAttempt, TestQuestion } from '@/lib/api/types';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { QuestionRenderer } from '@/features/teacher/components/question-renderer';
import { Badge } from '@/features/ui/components/badge';
import { cn } from '@/lib/utils/cn';

export function StudentExamTakingPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();

  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationSecondsRef = useRef<number>(0);

  // Load exam data
  useEffect(() => {
    const load = async () => {
      try {
        const att = await testApi.getAttempt(attemptId);
        if (att.status !== 'IN_PROGRESS') {
          alert('Bài kiểm tra này đã kết thúc!');
          router.push('/dashboard/exams');
          return;
        }

        const t = await testApi.get(att.testId);
        let qs = await testApi.listQuestions({ testId: att.testId });

        // Shuffle if needed
        if (t.shuffleQuestions) {
          let seed = 0;
          for (let i = 0; i < attemptId.length; i++) seed += attemptId.charCodeAt(i);
          const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
          };
          for (let i = qs.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [qs[i], qs[j]] = [qs[j], qs[i]];
          }
        }

        // Load existing answers
        const existingAnswers = await testApi.listAnswers(attemptId);
        const answerMap: Record<string, unknown> = {};
        existingAnswers.forEach((ans: any) => {
          answerMap[ans.questionId] = ans.answer;
        });

        setAttempt(att);
        setTest(t);
        setQuestions(qs.sort((a, b) => a.displayOrder - b.displayOrder));
        setAnswers(answerMap);

        // Setup timer
        const startedAtTime = new Date(att.startedAt).getTime();
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startedAtTime) / 1000);
        const totalSeconds = t.timeLimitMinutes * 60;
        const remaining = Math.max(0, totalSeconds - elapsedSeconds);

        setTimeLeft(remaining);
        durationSecondsRef.current = elapsedSeconds;
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi tải bài kiểm tra.');
        setLoading(false);
      }
    };

    void load();
  }, [attemptId, router]);

  // Timer
  useEffect(() => {
    if (!loading && test && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
        durationSecondsRef.current += 1;
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, test, timeLeft]);

  const handleAnswerChange = async (questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    try {
      await testApi.submitAnswer(attemptId, { questionId, answer: value });
    } catch (e) {
      console.error('Failed to save answer:', e);
    }
  };

  const toggleMarkForReview = () => {
    const qId = questions[currentQuestion]?.id;
    if (qId) {
      const newMarked = new Set(markedForReview);
      if (newMarked.has(qId)) {
        newMarked.delete(qId);
      } else {
        newMarked.add(qId);
      }
      setMarkedForReview(newMarked);
    }
  };

  const handleAutoSubmit = async () => {
    alert('Đã hết thời gian! Hệ thống sẽ tự động nộp bài.');
    await submitTest();
  };

  const submitTest = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await testApi.submitAttempt(attemptId, durationSecondsRef.current);
      router.push(`/dashboard/exams/${attemptId}/result`);
    } catch (e) {
      setError('Lỗi nộp bài. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const goToQuestion = (idx: number) => {
    if (idx >= 0 && idx < questions.length) {
      setCurrentQuestion(idx);
      setShowNavigator(false);
    }
  };

  const answeredCount = Object.keys(answers).length;

  if (loading) return <PageLoading label="Đang chuẩn bị bài kiểm tra..." />;
  if (error || !test) return <ErrorState message={error || 'Không tìm thấy bài kiểm tra'} />;

  const q = questions[currentQuestion];
  const isMarked = markedForReview.has(q?.id || '');
  const timerColor = timeLeft < 300 ? 'text-red-600' : timeLeft < 600 ? 'text-amber-600' : 'text-gray-900';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/exams')}
              className="shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-gray-900 truncate text-sm sm:text-base">
              {test.name}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="font-semibold text-gray-600 whitespace-nowrap">
              Câu {currentQuestion + 1}/{questions.length}
            </span>
            <span className={cn('font-mono font-bold text-lg whitespace-nowrap', timerColor)}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          {q && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              {/* Question Header */}
              <div className="border-b border-gray-200 pb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                    {currentQuestion + 1}
                  </span>
                  <Badge tone="blue">
                    {q.question?.type === 'SINGLE_CHOICE'
                      ? 'Trắc nghiệm'
                      : q.question?.type === 'TRUE_FALSE'
                      ? 'Đúng/Sai'
                      : q.question?.type === 'SHORT_ANSWER'
                      ? 'Trả lời ngắn'
                      : 'Câu hỏi'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMarkForReview}
                  className={cn(isMarked && 'text-amber-500')}
                >
                  <Flag className={cn('h-5 w-5', isMarked && 'fill-current')} />
                </Button>
              </div>

              {/* Question Content */}
              <div>
                <QuestionRenderer
                  question={q}
                  index={currentQuestion}
                  mode="take"
                  value={answers[q.id]}
                  onChange={(val) => handleAnswerChange(q.id, val)}
                />
              </div>

              {/* Question Navigator Button (Mobile) */}
              <div className="sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => setShowNavigator(!showNavigator)}
                  className="w-full"
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Xem tất cả câu ({answeredCount}/{questions.length})
                </Button>
              </div>

              {/* Question Navigator (Desktop) */}
              <div className="hidden sm:block border-t border-gray-200 pt-6">
                <p className="text-xs font-bold text-gray-600 uppercase mb-3">Điều hướng câu hỏi</p>
                <div className="grid grid-cols-8 gap-2">
                  {questions.map((question, idx) => (
                    <button
                      key={question.id}
                      onClick={() => goToQuestion(idx)}
                      className={cn(
                        'w-full aspect-square text-sm font-semibold rounded-lg transition-all flex items-center justify-center',
                        currentQuestion === idx && 'ring-2 ring-blue-500 bg-blue-100 text-blue-600',
                        answers[question.id] !== undefined && currentQuestion !== idx && 'bg-green-100 text-green-600',
                        markedForReview.has(question.id) && currentQuestion !== idx && 'bg-amber-100 text-amber-600',
                        !answers[question.id] && currentQuestion !== idx && 'bg-gray-100 text-gray-600'
                      )}
                      title={`Câu ${idx + 1}${answers[question.id] ? ' (Đã trả lời)' : ''}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Question Navigator Modal (Mobile) */}
      {showNavigator && (
        <div className="fixed inset-0 bg-black/50 z-50 sm:hidden flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Chọn câu hỏi</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNavigator(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {questions.map((question, idx) => (
                <button
                  key={question.id}
                  onClick={() => goToQuestion(idx)}
                  className={cn(
                    'w-full aspect-square text-sm font-semibold rounded-lg transition-all flex items-center justify-center',
                    currentQuestion === idx && 'ring-2 ring-blue-500 bg-blue-100 text-blue-600',
                    answers[question.id] !== undefined && currentQuestion !== idx && 'bg-green-100 text-green-600',
                    markedForReview.has(question.id) && currentQuestion !== idx && 'bg-amber-100 text-amber-600',
                    !answers[question.id] && currentQuestion !== idx && 'bg-gray-100 text-gray-600'
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <footer className="bg-white border-t border-gray-200 p-4 space-y-3">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Button
            variant="outline"
            disabled={currentQuestion === 0}
            onClick={() => goToQuestion(currentQuestion - 1)}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Câu trước
          </Button>

          <Button
            variant="outline"
            disabled={currentQuestion === questions.length - 1}
            onClick={() => goToQuestion(currentQuestion + 1)}
            className="flex-1"
          >
            Câu sau <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Submit Section */}
        {!showSubmitConfirm ? (
          <Button
            onClick={() => setShowSubmitConfirm(true)}
            className="w-full"
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            Nộp bài ({answeredCount}/{questions.length} đã trả lời)
          </Button>
        ) : (
          <div className="space-y-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-900">
              Bạn có chắc chắn muốn nộp bài không? Bạn đã trả lời {answeredCount}/{questions.length} câu.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1"
              >
                Tiếp tục làm bài
              </Button>
              <Button
                loading={submitting}
                onClick={submitTest}
                className="flex-1"
              >
                Xác nhận nộp
              </Button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
