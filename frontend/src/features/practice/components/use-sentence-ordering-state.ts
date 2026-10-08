'use client';

import { useState } from 'react';
import type { SentenceQuestion } from '@/lib/api/types';
import type { ModeResult } from './practice-models';

export interface OrderingState {
  index: number;
  answer: string[];          // mảng token ID đã chọn
  correct: number;
  wrong: number;
  moves: number;
  feedback: 'correct' | 'wrong' | null;
  questionResults: Record<string, 'correct' | 'wrong' | null>;
}

export interface UseSentenceOrderingStateProps {
  questions: SentenceQuestion[];
  initialState?: OrderingState | null;
  onAnswersChange: (answers: Record<string, string[]>) => void;
  onComplete: (result: ModeResult) => void;
}

/**
 * Hook quản lý trạng thái, thao tác ghép từ và chấm điểm cho chế độ Sắp xếp câu (Sentence Ordering).
 */
export function useSentenceOrderingState({
  questions,
  initialState,
  onAnswersChange,
  onComplete,
}: UseSentenceOrderingStateProps) {
  const total = questions.length;

  const [state, setState] = useState<OrderingState>(() =>
    initialState ?? {
      index: 0,
      answer: [],
      correct: 0,
      wrong: 0,
      moves: 0,
      feedback: null,
      questionResults: {},
    },
  );

  const update = (next: OrderingState) => {
    setState(next);
    // Persist userAnswers: mỗi câu → mảng token ID
    const prevAnswers: Record<string, string[]> = {};
    questions.forEach((q) => {
      prevAnswers[q.questionId] = [];
    });
    Object.entries(prevAnswers).forEach(([qId]) => {
      if (qId === questions[state.index]?.questionId) {
        prevAnswers[qId] = next.answer;
      }
    });
    onAnswersChange(prevAnswers);
  };

  const question = questions[state.index];

  /** Chuyển token vào vùng trả lời */
  const pickToken = (tokenId: string) => {
    if (state.feedback) return;
    update({
      ...state,
      answer: [...state.answer, tokenId],
      moves: state.moves + 1,
    });
  };

  /** Bỏ token khỏi vùng trả lời */
  const removeToken = (position: number) => {
    if (state.feedback) return;
    const answer = [...state.answer];
    answer.splice(position, 1);
    update({
      ...state,
      answer,
      moves: state.moves + 1,
    });
  };

  /** Đặt lại toàn bộ từ đã ghép về ngân hàng từ */
  const resetAnswer = () => {
    if (state.feedback || state.answer.length === 0) return;
    update({
      ...state,
      answer: [],
      moves: state.moves + 1,
    });
  };

  /** Chuyển token sang trái trong vùng trả lời */
  const moveLeft = (position: number) => {
    if (position === 0) return;
    const answer = [...state.answer];
    [answer[position - 1], answer[position]] = [answer[position], answer[position - 1]];
    update({ ...state, answer, moves: state.moves + 1 });
  };

  /** Chuyển token sang phải trong vùng trả lời */
  const moveRight = (position: number) => {
    if (position === state.answer.length - 1) return;
    const answer = [...state.answer];
    [answer[position], answer[position + 1]] = [answer[position + 1], answer[position]];
    update({ ...state, answer, moves: state.moves + 1 });
  };

  /** Kiểm tra câu hiện tại */
  const check = async () => {
    if (!question || state.feedback || state.answer.length === 0) return;

    const neededCount = question.tokens.length;
    const hasAllTokens =
      state.answer.length === neededCount &&
      new Set(state.answer).size === neededCount;

    if (!hasAllTokens) return;

    const isCorrect = true; // Backend sẽ override khi submit kết quả phiên
    const next: OrderingState = {
      ...state,
      feedback: isCorrect ? 'correct' : 'wrong',
      correct: state.correct + (isCorrect ? 1 : 0),
      wrong: state.wrong + (isCorrect ? 0 : 1),
      moves: state.moves + 1,
      questionResults: {
        ...state.questionResults,
        [question.questionId]: isCorrect ? 'correct' : 'wrong',
      },
    };

    if (state.index + 1 >= total) {
      update(next);
      setTimeout(() => {
        const result: ModeResult = {
          correctCount: next.correct,
          wrongCount: next.wrong,
          moveCount: next.moves,
          score: Math.round((next.correct / total) * 100),
          answerData: { questions: total } as unknown as Record<string, unknown>,
        };
        onComplete(result);
      }, 800);
    } else {
      update(next);
      setTimeout(() => {
        setState({
          index: state.index + 1,
          answer: [],
          correct: next.correct,
          wrong: next.wrong,
          moves: next.moves,
          feedback: null,
          questionResults: next.questionResults,
        });
      }, 800);
    }
  };

  const usedIds = new Set(state.answer);
  const remainingTokens = question ? question.tokens.filter((t) => !usedIds.has(t.id)) : [];
  const isCompact = (question?.tokens.length ?? 0) > 7;

  const canSubmit =
    question !== undefined &&
    state.answer.length === question.tokens.length &&
    new Set(state.answer).size === question.tokens.length &&
    !state.feedback;

  const progressPercent = total > 0 ? Math.round(((state.index + 1) / total) * 100) : 0;

  return {
    state,
    total,
    question,
    remainingTokens,
    isCompact,
    canSubmit,
    progressPercent,
    pickToken,
    removeToken,
    resetAnswer,
    moveLeft,
    moveRight,
    check,
  };
}
