import type { Mistake } from '../types';
import { extractText } from '../utils';

export function MistakeDetail({ mistake }: { mistake: Mistake }) {
  const snap = mistake.questionSnapshot as Record<string, unknown> | null;
  const userAns = extractText(mistake.userAnswer);
  const correctAns = extractText(mistake.correctAnswer);

  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-dashed border-gray-200">
      {snap && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Câu hỏi</span>
          </div>
          <div className="bg-white/70 rounded-xl p-3 text-[13px] text-gray-700 font-medium">
            {snap.hanzi ? (
              <div className="text-center py-1">
                <span className="text-2xl font-bold text-[#1f5333] block">{String(snap.hanzi)}</span>
                {!!snap.pinyin && <span className="text-[14px] text-gray-500">{String(snap.pinyin)}</span>}
                {!!snap.meaning && <span className="block text-[13px] text-gray-600 mt-1">{String(snap.meaning)}</span>}
              </div>
            ) : extractText(snap)}
          </div>
        </div>
      )}
      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg className="h-3.5 w-3.5 text-[#e55353] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[11px] font-bold text-[#e55353] uppercase tracking-wide">Trả lời sai</span>
        </div>
        <div className="bg-[#fff4f4] rounded-xl p-3 text-[13px] font-semibold text-[#e55353]">{userAns}</div>
      </div>
      {correctAns && correctAns !== '—' && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg className="h-3.5 w-3.5 text-[#78993a] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[11px] font-bold text-[#78993a] uppercase tracking-wide">Đáp án đúng</span>
          </div>
          <div className="bg-[#f0fdf4] rounded-xl p-3 text-[13px] font-semibold text-[#1f5333]">{correctAns}</div>
        </div>
      )}
      {mistake.explanation && (
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Giải thích</span>
          <div className="bg-gray-50 rounded-xl p-3 text-[12px] text-gray-600 leading-relaxed">{mistake.explanation}</div>
        </div>
      )}
    </div>
  );
}
