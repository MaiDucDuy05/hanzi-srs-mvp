import React from 'react';
import type { GrammarPoint } from '@/lib/api/types';

interface StudyLessonGrammarListProps {
  grammarPoints: GrammarPoint[];
}

export function StudyLessonGrammarList({ grammarPoints }: StudyLessonGrammarListProps) {
  return (
    <div className="flex flex-col gap-4">
      {grammarPoints.map((item) => (
        <div key={item.id} className="w-full bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-6 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-col items-start gap-2 mb-3">
              <h3 className="text-2xl font-black text-[#215b3b]">
                {item.title}
              </h3>
              {item.structure && (
                <div className="text-lg font-bold text-[#8BC34A] bg-[#f9fdf5] px-3 py-1 rounded-lg border border-[#e5f5eb]">
                  {item.structure}
                </div>
              )}
            </div>
            <p className="text-gray-600 font-medium">{item.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
