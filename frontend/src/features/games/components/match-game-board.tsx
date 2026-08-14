'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MatchTile } from './match-game-tile';
import { BambooProgressBar } from '@/features/ui/components/bamboo-progress-bar';
import { computeScore, shuffle, type ModeResult, type QuestionItem } from '@/features/practice/components/practice-models';

export interface MatchingState {
  tiles: Tile[];
  selectedIndexes: number[];
  matchedPairIds: string[];
  correct: number;
  wrong: number;
  moves: number;
  isGameActive: boolean;
}

export interface Tile {
  id: number;
  content: string;
  pairId: string;
  type: 'hanzi' | 'pinyin';
}

function pickPairs(items: QuestionItem[]): QuestionItem[] {
  return shuffle(items).slice(0, Math.min(12, Math.max(4, items.length)));
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

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

interface MatchBoardProps {
  items: QuestionItem[];
  initialState: MatchingState | null;
  onStateChange: (state: MatchingState) => void;
  onComplete: (result: ModeResult) => void;
}

export function MatchBoard({ items, initialState, onStateChange, onComplete }: MatchBoardProps) {
  const pairs = useMemo(() => pickPairs(items), [items]);

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
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
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
      const nextMatched = isMatch ? [...state.matchedPairIds, firstTile.pairId] : state.matchedPairIds;
      const isComplete = nextMatched.length === pairs.length;

      setState(prev => ({ ...prev, selectedIndexes: newSelected }));

      setTimeout(() => {
        const nextState: MatchingState = {
          ...state, selectedIndexes: [], matchedPairIds: nextMatched,
          moves: nextMoves, correct: nextCorrect, wrong: nextWrong,
          isGameActive: !isComplete,
        };
        if (isComplete) {
          onComplete({
            correctCount: nextCorrect, wrongCount: nextWrong, moveCount: nextMoves,
            score: computeScore(nextCorrect, pairs.length),
            answerData: { matchedPairs: nextCorrect, totalPairs: pairs.length },
          });
        } else {
          update(nextState);
        }
      }, isMatch ? 500 : 800);
    } else {
      update({ ...state, selectedIndexes: newSelected });
    }
  };

  const totalPairs = pairs.length;
  const matchedPairs = state.matchedPairIds.length;
  const progressPct = totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto px-2 py-2 sm:py-4 relative z-10 h-full max-h-[85vh]">
      {/* Header */}
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
          <div className="w-[120px] sm:w-[260px]">
            <BambooProgressBar
              progress={progressPct}
              label={`${matchedPairs}/${totalPairs} Pairs`}
              className="!h-[50px] sm:!h-[80px]"
              hidePanda={true}
              labelClassName="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] sm:text-sm text-[#215b3b] bg-white/70 px-1 py-0.5 rounded"
            />
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex flex-wrap justify-center content-center items-center gap-2 sm:gap-3 md:gap-4 w-full flex-1">
        {state.tiles.map((tile, index) => (
          <MatchTile
            key={tile.id}
            tile={tile}
            isSelected={state.selectedIndexes.includes(index)}
            isMatched={state.matchedPairIds.includes(tile.pairId)}
            onClick={() => handleSelect(index)}
            totalTiles={state.tiles.length}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-2 sm:mt-6 h-12 flex items-center justify-center shrink-0">
        {!state.isGameActive ? (
          <div className="text-base sm:text-2xl font-black text-[#8BC34A] bg-white px-6 py-2 sm:py-3 rounded-full shadow-lg border-4 border-[#eef7e9] flex items-center gap-3">
            <span>🎉 Hoàn thành! Đang nộp bài...</span>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-[#4a6b38] font-bold shadow-sm border border-[#eef7e9] text-xs sm:text-base text-center">
            Match Hán tự với Pinyin
          </div>
        )}
      </div>
    </div>
  );
}
