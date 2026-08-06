'use client';

import { useEffect, useRef, useState } from 'react';
import { practiceApi, subscriptionApi } from '@/lib/api/endpoints';
import type { DailyUsageCheck, PracticeType, SourceType } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { activityKey } from '@/lib/utils/constants';
import { clearSession, loadSession, saveSession } from '@/lib/utils/storage';
import { uuid } from '@/lib/utils/format';
import { loadSourceVocab } from './source-loader';
import { buildQuestions, splitChars, type ModeResult, type QuestionItem } from './practice-models';

export type EngineStatus = 'loading' | 'limit' | 'error' | 'running' | 'finished';

export interface PersistedSession {
  attemptId: string;
  items: QuestionItem[];
  modeState: unknown;
  startedAt: string;
}

export interface PracticeEngine {
  status: EngineStatus;
  error: string | null;
  limit: DailyUsageCheck | null;
  items: QuestionItem[];
  modeState: unknown;
  setModeState: (state: unknown) => void;
  result: ModeResult | null;
  elapsed: number;
  handleComplete: (res: ModeResult) => void;
}

/**
 * Engine dùng chung cho mọi phiên luyện tập/trò chơi:
 * - Khôi phục phiên từ sessionStorage (PR: không mất tiến độ khi refresh).
 * - Nạp từ vựng nguồn, kiểm tra giới hạn PR-14, start attempt.
 * - Đếm thời gian, lưu trạng thái, submit kết quả.
 */
export function usePracticeEngine(options: {
  practiceType: PracticeType;
  sourceType: SourceType;
  sourceId: string;
  sessionKey: string;
}): PracticeEngine {
  const { practiceType, sourceType, sourceId, sessionKey } = options;
  const { user } = useAuth();

  const [status, setStatus] = useState<EngineStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<DailyUsageCheck | null>(null);
  const [items, setItems] = useState<QuestionItem[]>([]);
  const [modeState, setModeState] = useState<unknown>(null);
  const [result, setResult] = useState<ModeResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef<string | null>(null);
  const attemptIdRef = useRef<string | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    const saved = loadSession<PersistedSession>(sessionKey);
    if (saved) {
      attemptIdRef.current = saved.attemptId;
      startedAtRef.current = saved.startedAt;
      setItems(saved.items);
      setModeState(saved.modeState);
      setStatus('running');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const vocab = await loadSourceVocab(sourceType, sourceId);
        let qs = buildQuestions(vocab);
        if (practiceType === 'SENTENCE_ORDERING') {
          qs = qs.filter((q) => splitChars(q.hanzi).length >= 2);
        }
        if (qs.length < 2) {
          if (!cancelled) {
            setError('Nguồn này chưa đủ từ vựng để luyện tập.');
            setStatus('error');
          }
          return;
        }
        const check = await subscriptionApi.checkLimit(
          user.id,
          activityKey(practiceType, sourceType, sourceId),
        );
        if (cancelled) return;
        if (!check.allowed) {
          setLimit(check);
          setStatus('limit');
          return;
        }
        const attempt = await practiceApi.start({
          practiceType,
          sourceType,
          sourceId,
          idempotencyKey: uuid(),
        });
        if (cancelled) return;
        const startedAt = new Date().toISOString();
        attemptIdRef.current = attempt.id;
        startedAtRef.current = startedAt;
        setItems(qs);
        setStatus('running');
        saveSession<PersistedSession>(sessionKey, {
          attemptId: attempt.id,
          items: qs,
          modeState: null,
          startedAt,
        });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Không thể bắt đầu phiên luyện tập.');
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, practiceType, sourceType, sourceId, sessionKey]);

  useEffect(() => {
    if (status !== 'running' || !startedAtRef.current) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - Date.parse(startedAtRef.current!)) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  const persistState = (next: unknown) => {
    setModeState(next);
    const saved = loadSession<PersistedSession>(sessionKey);
    if (saved) saveSession(sessionKey, { ...saved, modeState: next });
  };

  const handleComplete = async (res: ModeResult) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setResult(res);
    const duration = startedAtRef.current
      ? Math.max(1, Math.floor((Date.now() - Date.parse(startedAtRef.current)) / 1000))
      : 0;
    setElapsed(duration);
    try {
      if (attemptIdRef.current) {
        await practiceApi.submit(attemptIdRef.current, {
          score: res.score,
          correctCount: res.correctCount,
          wrongCount: res.wrongCount,
          moveCount: res.moveCount,
          durationSeconds: duration,
          answerData: res.answerData,
        });
      }
    } catch {
      // Gửi lỗi không chặn kết quả hiển thị.
    }
    clearSession(sessionKey);
    setStatus('finished');
  };

  return {
    status,
    error,
    limit,
    items,
    modeState,
    setModeState: persistState,
    result,
    elapsed,
    handleComplete,
  };
}
