'use client';

import React, { useState } from 'react';

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

export default function MatchGame() {
  const [tiles] = useState(INITIAL_TILES);
  const [selected, setSelected] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  const handleSelect = (index: number) => {
    if (selected.length === 2 || matched.includes(index) || selected.includes(index)) return;
    
    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (tiles[first].pairId === tiles[second].pairId) {
        setTimeout(() => {
          setMatched(prev => [...prev, first, second]);
          setSelected([]);
        }, 500);
      } else {
        setTimeout(() => setSelected([]), 800);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full">
      <h1 className="text-3xl font-black text-[#215b3b] font-heading mb-8">Match Challenge</h1>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 w-full max-w-2xl">
        {tiles.map((tile, index) => {
          const isSelected = selected.includes(index);
          const isMatched = matched.includes(index);
          
          return (
            <div 
              key={tile.id}
              onClick={() => handleSelect(index)}
              className={`
                aspect-square rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-bold cursor-pointer transition-all duration-300
                ${isMatched ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}
                ${isSelected 
                  ? 'bg-[#8BC34A] text-white shadow-inner scale-95 border-4 border-[#7CB342]' 
                  : 'bg-white text-[#215b3b] shadow-md hover:shadow-lg hover:-translate-y-1 border-4 border-transparent hover:border-[#eef7e9]'
                }
              `}
            >
              {tile.content}
            </div>
          );
        })}
      </div>

      {matched.length === tiles.length && (
        <div className="mt-12 text-3xl font-black text-[#8BC34A] animate-bounce bg-white px-8 py-4 rounded-full shadow-lg border-4 border-[#eef7e9]">
          Perfect Match! 🎉
        </div>
      )}
    </div>
  );
}
