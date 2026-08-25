'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { testApi } from '@/lib/api/endpoints';
import type { Test, TestAttempt, TestQuestion } from '@/lib/api/types';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { cn } from '@/lib/utils/cn';

export function TakeExamFeature() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();

  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationSecondsRef = useRef<number>(0);

  const load = useCallback(async () => {
    try {
      const att = await testApi.getAttempt(attemptId);
      if (att.status !== 'IN_PROGRESS') {
        alert('Bài kiểm tra này đã kết thúc!');
        router.push('/dashboard/exams');
        return;
      }

      const t = await testApi.get(att.testId);
      const qs = await testApi.listQuestions({ testId: att.testId });
      // Fetch existing answers if any
      const existingAnswers = await testApi.listAnswers(attemptId);
      const answerMap: Record<string, unknown> = {};
      existingAnswers.forEach((ans: any) => {
        answerMap[ans.questionId] = ans.answer;
      });

      setAttempt(att);
      setTest(t);
      let sortedQs = qs.sort((a, b) => a.displayOrder - b.displayOrder);
      if (t.shuffleQuestions) {
        let seed = 0;
        for (let i = 0; i < attemptId.length; i++) seed += attemptId.charCodeAt(i);
        const random = () => {
          const x = Math.sin(seed++) * 10000;
          return x - Math.floor(x);
        };
        for (let i = sortedQs.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [sortedQs[i], sortedQs[j]] = [sortedQs[j], sortedQs[i]];
        }
      }
      setQuestions(sortedQs);
      setAnswers(answerMap);

      // Initialize Timer
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
  }, [attemptId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  // Timer logic
  useEffect(() => {
    if (!loading && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
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
  }, [loading, timeLeft]);

  // Before unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (attempt?.status === 'IN_PROGRESS') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [attempt]);

  const handleTimeUp = async () => {
    alert('Đã hết thời gian làm bài! Hệ thống sẽ tự động nộp bài.');
    await submitTest();
  };

  const submitTest = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await testApi.submitAttempt(attemptId, durationSecondsRef.current);
      router.push('/dashboard/exams');
    } catch (e) {
      setError('Lỗi nộp bài. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  const onManualSubmit = async () => {
    if (window.confirm('Bạn có chắc chắn muốn nộp bài?')) {
      await submitTest();
    }
  };

  const handleAnswerChange = async (questionId: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    // Auto-save
    try {
      await testApi.submitAnswer(attemptId, { questionId, answer: value });
    } catch (e) {
      console.error('Failed to auto-save answer for question', questionId);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <PageLoading label="Đang chuẩn bị đề thi..." />;
  if (error || !test) return <ErrorState message={error || 'Lỗi không xác định'} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 relative">
      {/* Sticky Header with Timer */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 py-4 shadow-sm px-6 rounded-b-xl flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{test.name}</h1>
          <p className="text-sm text-gray-500">{questions.length} câu hỏi</p>
        </div>
        <div className="flex items-center gap-6">
          <div className={cn("text-2xl font-mono font-bold", timeLeft < 300 ? "text-red-600" : "text-brand")}>
            {formatTime(timeLeft)}
          </div>
          <Button onClick={onManualSubmit} loading={submitting}>Nộp bài</Button>
        </div>
      </div>

      <div className="space-y-6 px-4">
        {questions.map((qObj, index) => {
          const q = qObj.question;
          const qContent = (q?.content || {}) as Record<string, any>;
          const type = q?.type || 'UNKNOWN';
          let text = qContent.questionText || qContent.sentence || JSON.stringify(qContent);
          if (type === 'ORDERING') text = (qContent.correctOrder || []).join(' / ');
          if (type === 'MATCHING') text = 'Nối từ';
          const options = qContent.options as string[] | undefined;

          return (
          <Card key={qObj.questionId}>
            <CardBody className="space-y-4">
              <div className="flex gap-3">
                <span className="font-semibold text-lg">{index + 1}.</span>
                <div className="text-lg font-medium whitespace-pre-wrap">{text}</div>
              </div>

              <div className="pl-6">
                {type === 'SINGLE_CHOICE' && options && (
                  <div className="space-y-2">
                    {options.map((opt) => (
                      <label key={opt} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name={`q-${qObj.questionId}`}
                          value={opt}
                          checked={answers[qObj.questionId] === opt}
                          onChange={() => handleAnswerChange(qObj.questionId, opt)}
                          className="w-4 h-4 text-brand"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {type === 'TRUE_FALSE' && (
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${qObj.questionId}`}
                        checked={answers[qObj.questionId] === true}
                        onChange={() => handleAnswerChange(qObj.questionId, true)}
                        className="w-4 h-4"
                      />
                      <span>Đúng (True)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`q-${qObj.questionId}`}
                        checked={answers[qObj.questionId] === false}
                        onChange={() => handleAnswerChange(qObj.questionId, false)}
                        className="w-4 h-4"
                      />
                      <span>Sai (False)</span>
                    </label>
                  </div>
                )}

                {(type === 'SHORT_ANSWER' || type === 'FILL_IN') && (
                  <textarea
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:ring focus:ring-brand focus:border-brand"
                    placeholder="Nhập câu trả lời của bạn..."
                    value={(answers[qObj.questionId] as string) || ''}
                    onBlur={(e) => handleAnswerChange(qObj.questionId, e.target.value)}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [qObj.questionId]: e.target.value }))}
                  />
                )}
              </div>
            </CardBody>
          </Card>
        )})}
      </div>
    </div>
  );
}
