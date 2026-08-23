'use client';

import React, { useState, useEffect } from 'react';
import { GrammarPoint } from '@/lib/api/types';
import { apiFetch } from '@/lib/api/client';
import { html } from 'pinyin-pro';
import { Loader2, Lightbulb } from 'lucide-react';

interface GrammarExamplesStepProps {
  grammar: GrammarPoint;
  onNext: () => void;
}

interface GrammarExample {
  zh: string;
  pinyin: string;
  vi: string;
}

export function GrammarExamplesStep({ grammar, onNext }: GrammarExamplesStepProps) {
  const [examples, setExamples] = useState<GrammarExample[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    
    apiFetch('/study/grammar-examples', {
      method: 'POST',
      body: JSON.stringify({
        title: grammar.title,
        structure: grammar.structure || '',
        explanation: grammar.explanation,
      }),
    })
      .then((data: any) => {
        if (mounted && Array.isArray(data)) {
          setExamples(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [grammar]);

  return (
    <div className="flex flex-col h-full w-full max-w-3xl animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-gray-800 mb-2">Ví dụ thực tế</h2>
        <p className="text-gray-500">Cách sử dụng "{grammar.title}" trong ngữ cảnh</p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-medium animate-pulse">AI đang tìm kiếm ví dụ hay nhất...</p>
          </div>
        ) : examples.length === 0 ? (
          <div className="text-center text-gray-500 py-10">Không thể tải ví dụ lúc này.</div>
        ) : (
          examples.map((ex, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors">
              <div 
                className="text-2xl md:text-3xl text-gray-800 tracking-wider font-serif mb-4 [&>ruby]:gap-1 [&>ruby>rt]:text-sm [&>ruby>rt]:text-gray-500 [&>ruby>rt]:font-['Tahoma','Arial','sans-serif'] [&>ruby>rt]:tracking-normal"
                dangerouslySetInnerHTML={{ __html: html(ex.zh) }}
              />
              <div className="flex items-start gap-2 pt-4 border-t border-gray-50 mt-2">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-gray-600 italic text-lg">{ex.vi}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="w-full mt-10">
        <button
          onClick={onNext}
          disabled={isLoading}
          className="w-full sm:w-auto px-16 py-4 bg-[#8BC34A] hover:bg-[#7CB342] text-white font-bold rounded-2xl text-lg shadow-[0_8px_30px_rgb(139,195,74,0.3)] transition-all hover:scale-105 active:scale-95 mx-auto block disabled:opacity-50 disabled:hover:scale-100"
        >
          Luyện tập dịch
        </button>
      </div>
    </div>
  );
}
