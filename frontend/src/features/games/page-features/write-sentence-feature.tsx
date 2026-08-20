'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePracticeEngine } from '@/features/practice/components/practice-engine';
import { GameSummary } from '../components/game-summary';
import { WriteSentenceBoard } from '../components/write-sentence-board';
import { BambooBackground } from '../components/game-decorations';
import { Loader2, XCircle } from 'lucide-react';
import type { SourceType } from '@/lib/api/types';

interface WriteSentenceFeatureProps {
  sourceId: string;
  sourceType: SourceType;
}

export function WriteSentenceFeature({ sourceId, sourceType }: WriteSentenceFeatureProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const engine = usePracticeEngine({
    practiceType: 'SENTENCE_ORDERING',
    sourceId,
    sourceType,
    sessionKey: `write-sentence-session-${sourceId}`,
  });

  if (engine.status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center h-full min-h-screen">
        <Loader2 className="w-12 h-12 text-[#215b3b] animate-spin" />
      </div>
    );
  }

  if (engine.status === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-screen gap-4">
        <XCircle className="w-16 h-16 text-red-400" />
        <p className="text-gray-600 font-medium text-lg text-center max-w-sm">{engine.error || 'Không tìm thấy câu hỏi.'}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-[#215b3b] text-white rounded-full font-bold">Quay lại</button>
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
          title="Xuất sắc! ✍️"
          subtitle="Hoàn thành Viết câu (Write the Sentence)"
          result={engine.result}
          elapsed={engine.elapsed}
          onReplay={() => window.location.reload()}
          onExit={() => router.push('/dashboard')}
        />
      </div>
    );
  }

  const currentQuestion = engine.sentenceQuestions[currentIndex];
  if (!currentQuestion) return null;

  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden">
      <BambooBackground />
      <WriteSentenceBoard
        questions={engine.sentenceQuestions}
        currentIndex={currentIndex}
        userAnswers={engine.userAnswers}
        onUpdateAnswers={(tokenIds) => {
          engine.setUserAnswers({ ...engine.userAnswers, [currentQuestion.questionId]: tokenIds });
        }}
        onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        onNext={() => {
          if (currentIndex < engine.sentenceQuestions.length - 1) {
            setCurrentIndex((i) => i + 1);
          } else {
            engine.handleComplete({
              correctCount: 0, wrongCount: 0, moveCount: 0, score: 0, answerData: {},
            });
          }
        }}
        onSubmit={() => engine.handleComplete({
          correctCount: 0, wrongCount: 0, moveCount: 0, score: 0, answerData: {},
        })}
      />
    </div>
  );
}
