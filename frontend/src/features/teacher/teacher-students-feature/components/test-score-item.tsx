import type { TestAttemptSummary } from '../types';
import { formatDate, formatScore, getScoreColor, getScoreBg } from '../utils';

export function TestScoreItem({ attempt }: { attempt: TestAttemptSummary }) {
  const scoreColor = getScoreColor(attempt.score);
  const scoreBg = getScoreBg(attempt.score);
  const isPassed = attempt.score >= 60;

  return (
    <div className={`flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0 ${scoreBg} rounded-lg px-3 -mx-3`}>
      <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isPassed ? 'bg-[#f0fdf4]' : 'bg-[#fff4f4]'}`}>
        {isPassed ? (
          <svg className="h-4 w-4 text-[#78993a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-[#e55353]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-gray-700 truncate">{attempt.testName || `Bài kiểm tra #${attempt.testId.slice(0, 8)}`}</div>
        <div className="text-[11px] text-gray-400">{formatDate(attempt.startedAt)}</div>
      </div>
      <div className={`text-[14px] font-extrabold shrink-0 ${scoreColor}`}>{formatScore(attempt.score)}</div>
    </div>
  );
}
