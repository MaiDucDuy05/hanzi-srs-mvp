'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePracticeEngine } from '@/features/practice/components/practice-engine';
import { shuffle, type ModeResult, type QuestionItem } from '@/features/practice/components/practice-models';
import type { SourceType } from '@/lib/api/types';
import { GameSummary } from '@/features/games/components/game-summary';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { BambooProgressBar } from '@/features/ui/components/bamboo-progress-bar';

export interface MemoryState {
  cards: Array<{ id: string; content: string; pairId: string }>;
  flipped: number[];
  matchedPairIds: string[];
  mistakes: number;
  moves: number;
  isGameActive: boolean;
}

function pickPairs(items: QuestionItem[]): QuestionItem[] {
  const pool = shuffle(items);
  const n = Math.min(8, Math.max(4, pool.length)); // Max 8 pairs (16 cards)
  return pool.slice(0, n);
}

function buildCards(pairs: QuestionItem[]) {
  const cards: Array<{ id: string; content: string; pairId: string }> = [];
  pairs.forEach((item) => {
    cards.push({ id: `${item.id}-hanzi`, content: item.hanzi, pairId: item.id });
    cards.push({ id: `${item.id}-pinyin`, content: item.pinyin, pairId: item.id });
  });
  return shuffle(cards);
}

function MemoryGameBoard({
  items,
  initialState,
  onStateChange,
  onComplete,
}: {
  items: QuestionItem[];
  initialState: MemoryState | null;
  onStateChange: (state: MemoryState) => void;
  onComplete: (res: ModeResult) => void;
}) {
  const pairs = useMemo(() => pickPairs(items), [items]);
  const [state, setState] = useState<MemoryState>(() => {
    if (initialState) return initialState;
    return {
      cards: buildCards(pairs),
      flipped: [],
      matchedPairIds: [],
      mistakes: 0,
      moves: 0,
      isGameActive: true,
    };
  });

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isGameActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isGameActive]);

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  const handleFlip = (index: number) => {
    if (isProcessing) return;
    if (state.flipped.includes(index)) return;
    if (state.matchedPairIds.includes(state.cards[index].pairId)) return;

    const newFlipped = [...state.flipped, index];
    
    if (newFlipped.length === 1) {
      setState(s => ({ ...s, flipped: newFlipped }));
      return;
    }

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const card1 = state.cards[first];
      const card2 = state.cards[second];
      
      const nextMoves = state.moves + 1;
      setState(s => ({ ...s, flipped: newFlipped, moves: nextMoves }));
      setIsProcessing(true);

      if (card1.pairId === card2.pairId) {
        // Match!
        setTimeout(() => {
          const nextMatched = [...state.matchedPairIds, card1.pairId];
          const isComplete = nextMatched.length === pairs.length;
          
          setState(s => ({
            ...s,
            matchedPairIds: nextMatched,
            flipped: [],
            isGameActive: !isComplete,
          }));

          if (isComplete) {
            onComplete({
              score: Math.max(0, 100 - state.mistakes * 10),
              correctCount: pairs.length,
              wrongCount: state.mistakes,
              moveCount: nextMoves,
              answerData: { mode: 'MEMORY', pairs: pairs.length },
            });
          }
          
          setIsProcessing(false);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setState(s => ({
            ...s,
            flipped: [],
            mistakes: s.mistakes + 1,
          }));
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const progress = Math.round((state.matchedPairIds.length / pairs.length) * 100);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto px-2 py-2 sm:py-4 relative z-10 h-full max-h-[85vh]">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-4 shrink-0">
        <h1 className="text-xl sm:text-3xl font-black text-[#215b3b] font-heading drop-shadow-sm text-center md:text-left flex-1 line-clamp-1">
          Memory Grove
        </h1>
        
        <div className="flex items-center gap-3 sm:gap-6 w-full md:w-auto">
          <div className="bg-[#d4ebd0] text-[#215b3b] font-bold text-sm sm:text-xl px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-2 shadow-sm whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(seconds)}
          </div>

          <div className="relative flex items-center">
            <div className="w-[120px] sm:w-[260px]">
              <BambooProgressBar 
                progress={progress} 
                label={`${state.matchedPairIds.length}/${pairs.length} Cặp`}
                className="!h-[50px] sm:!h-[80px]"
                hidePanda={true}
                labelClassName="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] sm:text-sm text-[#215b3b] bg-white/70 px-1 py-0.5 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center content-center items-center gap-2 sm:gap-3 md:gap-4 w-full flex-1">
        {state.cards.map((card, index) => {
          const isFlipped = state.flipped.includes(index) || state.matchedPairIds.includes(card.pairId);
          const isMatched = state.matchedPairIds.includes(card.pairId);
          // Adjust font size based on text length
          const textClass = card.content.length > 5 ? 'text-sm sm:text-lg' : 'text-3xl sm:text-4xl';

          return (
            <div 
              key={card.id}
              onClick={() => handleFlip(index)}
              className="w-[72px] h-[88px] sm:w-[96px] sm:h-[112px] md:w-[112px] md:h-[132px] lg:w-[120px] lg:h-[144px] perspective-1000 cursor-pointer group"
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Back (Face down) */}
                <div className={`absolute inset-0 backface-hidden bg-[#aadd4a] rounded-xl sm:rounded-2xl shadow-md border-2 sm:border-4 border-white flex items-center justify-center transition-transform group-hover:-translate-y-1 ${isFlipped ? 'pointer-events-none' : ''}`}>
                  <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 sm:border-4 border-white/50 rounded-full flex items-center justify-center">
                    <span className="text-white/80 font-bold text-xl sm:text-2xl">?</span>
                  </div>
                </div>

                {/* Front (Face up) */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl sm:rounded-2xl shadow-md flex items-center justify-center ${textClass} font-bold text-center p-1 sm:p-2 ${isMatched ? 'border-2 sm:border-4 border-[#8BC34A] text-[#8BC34A] opacity-60 scale-95' : 'border-2 sm:border-4 border-[#eef7e9] text-[#215b3b]'}`}>
                  <span className="line-clamp-2">{card.content}</span>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MemoryGameContent({ searchParams }: { searchParams: URLSearchParams }) {
  const router = useRouter();
  const mode = searchParams.get('mode');
  const id = searchParams.get('lesson');

  let sourceType: SourceType = 'LESSON';
  if (mode === 'hsk') sourceType = 'LEVEL';
  else if (mode === 'topic') sourceType = 'TOPIC';

  const engine = usePracticeEngine<MemoryState>({
    practiceType: 'MEMORY_GAME',
    sourceType,
    sourceId: id || '',
    sessionKey: `practice:MEMORY_GAME:${sourceType}:${id}`,
  });

  if (engine.status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <PageLoading label="Đang tải dữ liệu trò chơi..." />
      </div>
    );
  }

  if (engine.status === 'error' && engine.error) {
    return <ErrorState message={engine.error ?? 'Có lỗi xảy ra'} onRetry={() => window.location.reload()} />;
  }

  if (engine.status === 'finished' && engine.result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[60vh]">
        <GameSummary
          title="Tuyệt vời! 🎉"
          subtitle="Hoàn thành Lật thẻ (Memory Game)"
          result={engine.result}
          elapsed={engine.elapsed}
          onReplay={() => window.location.reload()}
          onExit={() => router.back()}
        />
      </div>
    );
  }

  if (!engine.items.length) return null;

  return (
    <MemoryGameBoard 
      items={engine.items}
      initialState={engine.modeState}
      onStateChange={engine.setModeState}
      onComplete={engine.handleComplete}
    />
  );
}

export function MemoryGameFeature() {
  const searchParams = useSearchParams();
  return (
    <Suspense fallback={<PageLoading label="Đang tải..." />}>
      <MemoryGameContent searchParams={searchParams} />
    </Suspense>
  );
}
