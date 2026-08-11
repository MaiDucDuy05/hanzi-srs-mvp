'use client';

import React, { useState } from 'react';

const OPTIONS = [
  { id: 1, text: 'Hello', correct: false },
  { id: 2, text: 'To study', correct: true },
  { id: 3, text: 'Cat', correct: false },
  { id: 4, text: 'Apple', correct: false },
].sort(() => Math.random() - 0.5);

export function ListeningGameFeature() {
  const [selected, setSelected] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 1500); // Mock playing
  };

  const handleSelect = (id: number) => {
    setSelected(id);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-6 sm:py-8 relative z-10 h-full">
      <h1 className="text-3xl font-black text-[#215b3b] font-heading mb-4 drop-shadow-sm">Listening Bird</h1>
      <p className="text-lg text-[#4a6b38] mb-12 font-medium">Listen and choose the correct meaning</p>
      
      {/* Audio Button */}
      <button 
        onClick={handlePlay}
        className={`w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center border-8 transition-all duration-300 mb-12
          ${isPlaying ? 'border-[#aadd4a] scale-110' : 'border-[#eef7e9] hover:border-[#dffce8] hover:scale-105'}
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 text-[#215b3b] ${isPlaying ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </button>

      {/* Multiple Choice Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = opt.correct;
          let buttonClass = 'bg-white text-[#215b3b] border-transparent hover:border-[#eef7e9]';
          
          if (selected !== null) {
            if (isSelected) {
              buttonClass = isCorrect ? 'bg-[#aadd4a] text-white border-[#8bc34a]' : 'bg-red-500 text-white border-red-600';
            } else if (isCorrect) {
              buttonClass = 'bg-[#aadd4a] text-white border-[#8bc34a] opacity-50'; // Show correct answer when wrong
            } else {
              buttonClass = 'bg-white text-[#215b3b] opacity-50'; // Dim others
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={selected !== null}
              className={`py-4 px-6 rounded-2xl text-xl font-bold transition-all transform hover:-translate-y-1 shadow-sm border-4 ${buttonClass}`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      <div className="mt-12 h-16 flex items-center justify-center">
        {selected && (
          <button 
            onClick={() => setSelected(null)}
            className="px-10 py-4 bg-[#215b3b] text-white text-xl font-bold rounded-full shadow-lg hover:bg-[#1a4a2f] transition-colors animate-bounce"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}
