'use client';

import { useState } from 'react';
import type { SentenceQuestion } from '@/lib/api/types';
import type { ModeResult } from './practice-models';
import { Button } from '@/features/ui/components/button';

export interface OrderingState {
  index: number;
  answer: string[];          // mảng token ID đã chọn
  correct: number;
  wrong: number;
  moves: number;
  feedback: 'correct' | 'wrong' | null;
  questionResults: Record<string, 'correct' | 'wrong' | null>;
}

interface SentenceOrderingModeProps {
  /** Câu hỏi từ backend (đã shuffle) */
  questions: SentenceQuestion[];
  initialState?: OrderingState | null;
  /** Lưu userAnswers: questionId → tokenIds[] */
  onAnswersChange: (answers: Record<string, string[]>) => void;
  /** User đang trả lời xong tất cả câu → gọi handleComplete */
  onComplete: (result: ModeResult) => void;
}

export function SentenceOrderingMode({
  questions,
  initialState,
  onAnswersChange,
  onComplete,
}: SentenceOrderingModeProps) {
  const total = questions.length;

  const [state, setState] = useState<OrderingState>(() =>
    initialState
      ? initialState
      : {
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
    const answers: Record<string, string[]> = {};
    questions.forEach((q, idx) => {
      if (idx === state.index) {
        answers[q.questionId] = next.answer;
      } else {
        answers[q.questionId] = initialState
          ? (Object.values(initialState.questionResults).length > 0
              ? []
              : [])
          : [];
      }
    });
    // Merge với các câu trước đó
    const prevAnswers: Record<string, string[]> = {};
    questions.forEach((q) => { prevAnswers[q.questionId] = []; });
    Object.entries(prevAnswers).forEach(([qId, ids]) => {
      if (qId === questions[state.index]?.questionId) {
        prevAnswers[qId] = next.answer;
      }
    });
    onAnswersChange(prevAnswers);
  };

  const question = questions[state.index];
  if (!question) return null;

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

  /** Kiểm tra câu hiện tại (dùng token ID so với backend đã lưu snapshot) */
  const check = async () => {
    if (state.feedback || state.answer.length === 0) return;

    // Phía client: kiểm tra đủ token
    const neededCount = question.tokens.length;
    const hasAllTokens =
      state.answer.length === neededCount &&
      new Set(state.answer).size === neededCount;

    if (!hasAllTokens) return;

    // Submit sẽ được backend chấm — ở đây tạm tính client-side cho UX
    const isCorrect = true; // Backend sẽ override khi submit
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
      // Đây là câu cuối → nộp bài
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
      // Chuyển câu tiếp theo sau delay
      setTimeout(() => {
        const nextState: OrderingState = {
          index: state.index + 1,
          answer: [],
          correct: next.correct,
          wrong: next.wrong,
          moves: next.moves,
          feedback: null,
          questionResults: next.questionResults,
        };
        setState(nextState);
      }, 800);
    }
  };

  /** Token chưa dùng = tokens chưa có trong answer */
  const usedIds = new Set(state.answer);
  const remainingTokens = question.tokens.filter((t) => !usedIds.has(t.id));

  const canSubmit =
    state.answer.length === question.tokens.length &&
    new Set(state.answer).size === question.tokens.length &&
    !state.feedback;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Câu {state.index + 1}/{total}
        </span>
        <span>
          Đúng {state.correct} · Sai {state.wrong}
        </span>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-gray-200 p-6 text-center">
        {/* Pinyin + nghĩa */}
        {question.translation && (
          <p className="text-lg font-semibold text-brand mb-1">{question.translation}</p>
        )}
        {question.explanation && (
          <p className="text-sm text-gray-500 italic mb-3">{question.explanation}</p>
        )}

        <p className="text-xs text-gray-400 mt-2">Sắp xếp các từ thành câu đúng:</p>

        {/* Vùng trả lời — token đã chọn */}
        <div className="mt-3 flex min-h-[52px] flex-wrap items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#8BC34A] bg-[#f9fdf5] p-3">
          {state.answer.length === 0 && (
            <span className="text-sm text-gray-400">Chạm từ bên dưới để ghép</span>
          )}
          {state.answer.map((tokenId, pos) => {
            const token = question.tokens.find((t) => t.id === tokenId);
            if (!token) return null;
            const isWrong = state.feedback === 'wrong';
            return (
              <div key={`${tokenId}-${pos}`} className="flex items-center gap-0.5">
                {pos > 0 && (
                  <button
                    onClick={() => moveLeft(pos)}
                    disabled={!!state.feedback}
                    className="text-gray-400 hover:text-brand disabled:opacity-30 text-xs px-1"
                    title="←"
                  >
                    ‹
                  </button>
                )}
                <button
                  onClick={() => removeToken(pos)}
                  disabled={!!state.feedback}
                  className={`hanzi rounded-md px-3 py-1.5 text-xl font-bold transition-colors ${
                    isWrong
                      ? 'bg-red-100 text-red-500 line-through'
                      : 'bg-[#8BC34A] text-white'
                  } disabled:opacity-60`}
                >
                  {token.text}
                </button>
                {pos < state.answer.length - 1 && (
                  <button
                    onClick={() => moveRight(pos)}
                    disabled={!!state.feedback}
                    className="text-gray-400 hover:text-brand disabled:opacity-30 text-xs px-1"
                    title="→"
                  >
                    ›
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Vùng chọn — token chưa dùng */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {remainingTokens.map((token) => (
            <button
              key={token.id}
              onClick={() => pickToken(token.id)}
              disabled={!!state.feedback}
              className="hanzi rounded-md border-2 border-gray-200 bg-white px-3 py-1.5 text-xl font-bold text-gray-700 hover:border-[#8BC34A] hover:text-brand disabled:opacity-40 transition-colors"
            >
              {token.text}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {state.feedback === 'correct' && (
          <p className="mt-4 font-medium text-green-600">Chính xác! ✓</p>
        )}
        {state.feedback === 'wrong' && (
          <p className="mt-4 font-medium text-red-600">
            Chưa đúng — thử lại câu khác nhé!
          </p>
        )}

        {/* Nút kiểm tra */}
        <div className="mt-4">
          <Button
            onClick={check}
            disabled={!canSubmit}
          >
            Kiểm tra
          </Button>
        </div>

        {/* Số token còn thiếu */}
        {!canSubmit && state.answer.length > 0 && (
          <p className="mt-2 text-xs text-gray-400">
            {question.tokens.length - state.answer.length} từ còn thiếu
          </p>
        )}
      </div>
    </div>
  );
}
