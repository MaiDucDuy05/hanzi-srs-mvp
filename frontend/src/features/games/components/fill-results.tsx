'use client';

/**
 * FillResults — results screen for the "Điền từ" game.
 * Combines the polished GameSummary (stars / score / stats / actions) with a
 * per-question review showing correct vs wrong, the filled prompt, translation
 * and explanation. Forest-palette correct/wrong cards.
 */
import React from 'react';
import type { FillBlankQuestion } from '@/lib/api/types';
import type { ModeResult } from '@/features/practice/components/practice-models';
import { GameSummary } from './game-summary';
import { CheckCircle, XCircle } from 'lucide-react';

interface FillResultsProps {
  result: ModeResult | null;
  fillBlankQuestions: FillBlankQuestion[];
  elapsed: number;
  onExit: () => void;
  onReplay?: () => void;
}

export function FillResults({ result, fillBlankQuestions, elapsed, onExit, onReplay }: FillResultsProps) {
  if (!result) return null;

  const resultsData = (result.answerData as { results?: Array<{ questionId: string; isCorrect: boolean; submittedTokenId?: string; correctTokenId?: string }> })?.results || [];
  const total = fillBlankQuestions.length;
  const correct = result.correctCount ?? 0;
  // Fill-blank score is a raw count — convert to a percentage for GameSummary.
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  const title = pct >= 80 ? 'Tuyệt vời! 🎉' : pct >= 50 ? 'Khá tốt! 👍' : 'Cố gắng nhé! 💪';

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-2xl mx-auto px-4 py-4 relative z-10 overflow-y-auto">
      {/* Summary card (stars / score / stats / actions) */}
      <GameSummary
        title={title}
        subtitle="Hoàn thành Điền từ"
        result={{ ...result, score: pct }}
        elapsed={elapsed}
        onReplay={onReplay}
        onExit={onExit}
      />

      {/* ── Detailed per-question review ── */}
      <div className="w-full mt-6 space-y-3">
        <h3 className="text-lg font-black text-[#215b3b] font-heading px-1">Chi tiết đáp án</h3>

        {fillBlankQuestions.map((q, idx) => {
          const qResult = resultsData.find((r) => r.questionId === q.questionId);
          const isCorrect = qResult?.isCorrect;
          const correctAns = qResult?.correctTokenId || '';
          const submittedAns = qResult?.submittedTokenId || '';
          // Show the submitted answer in the blank when correct; otherwise show
          // "submitted → correct" so the learner sees both their pick and the right one.
          const fillText = isCorrect
            ? submittedAns
            : `[${submittedAns || '???'} → ${correctAns}]`;

          return (
            <div
              key={q.questionId}
              className={`p-4 rounded-2xl border-2 shadow-sm ${
                isCorrect ? 'border-[#b8e0b0] bg-[#eaf3c5]' : 'border-[#f0c0c0] bg-[#fdeaea]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-[#4a5a3a]">Câu {idx + 1}</span>
                <span className={`flex items-center gap-1 text-sm font-bold ${isCorrect ? 'text-[#4a6520]' : 'text-[#c0392b]'}`}>
                  {isCorrect ? (
                    <><CheckCircle className="w-4 h-4" /> Đúng</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> Sai</>
                  )}
                </span>
              </div>

              <p className="text-lg font-serif font-bold text-[#215b3b] mb-2 tracking-wide break-words">
                {q.prompt.replace('______', fillText)}
              </p>

              {q.translation && (
                <p className="text-sm text-[#4a5a3a]/70 italic mb-1">
                  <span className="font-semibold not-italic">Dịch:</span> {q.translation}
                </p>
              )}
              {q.explanation && (
                <p className="text-sm text-[#4a5a3a]/80 bg-white/60 rounded-lg p-2 mt-1">
                  <span className="font-semibold">Giải thích:</span> {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
