'use client';

import { useEffect, useRef, useState } from 'react';
import { practiceApi, subscriptionApi, hanziWritingApi } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/client';
import type { DailyUsageCheck, PracticeType, SourceType, SentenceQuestion, HanziChar } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { activityKey } from '@/lib/utils/constants';
import { clearSession, loadSession, saveSession } from '@/lib/utils/storage';
import { uuid } from '@/lib/utils/format';
import { loadSourceVocab } from './source-loader';
import { buildQuestions, type ModeResult, type QuestionItem } from './practice-models';

export type EngineStatus = 'loading' | 'limit' | 'error' | 'running' | 'finished';

export interface PersistedSession {
  attemptId: string;
  items: QuestionItem[];
  modeState: unknown;
  startedAt: string;
}

/** Session cho sentence ordering — lưu trữ token-level items thay vì QuestionItem. */
export interface SentenceOrderingSession {
  attemptId: string;
  questions: SentenceQuestion[];
  userAnswers: Record<string, string[]>;
  modeState: unknown;
  startedAt: string;
}

/** PR-13 Session cho hanzi writing. */
export interface HanziWritingSession {
  attemptId: string;
  characters: HanziChar[];
  modeState: unknown;
  startedAt: string;
}

export interface PracticeEngine<TState = unknown> {
  status: EngineStatus;
  error: string | null;
  limit: DailyUsageCheck | null;
  items: QuestionItem[];
  /** Chỉ set khi practiceType === SENTENCE_ORDERING */
  sentenceQuestions: SentenceQuestion[];
  /** Chỉ set khi practiceType === SENTENCE_ORDERING */
  userAnswers: Record<string, string[]>;
  /** Chỉ set khi practiceType === FILL_BLANK */
  fillBlankQuestions: import('@/lib/api/types').FillBlankQuestion[];
  /** Chỉ set khi practiceType === FILL_BLANK */
  fillBlankAnswers: Record<string, string>;
  /** Chỉ set khi practiceType === HANZI_WRITING */
  hanziChars: HanziChar[];
  setUserAnswers: (answers: Record<string, string[]>) => void;
  setFillBlankAnswers: (answers: Record<string, string>) => void;
  modeState: TState | null;
  setModeState: (state: TState) => void;
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
export function usePracticeEngine<TState = unknown>(options: {
  practiceType: PracticeType;
  sourceType: SourceType;
  sourceId: string;
  sessionKey: string;
  initialAttemptId?: string;
  initialHanziChars?: HanziChar[];
}): PracticeEngine<TState> {
  const { practiceType, sourceType, sourceId, sessionKey, initialAttemptId, initialHanziChars } = options;
  const { user } = useAuth();

  const [status, setStatus] = useState<EngineStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<DailyUsageCheck | null>(null);
  const [items, setItems] = useState<QuestionItem[]>([]);
  const [sentenceQuestions, setSentenceQuestions] = useState<SentenceQuestion[]>([]);
  const [fillBlankQuestions, setFillBlankQuestions] = useState<import('@/lib/api/types').FillBlankQuestion[]>([]);
  const [userAnswers, setUserAnswersState] = useState<Record<string, string[]>>({});
  const [fillBlankAnswers, setFillBlankAnswersState] = useState<Record<string, string>>({});
  const [hanziChars, setHanziChars] = useState<HanziChar[]>([]);
  const [modeState, setModeState] = useState<TState | null>(null);
  const [result, setResult] = useState<ModeResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef<string | null>(null);
  const attemptIdRef = useRef<string | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    // ── Sentence Ordering: dùng API riêng PR-10 ──
    if (practiceType === 'SENTENCE_ORDERING') {
      const saved = loadSession<SentenceOrderingSession>(sessionKey);
      if (saved) {
        attemptIdRef.current = saved.attemptId;
        startedAtRef.current = saved.startedAt;
        setSentenceQuestions(saved.questions);
        setUserAnswersState(saved.userAnswers);
        setModeState(saved.modeState as TState);
        setStatus('running');
        return;
      }
      let cancelled = false;
      (async () => {
        try {
          // Kiểm tra giới hạn lượt PR-14
          const check = await subscriptionApi.checkLimit(
            activityKey(practiceType, sourceType, sourceId),
          );
          if (cancelled) return;
          if (!check.allowed) {
            setLimit(check);
            setStatus('limit');
            return;
          }

          // Gọi API sentence-ordering/start — tạo attempt + shuffle
          const res = await practiceApi.sentenceOrderingStart({
            levelId: sourceType === 'LEVEL' ? sourceId : undefined,
            lessonId: sourceType === 'LESSON' ? sourceId : undefined,
            topicId: sourceType === 'TOPIC' ? sourceId : undefined,
            questionCount: 5,
            idempotencyKey: uuid(),
          });

          if (cancelled) return;

          if (!res.questions || res.questions.length === 0) {
            setError('Nguồn này chưa có bài tập sắp xếp câu.');
            setStatus('error');
            return;
          }

          const startedAt = new Date().toISOString();
          attemptIdRef.current = res.attemptId;
          startedAtRef.current = startedAt;
          setSentenceQuestions(res.questions);

          // Init userAnswers: mỗi câu bắt đầu với mảng rỗng
          const initAnswers: Record<string, string[]> = {};
          res.questions.forEach((q: import('@/lib/api/types').SentenceQuestion) => { initAnswers[q.questionId] = []; });
          setUserAnswersState(initAnswers);

          saveSession<SentenceOrderingSession>(sessionKey, {
            attemptId: res.attemptId,
            questions: res.questions,
            userAnswers: initAnswers,
            modeState: null,
            startedAt,
          });

          setStatus('running');
        } catch (e) {
          if (!cancelled) {
            if (e instanceof ApiError && e.status === 429) {
              setLimit({ allowed: false, usedCount: 0 });
              setStatus('limit');
              return;
            }
            setError(e instanceof Error ? e.message : 'Không thể bắt đầu bài sắp xếp câu.');
            setStatus('error');
          }
        }
      })();
      return () => { cancelled = true; };
    }

    // ── Hanzi Writing: dùng API riêng PR-13 ──
    if (practiceType === 'HANZI_WRITING') {
      if (initialAttemptId && initialHanziChars) {
        const savedHw = loadSession<HanziWritingSession>(sessionKey);
        // Khôi phục session nếu trùng attemptId
        if (savedHw && savedHw.attemptId === initialAttemptId) {
          attemptIdRef.current = savedHw.attemptId;
          startedAtRef.current = savedHw.startedAt;
          setHanziChars(savedHw.characters);
          setModeState(savedHw.modeState as TState);
          setStatus('running');
          return;
        }

        // Nếu chưa có session (hoặc attemptId mới), tạo session mới từ dữ liệu ban đầu
        const startedAt = new Date().toISOString();
        attemptIdRef.current = initialAttemptId;
        startedAtRef.current = startedAt;
        setHanziChars(initialHanziChars);

        saveSession<HanziWritingSession>(sessionKey, {
          attemptId: initialAttemptId,
          characters: initialHanziChars,
          modeState: null,
          startedAt,
        });

        setStatus('running');
        return;
      }

      // Fallback: nếu gọi mà không truyền initialAttemptId (không khuyên dùng cho Hanzi Writing nữa)
      const savedHw = loadSession<HanziWritingSession>(sessionKey);
      if (savedHw) {
        attemptIdRef.current = savedHw.attemptId;
        startedAtRef.current = savedHw.startedAt;
        setHanziChars(savedHw.characters);
        setModeState(savedHw.modeState as TState);
        setStatus('running');
        return;
      }

      let cancelled = false;
      (async () => {
        try {
          const check = await subscriptionApi.checkLimit(
            activityKey(practiceType, sourceType, sourceId),
          );
          if (cancelled) return;
          if (!check.allowed) {
            setLimit(check);
            setStatus('limit');
            return;
          }

          const res = await hanziWritingApi.start({
            levelId: sourceType === 'LEVEL' ? sourceId : undefined,
            lessonId: sourceType === 'LESSON' ? sourceId : undefined,
            topicId: sourceType === 'TOPIC' ? sourceId : undefined,
          });
          if (cancelled) return;

          const startedAt = new Date().toISOString();
          attemptIdRef.current = res.attemptId;
          startedAtRef.current = startedAt;
          setHanziChars(res.characters);

          saveSession<HanziWritingSession>(sessionKey, {
            attemptId: res.attemptId,
            characters: res.characters,
            modeState: null,
            startedAt,
          });

          setStatus('running');
        } catch (e) {
          if (!cancelled) {
            if (e instanceof ApiError && e.status === 429) {
              setLimit({ allowed: false, usedCount: 0 });
              setStatus('limit');
              return;
            }
            setError(e instanceof Error ? e.message : 'Không thể bắt đầu luyện viết chữ Hán.');
            setStatus('error');
          }
        }
      })();
      return () => { cancelled = true; };
    }

    // ── Fill in the Blank (PR-09) ──
    if (practiceType === 'FILL_BLANK') {
      type FillBlankSession = { attemptId: string; questions: import('@/lib/api/types').FillBlankQuestion[]; userAnswers: Record<string, string>; modeState: TState | null; startedAt: string; };
      const saved = loadSession<FillBlankSession>(sessionKey);
      if (saved) {
        attemptIdRef.current = saved.attemptId;
        startedAtRef.current = saved.startedAt;
        setFillBlankQuestions(saved.questions);
        setFillBlankAnswersState(saved.userAnswers);
        setModeState(saved.modeState as TState);
        setStatus('running');
        return;
      }
      
      let cancelled = false;
      (async () => {
        try {
          const check = await subscriptionApi.checkLimit(
            activityKey(practiceType, sourceType, sourceId),
          );
          if (cancelled) return;
          if (!check.allowed) {
            setLimit(check);
            setStatus('limit');
            return;
          }

          const res = await practiceApi.fillBlankStart({
            levelId: sourceType === 'LEVEL' ? sourceId : undefined,
            lessonId: sourceType === 'LESSON' ? sourceId : undefined,
            topicId: sourceType === 'TOPIC' ? sourceId : undefined,
            questionCount: 5,
            idempotencyKey: uuid(),
          });

          if (cancelled) return;

          if (!res.questions || res.questions.length === 0) {
            setError('Nguồn này chưa có bài tập điền từ.');
            setStatus('error');
            return;
          }

          const startedAt = new Date().toISOString();
          attemptIdRef.current = res.attemptId;
          startedAtRef.current = startedAt;
          setFillBlankQuestions(res.questions);

          const initAnswers: Record<string, string> = {};
          setFillBlankAnswersState(initAnswers);

          saveSession<{ attemptId: string; questions: import('@/lib/api/types').FillBlankQuestion[]; userAnswers: Record<string, string>; modeState: TState | null; startedAt: string; }>(sessionKey, {
            attemptId: res.attemptId,
            questions: res.questions,
            userAnswers: initAnswers,
            modeState: null,
            startedAt,
          });

          setStatus('running');
        } catch (e) {
          if (!cancelled) {
            if (e instanceof ApiError && e.status === 429) {
              setLimit({ allowed: false, usedCount: 0 });
              setStatus('limit');
              return;
            }
            setError(e instanceof Error ? e.message : 'Lỗi lấy danh sách câu hỏi.');
            setStatus('error');
          }
        }
      })();
      return () => { cancelled = true; };
    }

    // ── Các practice type khác: dùng từ vựng ──
    const saved = loadSession<PersistedSession>(sessionKey);
    if (saved) {
      attemptIdRef.current = saved.attemptId;
      startedAtRef.current = saved.startedAt;
      setItems(saved.items);
      setModeState(saved.modeState as TState);
      setStatus('running');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const vocab = await loadSourceVocab(sourceType, sourceId);
        const qs = buildQuestions(vocab);
        if (qs.length < 2) {
          if (!cancelled) {
            setError('Nguồn này chưa đủ từ vựng để luyện tập.');
            setStatus('error');
          }
          return;
        }
        const check = await subscriptionApi.checkLimit(
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
          if (e instanceof ApiError && e.status === 429) {
            setLimit({ allowed: false, usedCount: 0 });
            setStatus('limit');
            return;
          }
          setError(e instanceof Error ? e.message : 'Không thể bắt đầu phiên luyện tập.');
          setStatus('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user, practiceType, sourceType, sourceId, sessionKey]);

  useEffect(() => {
    if (status !== 'running' || !startedAtRef.current) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - Date.parse(startedAtRef.current!)) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  const persistState = (next: TState) => {
    setModeState(next);
    // Handle PersistedSession
    const saved = loadSession<PersistedSession>(sessionKey);
    if (saved) {
      saveSession(sessionKey, { ...saved, modeState: next });
      return;
    }
    // Handle HanziWritingSession
    const savedHw = loadSession<HanziWritingSession>(sessionKey);
    if (savedHw) saveSession(sessionKey, { ...savedHw, modeState: next });
  };

  const setUserAnswers = (next: Record<string, string[]>) => {
    setUserAnswersState(next);
    const saved = loadSession<SentenceOrderingSession>(sessionKey);
    if (saved) saveSession(sessionKey, { ...saved, userAnswers: next });
  };

  const setFillBlankAnswers = (next: Record<string, string>) => {
    setFillBlankAnswersState(next);
    type FillBlankSession = { attemptId: string; questions: import('@/lib/api/types').FillBlankQuestion[]; userAnswers: Record<string, string>; modeState: TState | null; startedAt: string; };
    const saved = loadSession<FillBlankSession>(sessionKey);
    if (saved) saveSession(sessionKey, { ...saved, userAnswers: next });
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
      if (!attemptIdRef.current) return;

      // ── Sentence Ordering: gọi API submit riêng PR-10 ──
      if (practiceType === 'SENTENCE_ORDERING') {
        const answersMap = (res.answerData && Object.keys(res.answerData).length > 0) ? res.answerData : userAnswers;
        const answers = Object.entries(answersMap).map(([questionId, tokenIds]) => ({
          questionId,
          tokenIds: tokenIds as string[],
        }));
        const grading = await practiceApi.sentenceOrderingSubmit(attemptIdRef.current, {
          answers,
          durationSeconds: duration,
        });
        // Override result = kết quả backend đã chấm (đáng tin cậy hơn)
        setResult({
          correctCount: grading.totalCorrect,
          wrongCount: grading.totalWrong,
          moveCount: 0,
          score: grading.score,
          answerData: { results: grading.results } as unknown as Record<string, unknown>,
        });
      } else if (practiceType === 'FILL_BLANK') {
        const answersMap = (res.answerData && Object.keys(res.answerData).length > 0) ? res.answerData : fillBlankAnswers;
        const answers = Object.entries(answersMap).map(([questionId, tokenId]) => ({
          questionId,
          tokenId: tokenId as string,
        }));
        const grading = await practiceApi.fillBlankSubmit(attemptIdRef.current, {
          answers,
          durationSeconds: duration,
        });
        setResult({
          correctCount: grading.totalCorrect,
          wrongCount: grading.totalWrong,
          moveCount: 0,
          score: grading.score,
          answerData: { results: grading.results } as unknown as Record<string, unknown>,
        });
      } else if (practiceType === 'HANZI_WRITING') {
        // PR-13: gọi API riêng, kết quả từ client
        const charResults = (res.answerData as { chars?: Array<{ char: string; mistakes: number; skipped: boolean }> } | undefined)?.chars ?? [];
        const completed = await hanziWritingApi.complete(attemptIdRef.current, {
          characters: charResults,
          durationSeconds: duration,
        });
        
        const totalChars = charResults.length;
        const percentageScore = totalChars === 0 ? 0 : Math.round((completed.completedChars / totalChars) * 100);
        const skippedChars = charResults.filter(c => c.skipped).length;

        setResult({
          correctCount: completed.completedChars,
          wrongCount: skippedChars,
          moveCount: completed.totalMistakes, // We can store totalMistakes in moveCount or just ignore it
          score: percentageScore,
          answerData: res.answerData,
        });
      } else {
        await practiceApi.submit(attemptIdRef.current, {
          score: res.score,
          correctCount: res.correctCount,
          wrongCount: res.wrongCount,
          moveCount: res.moveCount,
          durationSeconds: duration,
          answerData: { ...res.answerData, vocabResults: res.vocabResults },
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
    sentenceQuestions,
    fillBlankQuestions,
    userAnswers,
    fillBlankAnswers,
    hanziChars,
    setUserAnswers,
    setFillBlankAnswers,
    modeState,
    setModeState: persistState,
    result,
    elapsed,
    handleComplete,
  };
}
