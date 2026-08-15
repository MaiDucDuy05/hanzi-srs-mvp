'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePracticeEngine } from '@/features/practice/components/practice-engine';
import { GameSummary } from '@/features/games/components/game-summary';
import { SentenceGameBoard } from '@/features/games/components/sentence-game-board';
import { Loader2, XCircle } from 'lucide-react';
import type { SourceType } from '@/lib/api/types';

export function SentenceGameFeature({ sourceType, sourceId }: { sourceType: SourceType; sourceId: string }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const engine = usePracticeEngine({
    practiceType: 'SENTENCE_ORDERING',
    sourceType,
    sourceId,
    sessionKey: 'sentence-ordering-session',
  });

  if (engine.status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#8BC34A] mb-4" />
        <p className="text-lg font-medium text-[#4a6b38]">Đang tải câu hỏi...</p>
      </div>
    );
  }

  if (engine.status === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px]">
        <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-6">{engine.error}</p>
          <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (engine.status === 'limit') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px]">
        <div className="bg-orange-50 p-6 rounded-2xl border-2 border-orange-200 text-center max-w-md">
          <p className="text-orange-700 font-medium mb-6">Bạn đã hết lượt luyện tập hôm nay.</p>
          <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-semibold">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (engine.status === 'finished' && engine.result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <GameSummary
          title="Tuyệt vời! 🎉"
          subtitle="Hoàn thành Sắp xếp câu (Sentence Game)"
          result={engine.result}
          elapsed={engine.elapsed}
          onReplay={() => window.location.reload()}
          onExit={() => router.push('/dashboard')}
        />
      </div>
    );
  }

  // Running: interactive game
  const currentQuestion = engine.sentenceQuestions[currentIndex];
  if (!currentQuestion) return null;

  const currentAnswers = engine.userAnswers[currentQuestion.questionId] || [];

  const handleSelect = (tokenId: string) => {
    engine.setUserAnswers({
      ...engine.userAnswers,
      [currentQuestion.questionId]: [...currentAnswers, tokenId],
    });
  };

  const handleDeselect = (tokenId: string) => {
    engine.setUserAnswers({
      ...engine.userAnswers,
      [currentQuestion.questionId]: currentAnswers.filter(id => id !== tokenId),
    });
  };

  const swapLeft = (index: number) => {
    if (index === 0) return;
    const next = [...currentAnswers];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    engine.setUserAnswers({ ...engine.userAnswers, [currentQuestion.questionId]: next });
  };

  const swapRight = (index: number) => {
    if (index === currentAnswers.length - 1) return;
    const next = [...currentAnswers];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    engine.setUserAnswers({ ...engine.userAnswers, [currentQuestion.questionId]: next });
  };

  const handleNext = () => {
    if (currentIndex < engine.sentenceQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      engine.handleComplete({ correctCount: 0, wrongCount: 0, moveCount: 0, score: 0, answerData: engine.userAnswers });
    }
  };

  return (
    <SentenceGameBoard
      questions={engine.sentenceQuestions}
      userAnswers={engine.userAnswers}
      currentIndex={currentIndex}
      onSelectToken={handleSelect}
      onDeselectToken={handleDeselect}
      onSwapLeft={swapLeft}
      onSwapRight={swapRight}
      onPrev={() => setCurrentIndex(i => Math.max(0, i - 1))}
      onNext={handleNext}
      onSubmit={() => handleNext()}
    />
  );
}
