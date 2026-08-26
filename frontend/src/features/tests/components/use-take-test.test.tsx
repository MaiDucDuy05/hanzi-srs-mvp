import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

vi.mock('@/lib/api/endpoints', () => ({
  testApi: {
    get: vi.fn(),
    listQuestions: vi.fn(),
    startAttempt: vi.fn(),
    submitAnswer: vi.fn(),
    submitAttempt: vi.fn(),
    listAnswers: vi.fn(),
  },
}));

import { testApi } from '@/lib/api/endpoints';
import { useTakeTest } from './use-take-test';

describe('useTakeTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('load test + questions thành công → info phase', async () => {
    (testApi.get as any).mockResolvedValue({
      id: 't1',
      name: 'Test',
      timeLimitMinutes: 30,
      attemptLimit: 1,
    });
    (testApi.listQuestions as any).mockResolvedValue([
      { id: 'q1', displayOrder: 2, points: 5 },
      { id: 'q2', displayOrder: 1, points: 5 },
    ]);

    const { result } = renderHook(() => useTakeTest('t1'));

    await waitFor(() => expect(result.current.phase).toBe('info'));
    expect(result.current.test?.id).toBe('t1');
    // Sort theo displayOrder
    expect(result.current.questions[0].id).toBe('q2');
    expect(result.current.questions[1].id).toBe('q1');
  });

  it('load fail → error phase + message', async () => {
    (testApi.get as any).mockRejectedValue(new Error('404'));

    const { result } = renderHook(() => useTakeTest('t1'));

    await waitFor(() => expect(result.current.phase).toBe('error'));
    expect(result.current.error).toBe('404');
  });

  it('start → running phase + attemptId', async () => {
    (testApi.get as any).mockResolvedValue({
      id: 't1',
      timeLimitMinutes: 30,
    });
    (testApi.listQuestions as any).mockResolvedValue([]);
    (testApi.startAttempt as any).mockResolvedValue({ id: 'a1' });

    const { result } = renderHook(() => useTakeTest('t1'));
    await waitFor(() => expect(result.current.phase).toBe('info'));

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.phase).toBe('running');
    expect(result.current.attemptId).toBe('a1');
  });

  it('setAnswer lưu vào answers map', async () => {
    (testApi.get as any).mockResolvedValue({ id: 't1', timeLimitMinutes: 0 });
    (testApi.listQuestions as any).mockResolvedValue([
      { id: 'q1', displayOrder: 1, points: 5 },
    ]);

    const { result } = renderHook(() => useTakeTest('t1'));
    await waitFor(() => expect(result.current.phase).toBe('info'));

    act(() => {
      result.current.setAnswer('q1', { selected: 'a' });
    });

    expect(result.current.answers['q1']).toEqual({ selected: 'a' });
  });

  it('submit gọi submitAnswer cho từng câu + submitAttempt + finished', async () => {
    (testApi.get as any).mockResolvedValue({ id: 't1', timeLimitMinutes: 0 });
    (testApi.listQuestions as any).mockResolvedValue([
      { id: 'q1', displayOrder: 1, points: 10 },
      { id: 'q2', displayOrder: 2, points: 5 },
    ]);
    (testApi.startAttempt as any).mockResolvedValue({ id: 'a1' });
    (testApi.submitAnswer as any).mockResolvedValue({});
    (testApi.submitAttempt as any).mockResolvedValue({ score: 75 });
    (testApi.listAnswers as any).mockResolvedValue([
      { isCorrect: true, pointsAwarded: 10 },
      { isCorrect: false, pointsAwarded: 0 },
    ]);

    const { result } = renderHook(() => useTakeTest('t1'));
    await waitFor(() => expect(result.current.phase).toBe('info'));

    await act(async () => {
      await result.current.start();
    });

    act(() => {
      result.current.setAnswer('q1', 'A');
      result.current.setAnswer('q2', 'B');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(testApi.submitAnswer).toHaveBeenCalledTimes(2);
    expect(testApi.submitAttempt).toHaveBeenCalled();
    expect(result.current.phase).toBe('finished');
    expect(result.current.result).toMatchObject({
      score: 75,
      correct: 1,
      totalQuestions: 2,
      pointsEarned: 10,
      totalPoints: 15,
    });
  });

  it('submit fail → error phase', async () => {
    (testApi.get as any).mockResolvedValue({ id: 't1', timeLimitMinutes: 0 });
    (testApi.listQuestions as any).mockResolvedValue([
      { id: 'q1', displayOrder: 1, points: 5 },
    ]);
    (testApi.startAttempt as any).mockResolvedValue({ id: 'a1' });
    (testApi.submitAttempt as any).mockRejectedValue(new Error('submit-fail'));

    const { result } = renderHook(() => useTakeTest('t1'));
    await waitFor(() => expect(result.current.phase).toBe('info'));

    await act(async () => {
      await result.current.start();
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.phase).toBe('error');
    expect(result.current.error).toBe('submit-fail');
  });

  it('setCurrent chuyển câu hỏi', async () => {
    (testApi.get as any).mockResolvedValue({ id: 't1', timeLimitMinutes: 0 });
    (testApi.listQuestions as any).mockResolvedValue([
      { id: 'q1', displayOrder: 1, points: 5 },
      { id: 'q2', displayOrder: 2, points: 5 },
    ]);

    const { result } = renderHook(() => useTakeTest('t1'));
    await waitFor(() => expect(result.current.phase).toBe('info'));

    act(() => {
      result.current.setCurrent(1);
    });

    expect(result.current.current).toBe(1);
  });
});
