import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { BalloonSec, DEFAULT_BALLOON_CONFIG } from './balloon-sec';
import type { QuestionItem } from '../../practice/components/practice-models';

const items: QuestionItem[] = [
  { id: 'v1', hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'hello', audioKey: null },
  { id: 'v2', hanzi: '学习', pinyin: 'xuéxí', meaning: 'study', audioKey: null },
  { id: 'v3', hanzi: '中国', pinyin: 'zhōngguó', meaning: 'china', audioKey: null },
  { id: 'v4', hanzi: '朋友', pinyin: 'péngyǒu', meaning: 'friend', audioKey: null },
];

describe('BalloonSec', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('khởi tạo idle với 1 round từ 1 item', () => {
    const sec = new BalloonSec([items[0]]);
    expect(sec.getState().phase).toBe('idle');
    expect(sec.getState().totalRounds).toBe(1);
    expect(sec.getState().correctCount).toBe(0);
  });

  it('start chuyển sang playing', () => {
    const sec = new BalloonSec(items);
    sec.start();
    expect(sec.getState().phase).toBe('playing');
  });

  it('pick đúng option tăng correctCount', () => {
    const sec = new BalloonSec(items);
    sec.setItems(items);
    sec.start();
    const ctx = sec.getState();
    sec.pick(ctx.correctIndex);
    expect(sec.getState().correctCount).toBe(1);
    expect(sec.getState().wrongCount).toBe(0);
    expect(sec.getState().phase).toBe('feedback');
  });

  it('pick sai option tăng wrongCount', () => {
    const sec = new BalloonSec(items);
    sec.setItems(items);
    sec.start();
    const ctx = sec.getState();
    const wrongIdx = ctx.correctIndex === 0 ? 1 : 0;
    sec.pick(wrongIdx);
    expect(sec.getState().correctCount).toBe(0);
    expect(sec.getState().wrongCount).toBe(1);
  });

  it('pick trong feedback phase không làm gì', () => {
    const sec = new BalloonSec(items);
    sec.setItems(items);
    sec.start();
    sec.pick(sec.getState().correctIndex);
    const mid = sec.getState();
    sec.pick(mid.correctIndex);
    expect(sec.getState().correctCount).toBe(mid.correctCount);
  });

  it('pick trước start không có hiệu lực', () => {
    const sec = new BalloonSec(items);
    sec.setItems(items);
    sec.pick(0);
    expect(sec.getState().correctCount).toBe(0);
    expect(sec.getState().phase).toBe('idle');
  });

  it('pick trùng option không đếm 2 lần', () => {
    const sec = new BalloonSec(items);
    sec.setItems(items);
    sec.start();
    const idx = sec.getState().correctIndex;
    sec.pick(idx);
    sec.pick(idx);
    expect(sec.getState().correctCount).toBe(1);
  });

  it('advance sau feedback chuyển sang round tiếp theo', () => {
    const sec = new BalloonSec(items, { rounds: 3, feedbackDuration: 100 });
    sec.setItems(items);
    sec.start();
    const start = sec.getState();
    sec.pick(start.correctIndex);
    vi.advanceTimersByTime(150);
    expect(sec.getState().phase).toBe('playing');
    expect(sec.getState().roundIndex).toBe(1);
  });

  it('onCorrect signal phát khi pick đúng', () => {
    const sec = new BalloonSec(items);
    sec.setItems(items);
    const handler = vi.fn();
    sec.onCorrect.addListener(handler);
    sec.start();
    sec.pick(sec.getState().correctIndex);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ correct: 1, wrong: 0 }),
    );
  });

  it('onWrong signal phát khi pick sai', () => {
    const sec = new BalloonSec(items);
    sec.setItems(items);
    const handler = vi.fn();
    sec.onWrong.addListener(handler);
    sec.start();
    const ctx = sec.getState();
    const wrongIdx = ctx.correctIndex === 0 ? 1 : 0;
    sec.pick(wrongIdx);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ answer: expect.any(String), wrong: 1 }),
    );
  });

  it('onComplete signal phát khi hết rounds', () => {
    const sec = new BalloonSec(items, { rounds: 2, feedbackDuration: 100 });
    sec.setItems(items);
    const handler = vi.fn();
    sec.onComplete.addListener(handler);
    sec.start();

    sec.pick(sec.getState().correctIndex);
    vi.advanceTimersByTime(150);
    sec.pick(sec.getState().correctIndex);
    vi.advanceTimersByTime(150);

    expect(sec.getState().phase).toBe('completed');
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ score: 100, rounds: 2 }),
    );
  });

  it('destroy cleanup timer + signals', () => {
    const sec = new BalloonSec(items);
    sec.start();
    sec.pick(sec.getState().correctIndex);
    sec.destroy();
    expect(sec.getState().phase).toBe('feedback');
  });

  it('default config', () => {
    expect(DEFAULT_BALLOON_CONFIG.rounds).toBe(10);
    expect(DEFAULT_BALLOON_CONFIG.optionsCount).toBe(4);
  });
});
