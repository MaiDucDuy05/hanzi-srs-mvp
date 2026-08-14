'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePracticeEngine } from '@/features/practice/components/practice-engine';
import {
  computeScore,
  shuffle,
  type ModeResult,
  type QuestionItem,
} from '@/features/practice/components/practice-models';
import { BambooProgressBar } from '@/features/ui/components/bamboo-progress-bar';
import { LimitScreen } from '@/features/practice/components/session-frame';
import { GameSummary } from '@/features/games/components/game-summary';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Button } from '@/features/ui/components/button';
import type { SourceType } from '@/lib/api/types';

interface Tile {
  id: number;
  content: string;
  pairId: string;
  type: 'hanzi' | 'pinyin';
}

export interface MatchingState {
  tiles: Tile[];
  selectedIndexes: number[];
  matchedPairIds: string[];
  correct: number;
  wrong: number;
  moves: number;
  isGameActive: boolean;
}

function pickPairs(items: QuestionItem[]): QuestionItem[] {
  const pool = shuffle(items);
  const n = Math.min(12, Math.max(4, pool.length));
  return pool.slice(0, n);
}

function generateTiles(pairs: QuestionItem[]): Tile[] {
  const arr: Tile[] = [];
  let tId = 1;
  for (const item of pairs) {
    arr.push({ id: tId++, content: item.hanzi, pairId: item.id, type: 'hanzi' });
    arr.push({ id: tId++, content: item.pinyin, pairId: item.id, type: 'pinyin' });
  }
  return shuffle(arr);
}

function getTileSizeClass(totalTiles: number) {
  if (totalTiles <= 8) return 'w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44'; // 4 pairs
  if (totalTiles <= 12) return 'w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36'; // 6 pairs
  if (totalTiles <= 16) return 'w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32'; // 8 pairs
  return 'w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28'; // 10-12 pairs
}

function getTextSize(content: string, type: 'hanzi' | 'pinyin', totalTiles: number) {
  const len = content.length;
  const isSmall = totalTiles > 16;
  const isMedium = totalTiles > 12 && totalTiles <= 16;

  if (type === 'hanzi') {
    if (len > 4) return isSmall ? 'text-base sm:text-lg' : 'text-lg sm:text-xl drop-shadow-sm';
    if (len > 2) return isSmall ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl drop-shadow-sm';
    return isSmall ? 'text-2xl sm:text-3xl' : isMedium ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl drop-shadow-sm';
  } else {
    // pinyin
    if (len > 8) return 'text-[10px] sm:text-xs font-bold px-1 text-center leading-tight break-words';
    if (len > 5) return isSmall ? 'text-xs sm:text-sm' : 'text-sm sm:text-base font-bold px-1 text-center';
    return isSmall ? 'text-sm sm:text-base' : 'text-lg sm:text-xl font-bold';
  }
}

function MatchGameBoard({
  items,
  initialState,
  onStateChange,
  onComplete,
}: {
  items: QuestionItem[];
  initialState: MatchingState | null;
  onStateChange: (state: MatchingState) => void;
  onComplete: (res: ModeResult) => void;
}) {
  const pairs = useMemo<QuestionItem[]>(() => pickPairs(items), [items]);

  const [state, setState] = useState<MatchingState>(
    initialState ?? {
      tiles: generateTiles(pairs),
      selectedIndexes: [],
      matchedPairIds: [],
      correct: 0,
      wrong: 0,
      moves: 0,
      isGameActive: true,
    }
  );

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

  const update = (next: MatchingState) => {
    setState(next);
    onStateChange(next);
  };

  const handleSelect = (index: number) => {
    if (!state.isGameActive) return;
    if (state.selectedIndexes.length === 2 || state.selectedIndexes.includes(index)) return;
    
    const tile = state.tiles[index];
    if (state.matchedPairIds.includes(tile.pairId)) return;

    const newSelected = [...state.selectedIndexes, index];
    
    if (newSelected.length === 2) {
      const [firstIdx, secondIdx] = newSelected;
      const firstTile = state.tiles[firstIdx];
      const secondTile = state.tiles[secondIdx];
      const isMatch = firstTile.pairId === secondTile.pairId;

      const nextMoves = state.moves + 1;
      const nextCorrect = state.correct + (isMatch ? 1 : 0);
      const nextWrong = state.wrong + (isMatch ? 0 : 1);
      const nextMatchedPairIds = isMatch ? [...state.matchedPairIds, firstTile.pairId] : state.matchedPairIds;
      const isComplete = nextMatchedPairIds.length === pairs.length;

      setState(prev => ({ ...prev, selectedIndexes: newSelected }));

      setTimeout(() => {
        const nextState: MatchingState = {
          ...state,
          selectedIndexes: [],
          matchedPairIds: nextMatchedPairIds,
          moves: nextMoves,
          correct: nextCorrect,
          wrong: nextWrong,
          isGameActive: !isComplete,
        };

        if (isComplete) {
          const result: ModeResult = {
            correctCount: nextCorrect,
            wrongCount: nextWrong,
            moveCount: nextMoves,
            score: computeScore(nextCorrect, pairs.length),
            answerData: { matchedPairs: nextCorrect, totalPairs: pairs.length },
          };
          onComplete(result);
        } else {
          update(nextState);
        }
      }, isMatch ? 500 : 800);
    } else {
      update({ ...state, selectedIndexes: newSelected });
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalPairs = pairs.length;
  const matchedPairs = state.matchedPairIds.length;
  const progressPercent = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;
  
  const tileSizeClass = getTileSizeClass(state.tiles.length);

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto px-2 py-2 sm:py-4 relative z-10 h-full max-h-[85vh]">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-4 shrink-0">
        <h1 className="text-xl sm:text-3xl font-black text-[#215b3b] font-heading drop-shadow-sm text-center md:text-left flex-1 line-clamp-1">
          Panda Match Game
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
                progress={progressPercent} 
                label={`${matchedPairs}/${totalPairs} Pairs`}
                className="!h-[50px] sm:!h-[80px]"
                hidePanda={true}
                labelClassName="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] sm:text-sm text-[#215b3b] bg-white/70 px-1 py-0.5 rounded"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center content-center items-center gap-2 sm:gap-3 md:gap-4 w-full flex-1">
        {state.tiles.map((tile, index) => {
          const isSelected = state.selectedIndexes.includes(index);
          const isMatched = state.matchedPairIds.includes(tile.pairId);
          
          return (
            <div 
              key={tile.id}
              onClick={() => handleSelect(index)}
              className={`
                relative ${tileSizeClass} rounded-xl sm:rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                ${isMatched 
                  ? 'opacity-40 scale-95 pointer-events-none border-2 border-[#8BC34A] bg-[#f2f8ed]' 
                  : 'bg-white hover:-translate-y-1'
                }
                ${isSelected 
                  ? 'ring-4 ring-[#8BC34A] bg-[#f2f8ed] shadow-lg scale-95 border-none' 
                  : !isMatched ? 'shadow-md hover:shadow-lg border-b-4 border-[#eef7e9]' : ''
                }
              `}
            >
              <span className={`text-[#215b3b] ${getTextSize(tile.content, tile.type, state.tiles.length)}`}>
                {tile.content}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 sm:mt-6 h-12 flex items-center justify-center shrink-0">
        {!state.isGameActive ? (
          <div className="text-base sm:text-2xl font-black text-[#8BC34A] bg-white px-6 py-2 sm:py-3 rounded-full shadow-lg border-4 border-[#eef7e9] flex items-center gap-3">
            <span>🎉 Hoàn thành! Đang nộp bài...</span>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-[#4a6b38] font-bold shadow-sm border border-[#eef7e9] text-xs sm:text-base text-center">
            Match (Ghép thẻ) Hán tự với Pinyin
          </div>
        )}
      </div>
    </div>
  );
}

function MatchGameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get('mode');
  const id = searchParams.get('lesson');

  if (!mode || !id) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800">Không tìm thấy bài học</h1>
          <p className="text-gray-500">
            Vui lòng chọn một bài học từ Bảng điều khiển để bắt đầu trò chơi.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/practice')}>
          Về Bảng điều khiển
        </Button>
      </div>
    );
  }

  let sourceType: SourceType = 'LESSON';
  if (mode === 'hsk') sourceType = 'LEVEL';
  else if (mode === 'topic') sourceType = 'TOPIC';

  const engine = usePracticeEngine<MatchingState>({
    practiceType: 'WORD_MATCHING',
    sourceType,
    sourceId: id,
    sessionKey: `practice:WORD_MATCHING:${sourceType}:${id}`,
  });

  if (engine.status === 'loading') {
    return <PageLoading label="Đang chuẩn bị phiên luyện tập..." />;
  }

  if (engine.status === 'limit' && engine.limit) {
    return (
      <LimitScreen
        practiceType="WORD_MATCHING"
        usedCount={engine.limit.usedCount}
        onExit={() => router.back()}
      />
    );
  }

  if (engine.status === 'error') {
    return <ErrorState message={engine.error ?? 'Có lỗi xảy ra.'} onRetry={() => router.back()} />;
  }

  if (engine.status === 'finished' && engine.result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <GameSummary
          title="Tuyệt vời! 🎉"
          subtitle="Hoàn thành Ghép thẻ (Match Game)"
          result={engine.result}
          elapsed={engine.elapsed}
          onReplay={() => window.location.reload()}
          onExit={() => router.back()}
        />
      </div>
    );
  }

  return (
    <MatchGameBoard
      items={engine.items}
      initialState={engine.modeState}
      onStateChange={engine.setModeState}
      onComplete={engine.handleComplete}
    />
  );
}

export function MatchGameFeature() {
  return (
    <Suspense fallback={<PageLoading label="Đang tải trò chơi..." />}>
      <MatchGameContent />
    </Suspense>
  );
}
