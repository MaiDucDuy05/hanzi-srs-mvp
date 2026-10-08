import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SentenceOrderingMode } from './sentence-ordering-mode';
import type { SentenceQuestion } from '@/lib/api/types';

afterEach(cleanup);

describe('SentenceOrderingMode', () => {
  const sampleQuestion: SentenceQuestion = {
    questionId: 'q-1',
    tokens: [
      { id: 't1', text: '我' },
      { id: 't2', text: '昨天' },
      { id: 't3', text: '在' },
      { id: 't4', text: '图书馆' },
      { id: 't5', text: '看' },
      { id: 't6', text: '了' },
      { id: 't7', text: '一' },
      { id: 't8', text: '本' },
      { id: 't9', text: '书' },
    ],
    translation: 'Hôm qua tôi đã đọc một cuốn sách ở thư viện.',
    explanation: 'Cấu trúc S + Time + Place + V + O.',
  };

  it('renders question and tokens for a long sentence (> 7 tokens)', () => {
    const onAnswersChange = vi.fn();
    const onComplete = vi.fn();

    render(
      <SentenceOrderingMode
        questions={[sampleQuestion]}
        onAnswersChange={onAnswersChange}
        onComplete={onComplete}
      />
    );

    expect(screen.getByText('Hôm qua tôi đã đọc một cuốn sách ở thư viện.')).toBeDefined();
    expect(screen.getByText('我')).toBeDefined();
    expect(screen.getByText('图书馆')).toBeDefined();
    expect(screen.getByText('Chạm từ bên dưới để ghép câu')).toBeDefined();
  });

  it('allows picking, moving, and resetting tokens', () => {
    const onAnswersChange = vi.fn();
    const onComplete = vi.fn();

    render(
      <SentenceOrderingMode
        questions={[sampleQuestion]}
        onAnswersChange={onAnswersChange}
        onComplete={onComplete}
      />
    );

    // Pick first token
    fireEvent.click(screen.getByText('我'));
    expect(onAnswersChange).toHaveBeenCalled();

    // Pick second token
    fireEvent.click(screen.getByText('昨天'));

    // Check missing token counter appears
    expect(screen.getByText('7 từ còn thiếu')).toBeDefined();

    // Check reset button appears
    const resetButton = screen.getByText('Đặt lại');
    expect(resetButton).toBeDefined();

    // Click reset button
    fireEvent.click(resetButton);
    expect(screen.getByText('Chạm từ bên dưới để ghép câu')).toBeDefined();
  });
});
