'use client';

import { useState } from 'react';
import type { Mistake } from '../types';
import { getFailCount, getMistakeLabel, CARD_COLORS } from '../utils';
import { MistakeDetail } from './mistake-detail';

export function MistakeCard({ mistake, index }: { mistake: Mistake; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const failCount = getFailCount(mistake);
  const label = getMistakeLabel(mistake);
  const hasDetail = mistake.questionSnapshot || mistake.userAnswer || mistake.correctAnswer || mistake.explanation;
  const colors = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <div className={`${colors.bg} rounded-xl border ${colors.border} overflow-hidden`}>
      <button
        type="button"
        onClick={() => hasDetail && setExpanded(!expanded)}
        className={`w-full text-left p-3 flex items-center gap-3 ${hasDetail ? 'cursor-pointer hover:bg-black/5' : 'cursor-default'}`}
      >
        <div className={`shrink-0 h-6 w-6 rounded-full border ${colors.border} flex items-center justify-center text-[10px] font-extrabold ${colors.text}`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className={`flex items-center gap-1.5 ${colors.text}`}>
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-semibold text-[12px] truncate">{label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {failCount > 1 && <span className="text-[10px] font-bold bg-white/70 px-1.5 py-0.5 rounded">×{failCount}</span>}
              {hasDetail && (
                <svg className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </button>
      {hasDetail && expanded && (
        <div className="px-3 pb-3">
          <MistakeDetail mistake={mistake} />
        </div>
      )}
    </div>
  );
}
