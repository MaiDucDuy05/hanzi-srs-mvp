'use client';

import React from 'react';
import { GrammarPoint } from '@/lib/api/types';

interface GrammarIntroStepProps {
  grammar: GrammarPoint;
  onNext: () => void;
}

export function GrammarIntroStep({ grammar, onNext }: GrammarIntroStepProps) {
  return (
    <div className="flex flex-col h-full justify-between items-center text-center animate-in fade-in zoom-in-95 duration-300 relative">
      <div className="flex-1 flex flex-col justify-center max-w-2xl w-full">
        <div className="mb-4">
          <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold tracking-widest uppercase">
            Điểm ngữ pháp mới
          </span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-black text-[#1a4a2b] mb-6 leading-tight">
          {grammar.title}
        </h2>
        
        {grammar.structure && (
          <div className="mb-8 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Cấu trúc</h3>
            <p className="text-2xl font-bold text-gray-800 font-sans tracking-wide text-[#215b3b]">
              {grammar.structure}
            </p>
          </div>
        )}
        
        <div className="text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Giải thích</h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            {grammar.explanation}
          </p>
        </div>
      </div>
      
      <div className="w-full mt-8">
        <button
          onClick={onNext}
          className="w-full sm:w-auto px-16 py-4 bg-[#8BC34A] hover:bg-[#7CB342] text-white font-bold rounded-2xl text-lg shadow-[0_8px_30px_rgb(139,195,74,0.3)] transition-all hover:scale-105 active:scale-95 mx-auto block"
        >
          Xem ví dụ
        </button>
      </div>
    </div>
  );
}
