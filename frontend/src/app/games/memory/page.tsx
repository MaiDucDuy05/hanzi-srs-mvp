'use client';

import React, { useState } from 'react';

const INITIAL_CARDS = [
  { id: 1, content: '水', pairId: 'shui' },
  { id: 2, content: '水', pairId: 'shui' },
  { id: 3, content: '火', pairId: 'huo' },
  { id: 4, content: '火', pairId: 'huo' },
  { id: 5, content: '木', pairId: 'mu' },
  { id: 6, content: '木', pairId: 'mu' },
  { id: 7, content: '金', pairId: 'jin' },
  { id: 8, content: '金', pairId: 'jin' },
  { id: 9, content: '土', pairId: 'tu' },
  { id: 10, content: '土', pairId: 'tu' },
  { id: 11, content: '日', pairId: 'ri' },
  { id: 12, content: '日', pairId: 'ri' },
].sort(() => Math.random() - 0.5);

export default function MemoryGame() {
  const [cards] = useState(INITIAL_CARDS);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  const handleFlip = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].pairId === cards[second].pairId) {
        setTimeout(() => {
          setMatched(prev => [...prev, first, second]);
          setFlipped([]);
        }, 500);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full">
      <h1 className="text-3xl font-black text-[#215b3b] font-heading mb-8">Memory Grove</h1>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 w-full max-w-2xl">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          const isMatched = matched.includes(index);

          return (
            <div 
              key={card.id}
              onClick={() => handleFlip(index)}
              className="aspect-[3/4] perspective-1000 cursor-pointer group"
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* Back (Face down) */}
                <div className={`absolute inset-0 backface-hidden bg-[#aadd4a] rounded-2xl shadow-md border-4 border-white flex items-center justify-center transition-transform group-hover:-translate-y-1 ${isFlipped ? 'pointer-events-none' : ''}`}>
                  <div className="w-12 h-12 border-4 border-white/50 rounded-full flex items-center justify-center">
                    <span className="text-white/80 font-bold text-2xl">?</span>
                  </div>
                </div>

                {/* Front (Face up) */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl shadow-md flex items-center justify-center text-5xl font-bold ${isMatched ? 'border-4 border-[#8BC34A] text-[#8BC34A] opacity-60' : 'border-4 border-[#eef7e9] text-[#215b3b]'}`}>
                  {card.content}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {matched.length === cards.length && (
        <div className="mt-12 text-3xl font-black text-[#8BC34A] animate-bounce bg-white px-8 py-4 rounded-full shadow-lg border-4 border-[#eef7e9]">
          Memory Master! 🧠
        </div>
      )}
    </div>
  );
}
