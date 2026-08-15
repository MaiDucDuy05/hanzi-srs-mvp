'use client';

/**
 * FillGameFeature — orchestrator for the "Điền từ" (fill-in-the-blank) game page.
 * Handles engine status states (loading / error / limit / running / finished),
 * renders the game header (title + timer + bamboo progress) while running, and
 * delegates the board / results to FillGameBoard / FillResults.
 */
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePracticeEngine } from '@/features/practice/components/practice-engine';
import type { SourceType } from '@/lib/api/types';
import { BambooBackground } from '../components/game-decorations';
import { BambooProgressBar } from '@/features/ui/components/bamboo-progress-bar';
import { FillGameBoard } from '../components/fill-game-board';
import { FillResults } from '../components/fill-results';
import { Loader2, XCircle, Clock } from 'lucide-react';

interface FillGameFeatureProps {
  sourceId: string;
  sourceType: SourceType;
}

/** mm:ss formatter for the timer pill. */
function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function FillGameFeature({ sourceId, sourceType }: FillGameFeatureProps) {
  const router = useRouter();

  const {
    status,
    error,
    limit,
    fillBlankQuestions,
    fillBlankAnswers,
    setFillBlankAnswers,
    result,
    elapsed,
    handleComplete,
  } = usePracticeEngine({
    practiceType: 'FILL_BLANK',
    sourceType,
    sourceId,
    sessionKey: `fill-blank-${sourceId}`,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAnswer = useCallback((questionId: string, tokenId: string, isLast: boolean) => {
    const newAnswers = { ...fillBlankAnswers, [questionId]: tokenId };
    setFillBlankAnswers(newAnswers);

    if (isLast) {
      handleComplete({
        correctCount: 0,
        wrongCount: 0,
        moveCount: 0,
        score: 0,
        answerData: newAnswers,
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [fillBlankAnswers, setFillBlankAnswers, handleComplete]);

  // ── Loading ──
  if (status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <img
          src="/assets/illustrations/panda/panda-holding-ball.svg"
          alt=""
          className="w-24 h-24 mb-4 animate-panda-idle drop-shadow-md"
        />
        <Loader2 className="w-8 h-8 animate-spin text-[#5e7f26] mb-2" />
        <p className="text-[#215b3b] font-bold">Đang tải bài tập...</p>
      </div>
    );
  }

  // ── Error ──
  if (status === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="w-16 h-16 bg-[#fdeaea] rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-[#c0392b]" />
        </div>
        <h3 className="text-xl font-black text-[#215b3b] mb-2 font-heading">Không thể bắt đầu</h3>
        <p className="text-[#4a5a3a]/70 mb-6">{error || 'Có lỗi xảy ra khi tải dữ liệu.'}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-[#5e7f26] text-white rounded-full font-bold shadow-md hover:bg-[#4a6520] transition-colors active:scale-95"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // ── Daily limit reached ──
  if (status === 'limit' && limit) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="w-16 h-16 bg-[#fff4d6] rounded-full flex items-center justify-center mb-4 text-3xl">⏰</div>
        <h3 className="text-xl font-black text-[#215b3b] mb-2 font-heading">Hết lượt chơi</h3>
        <p className="text-[#4a5a3a]/70 mb-6">Bạn đã hết lượt chơi hôm nay. Quay lại sau nhé!</p>
        <button
          onClick={() => router.push('/dashboard/practice')}
          className="px-6 py-2.5 bg-[#5e7f26] text-white rounded-full font-bold shadow-md hover:bg-[#4a6520] transition-colors active:scale-95"
        >
          Về trang luyện tập
        </button>
      </div>
    );
  }

  // ── Finished ──
  if (status === 'finished' && result) {
    return (
      <div className="relative w-full flex-1 flex flex-col">
        <BambooBackground />
        <FillResults
          result={result}
          fillBlankQuestions={fillBlankQuestions}
          elapsed={elapsed}
          onReplay={() => window.location.reload()}
          onExit={() => router.push('/dashboard/practice')}
        />
      </div>
    );
  }

  // ── Running ──
  const currentQuestion = fillBlankQuestions[currentIndex];
  if (!currentQuestion) return null;

  const total = fillBlankQuestions.length;
  const progressPct = total > 0 ? (currentIndex / total) * 100 : 0;

  return (
    <div className="relative w-full flex-1 flex flex-col">
      <BambooBackground />

      {/* Header: title + timer + question counter */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-2 sm:px-4 mb-1 shrink-0">
        <h1 className="text-xl sm:text-2xl font-black text-[#215b3b] font-heading drop-shadow-sm flex items-center gap-2">
          <span className="text-2xl">✍️</span> Điền từ
        </h1>
        <div className="flex items-center gap-2">
          <div className="bg-white/80 backdrop-blur text-[#215b3b] font-bold text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-[#eaf3c5]">
            <Clock className="w-4 h-4" />
            {formatDuration(elapsed)}
          </div>
          <div className="bg-white/80 backdrop-blur text-[#5e7f26] font-bold text-sm px-3 py-1.5 rounded-full shadow-sm border border-[#eaf3c5]">
            {currentIndex + 1}/{total}
          </div>
        </div>
      </div>

      {/* Bamboo progress bar */}
      <div className="relative z-10 w-full px-2 sm:px-4 mb-1 shrink-0">
        <BambooProgressBar
          progress={progressPct}
          hidePanda
          className="!h-[56px] sm:!h-[72px]"
          labelClassName="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] sm:text-sm text-[#215b3b] bg-white/70 px-1 py-0.5 rounded"
        />
      </div>

      {/* Board */}
      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto">
        <FillGameBoard
          question={currentQuestion}
          onAnswer={(tokenId) =>
            handleAnswer(
              currentQuestion.questionId,
              tokenId,
              currentIndex === total - 1,
            )
          }
        />
      </div>
    </div>
  );
}
