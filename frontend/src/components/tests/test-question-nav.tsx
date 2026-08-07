'use client';

import { cn } from '@/lib/utils/cn';

/**
 * Thanh điều hướng câu hỏi (P2-6): bấm số để nhảy câu, đánh dấu câu đã trả lời.
 */
export function TestQuestionNav({
  count,
  current,
  answered,
  onSelect,
}: {
  count: number;
  current: number;
  answered: (index: number) => boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={cn(
            'h-8 w-8 rounded-md text-xs font-medium',
            i === current
              ? 'bg-brand text-white'
              : answered(i)
                ? 'bg-green-100 text-green-700  '
                : 'bg-gray-100 text-gray-600  ',
          )}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
