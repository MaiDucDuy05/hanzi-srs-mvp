'use client';

import React, { useState } from 'react';

const WORDS = [
  { id: 1, text: '我' },
  { id: 2, text: '喜' },
  { id: 3, text: '欢' },
  { id: 4, text: '喝' },
  { id: 5, text: '茶' },
].sort(() => Math.random() - 0.5);

export default function SentenceGame() {
  const [available, setAvailable] = useState(WORDS);
  const [selected, setSelected] = useState<{ id: number, text: string }[]>([]);

  const handleSelect = (word: { id: number, text: string }) => {
    setAvailable(available.filter(w => w.id !== word.id));
    setSelected([...selected, word]);
  };

  const handleDeselect = (word: { id: number, text: string }) => {
    setSelected(selected.filter(w => w.id !== word.id));
    setAvailable([...available, word].sort((a, b) => a.id - b.id));
  };

  const isComplete = available.length === 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full">
      <h1 className="text-3xl font-black text-[#215b3b] font-heading mb-4">Sentence Forest</h1>
      <p className="text-xl text-[#4a6b38] mb-12 font-medium">"I like drinking tea"</p>
      
      {/* Drop Zone */}
      <div className="w-full max-w-2xl min-h-[100px] bg-white rounded-3xl border-4 border-dashed border-[#8BC34A] p-4 flex flex-wrap gap-2 items-center justify-center mb-12 transition-all">
        {selected.length === 0 && (
          <span className="text-gray-400 font-medium">Select words below to build the sentence</span>
        )}
        {selected.map((word) => (
          <div 
            key={word.id}
            onClick={() => handleDeselect(word)}
            className="px-6 py-3 bg-[#aadd4a] text-white text-2xl font-bold rounded-2xl cursor-pointer hover:bg-[#97cf34] shadow-sm transform hover:-translate-y-1 transition-all"
          >
            {word.text}
          </div>
        ))}
      </div>

      {/* Available Words */}
      <div className="flex flex-wrap gap-4 items-center justify-center max-w-2xl min-h-[60px]">
        {available.map((word) => (
          <div 
            key={word.id}
            onClick={() => handleSelect(word)}
            className="px-6 py-3 bg-white border-4 border-[#eef7e9] text-[#215b3b] text-2xl font-bold rounded-2xl cursor-pointer hover:border-[#8BC34A] hover:bg-[#f9fdf5] shadow-sm transform hover:-translate-y-1 transition-all"
          >
            {word.text}
          </div>
        ))}
      </div>

      <div className="mt-12 h-16">
        {isComplete && (
          <button className="px-10 py-4 bg-[#215b3b] text-white text-xl font-bold rounded-full shadow-lg hover:bg-[#1a4a2f] transition-colors animate-bounce">
            Check Answer
          </button>
        )}
      </div>
    </div>
  );
}
