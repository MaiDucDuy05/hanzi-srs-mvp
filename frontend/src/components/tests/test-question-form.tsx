'use client';

import type { TestQuestion } from '@/lib/api/types';
import { Input } from '@/components/ui/form';
import { cn } from '@/lib/utils/cn';

/**
 * Form hiển thị một câu hỏi kiểm tra + nhận đáp án.
 * - SINGLE_CHOICE / TRUE_FALSE: options.list, chọn 1 → { answer: string|boolean }
 * - SHORT_ANSWER: ô nhập → { answer: string }
 */
export function TestQuestionForm({
  question,
  value,
  onChange,
}: {
  question: TestQuestion;
  value: unknown;
  onChange: (answer: unknown) => void;
}) {
  const options = question.options && typeof question.options === 'object'
    ? ((question.options as { list?: unknown[] }).list ?? [])
    : [];

  if (question.questionType === 'SHORT_ANSWER') {
    return (
      <Input
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập câu trả lời..."
        className="max-w-md"
      />
    );
  }

  const isBoolean = question.questionType === 'TRUE_FALSE';
  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const label = String(opt);
        const selected = value === (isBoolean ? (label === 'true') : label) || value === label;
        return (
          <button
            key={i}
            onClick={() => onChange(isBoolean ? label === 'true' : label)}
            className={cn(
              'block w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors',
              selected
                ? 'border-brand bg-brand-light text-brand '
                : 'border-gray-200 bg-white hover:border-brand  ',
            )}
          >
            {String.fromCharCode(65 + i)}. {label}
          </button>
        );
      })}
    </div>
  );
}
