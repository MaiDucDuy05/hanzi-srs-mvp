import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { GameSummary } from './game-summary';

afterEach(cleanup);

// Mock useTranslations
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      summaryExcellent: 'Xuất sắc! 🎉',
      summaryGood: 'Khá tốt! 👍',
      summaryTryHarder: 'Cố gắng hơn nhé! 💪',
      summaryNeedsPractice: 'Cần luyện tập thêm! 📚',
      summaryCorrect: 'ĐÚNG',
      summaryWrong: 'SAI',
      summaryTime: 'THỜI GIAN',
      summaryPlayAgain: 'Chơi lại',
      summaryMenu: 'Về menu',
    };
    return map[key] || key;
  },
}));

describe('GameSummary Component', () => {
  it('tự động chuẩn hóa điểm thô (1 ĐÚNG, 0 SAI, score=1) thành 100%, 3 sao và Xuất sắc!', () => {
    render(
      <GameSummary
        result={{
          correctCount: 1,
          wrongCount: 0,
          moveCount: 0,
          score: 1, // raw score from backend
          answerData: {},
        }}
        elapsed={6}
        onExit={vi.fn()}
      />
    );

    // Tiêu đề tự động tính phải là Xuất sắc! 🎉
    expect(screen.getByText('Xuất sắc! 🎉')).toBeDefined();
    // Tỷ lệ phải là 100%
    expect(screen.getByText('100')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined(); // 1 Đúng
    expect(screen.getByText('0')).toBeDefined(); // 0 Sai
  });

  it('hiển thị 2 sao và Khá tốt! 👍 khi đạt 60%', () => {
    render(
      <GameSummary
        result={{
          correctCount: 3,
          wrongCount: 2,
          moveCount: 0,
          score: 60,
          answerData: {},
        }}
        elapsed={15}
        onExit={vi.fn()}
      />
    );

    expect(screen.getByText('Khá tốt! 👍')).toBeDefined();
    expect(screen.getByText('60')).toBeDefined();
  });

  it('hiển thị 1 sao và Cố gắng hơn nhé! 💪 khi đạt 25%', () => {
    render(
      <GameSummary
        result={{
          correctCount: 1,
          wrongCount: 3,
          moveCount: 0,
          score: 25,
          answerData: {},
        }}
        elapsed={20}
        onExit={vi.fn()}
      />
    );

    expect(screen.getByText('Cố gắng hơn nhé! 💪')).toBeDefined();
    expect(screen.getByText('25')).toBeDefined();
  });

  it('hiển thị 0 sao và Cần luyện tập thêm! 📚 khi đạt 0%', () => {
    render(
      <GameSummary
        result={{
          correctCount: 0,
          wrongCount: 4,
          moveCount: 0,
          score: 0,
          answerData: {},
        }}
        elapsed={10}
        onExit={vi.fn()}
      />
    );

    expect(screen.getByText('Cần luyện tập thêm! 📚')).toBeDefined();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
  });
});
