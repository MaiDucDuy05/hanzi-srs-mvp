'use client';

import React, { useState, useEffect } from 'react';
import { BambooProgressBar } from '@/features/ui/components/bamboo-progress-bar';

const INITIAL_TILES = [
  { id: 1, content: '学', pairId: 'xue' },
  { id: 2, content: 'xué', pairId: 'xue' },
  { id: 3, content: '猫', pairId: 'mao' },
  { id: 4, content: 'māo', pairId: 'mao' },
  { id: 5, content: '狗', pairId: 'gou' },
  { id: 6, content: 'gǒu', pairId: 'gou' },
  { id: 7, content: '鸟', pairId: 'niao' },
  { id: 8, content: 'niǎo', pairId: 'niao' },
  { id: 9, content: '鱼', pairId: 'yu' },
  { id: 10, content: 'yú', pairId: 'yu' },
  { id: 11, content: '牛', pairId: 'niu' },
  { id: 12, content: 'niú', pairId: 'niu' },
].sort(() => Math.random() - 0.5);

export function MatchGameFeature() {
  const [tiles] = useState(INITIAL_TILES);
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive]);

  const handleSelect = (index: number) => {
    if (selected.length === 2 || matched.includes(index) || selected.includes(index)) return;
    
    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (tiles[first].pairId === tiles[second].pairId) {
        setTimeout(() => {
          setMatched(prev => {
            const newMatched = [...prev, first, second];
            // Stop timer if won
            if (newMatched.length === tiles.length) {
              setIsGameActive(false);
            }
            return newMatched;
          });
          setSelected([]);
        }, 500);
      } else {
        setTimeout(() => setSelected([]), 800);
      }
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalPairs = tiles.length / 2;
  const matchedPairs = matched.length / 2;
  const progressPercent = (matchedPairs / totalPairs) * 100;

  return (
    <div className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 relative z-10 h-full">
      
      {/* Header Area */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#215b3b] font-heading drop-shadow-sm text-center md:text-left flex-1">
          Panda Forest Match Game
        </h1>
        
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto pr-8">
          {/* Timer */}
          <div className="bg-[#d4ebd0] text-[#215b3b] font-bold text-lg sm:text-xl px-4 py-2 rounded-full flex items-center gap-2 shadow-sm whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(seconds)}
          </div>

          {/* Progress Bar & Decorative Panda */}
          <div className="relative flex items-center">
            <div className="w-[180px] sm:w-[260px]">
              <BambooProgressBar 
                progress={progressPercent} 
                label={`${matchedPairs}/${totalPairs} Matches`}
                className="!h-[80px]"
                hidePanda={true}
                labelClassName="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-[#215b3b] bg-white/70"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Grid Area */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 w-full flex-1 content-center">
        {tiles.map((tile, index) => {
          const isSelected = selected.includes(index);
          const isMatched = matched.includes(index);
          
          return (
            <div 
              key={tile.id}
              onClick={() => handleSelect(index)}
              className={`
                relative aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                ${isMatched 
                  ? 'opacity-40 scale-95 pointer-events-none border-2 border-[#8BC34A] bg-[#f2f8ed]' 
                  : 'bg-white hover:-translate-y-1'
                }
                ${isSelected 
                  ? 'ring-4 ring-[#8BC34A] bg-[#f2f8ed] shadow-lg scale-95 border-none' 
                  : !isMatched && 'shadow-md hover:shadow-lg border-b-4 border-[#eef7e9]'
                }
              `}
            >
              <span className={`font-bold text-[#215b3b] ${tile.content.match(/^[a-zA-Z]/) ? 'text-2xl sm:text-3xl' : 'text-4xl sm:text-5xl drop-shadow-sm'}`}>
                {tile.content}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Text / Win State */}
      <div className="mt-8 sm:mt-12 h-16 flex items-center justify-center">
        {matched.length === tiles.length ? (
          <div className="text-xl sm:text-3xl font-black text-[#8BC34A] bg-white px-8 py-4 rounded-full shadow-lg border-4 border-[#eef7e9] flex items-center gap-3">
            <span>🎉 Perfect Match! You finished in {formatTime(seconds)}!</span>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full text-[#4a6b38] font-bold shadow-sm border border-[#eef7e9]">
            Match (Ghép thẻ) all pairs to win!
          </div>
        )}
      </div>
    </div>
  );
}
