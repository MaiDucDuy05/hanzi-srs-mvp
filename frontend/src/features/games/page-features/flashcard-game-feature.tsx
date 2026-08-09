'use client';

import React, { useState } from 'react';

export function FlashcardGameFeature() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full relative h-full">
      <h1 className="text-3xl font-black text-[#215b3b] font-heading mb-8">Flashcard Mastery</h1>
      <div className="w-full max-w-sm aspect-[3/4] perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 border-4 border-[#eef7e9]">
            <span className="text-9xl font-black text-[#215b3b] mb-4 drop-shadow-sm">学</span>
            <span className="text-gray-400 font-medium">Click to flip</span>
          </div>
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 border-4 border-[#8BC34A]">
            <span className="text-6xl font-bold text-[#4a6b38] mb-4">xué</span>
            <span className="text-2xl text-gray-600 mb-12 text-center">to study; to learn</span>
            <button className="p-5 rounded-full bg-[#eef7e9] text-[#215b3b] hover:bg-[#dffce8] transition-colors shadow-sm" onClick={(e) => e.stopPropagation()}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            </button>
          </div>
        </div>
      </div>
      <div className={`mt-12 flex gap-4 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {['Hard', 'Good', 'Easy'].map((label) => (
          <button key={label} onClick={() => setIsFlipped(false)} className={`px-8 py-3 rounded-2xl font-bold transition-colors shadow-sm text-lg ${label === 'Hard' ? 'bg-red-100 text-red-600 hover:bg-red-200' : label === 'Good' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>{label}</button>
        ))}
      </div>
    </div>
  );
}
