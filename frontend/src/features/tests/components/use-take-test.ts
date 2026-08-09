'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { testApi } from '@/lib/api/endpoints';
import type { Test, TestQuestion } from '@/lib/api/types';

/**
 * State máy của màn làm bài kiểm tra (P2-6): tải đề, bắt đầu, đồng hồ + tự nộp
 * khi hết giờ, gửi từng câu (PR-05 server grading) rồi đọc kết quả đã chấm.
 * Tách khỏi page để logic timer/race dễ kiểm soát.
 */

export type TakeTestPhase =
  | 'loading'
  | 'info'
  | 'running'
  | 'submitting'
  | 'finished'
  | 'error';

export interface TakeTestResult {
  score: number;
  correct: number;
  totalQuestions: number;
  pointsEarned: number;
  totalPoints: number;
  duration: number;
}

export function useTakeTest(testId: string) {
  const [phase, setPhase] = useState<TakeTestPhase>('loading');
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [current, setCurrent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<TakeTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, qs] = await Promise.all([
          testApi.get(testId),
          testApi.listQuestions({ testId }),
        ]);
        if (cancelled) return;
        setTest(t);
        setQuestions(qs.slice().sort((a, b) => a.displayOrder - b.displayOrder));
        setPhase('info');
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Lỗi tải bài kiểm tra.');
        setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [testId]);

  const start = async () => {
    try {
      const attempt = await testApi.startAttempt(testId);
      setAttemptId(attempt.id);
      setPhase('running');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể bắt đầu bài kiểm tra.');
      setPhase('error');
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
        totalQuestions: questions.length,
        pointsEarned,
        totalPoints,
        duration,
      });
      setPhase('finished');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi khi nộp bài.');
      setPhase('error');
    }
  }, [answers, attemptId, elapsed, questions]);

  // Giữ tham chiếu submit luôn mới nhất để bộ đếm giờ tự nộp không dùng closure cũ.
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  // Đồng hồ + tự nộp khi hết giờ. timeLimitMinutes <= 0 = không giới hạn thời gian.
  useEffect(() => {
    if (phase !== 'running' || !test) return;
    if (!(test.timeLimitMinutes > 0)) return;
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

  const setAnswer = (questionId: string, answer: unknown) =>
    setAnswers((a) => ({ ...a, [questionId]: answer }));

  return {
    phase,
    test,
    questions,
    attemptId,
    answers,
    current,
    elapsed,
    result,
    error,
    confirmSubmit,
    setCurrent,
    setAnswer,
    setConfirmSubmit,
    start,
    submit,
  };
}
