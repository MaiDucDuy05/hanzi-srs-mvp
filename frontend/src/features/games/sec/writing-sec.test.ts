import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { WritingSec, DEFAULT_WRITING_CONFIG } from './writing-sec';
import type { QuestionItem } from '../../practice/components/practice-models';

const items: QuestionItem[] = [
  { id: 'v1', hanzi: '你', pinyin: 'nǐ', meaning: 'you', audioKey: null },
  { id: 'v2', hanzi: '好', pinyin: 'hǎo', meaning: 'good', audioKey: null },
  { id: 'v3', hanzi: '学', pinyin: 'xué', meaning: 'study', audioKey: null },
];

describe('WritingSec', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('khởi tạo idle với char đầu tiên', () => {
    const sec = new WritingSec(items);
    const ctx = sec.getState();
    expect(ctx.phase).toBe('idle');
    expect(ctx.currentHanzi).toBe(items[0].hanzi);
    expect(ctx.totalChars).toBe(3);
  });

  it('start chuyển sang playing', () => {
    const sec = new WritingSec(items);
    sec.start();
    expect(sec.getState().phase).toBe('playing');
  });

  it('complete tăng correctCount', () => {
    const sec = new WritingSec(items);
    sec.start();
    sec.complete(0);
    expect(sec.getState().correctCount).toBe(1);
    expect(sec.getState().moves).toBe(1);
    expect(sec.getState().phase).toBe('feedback');
  });

  it('complete trong idle phase không có hiệu lực', () => {
    const sec = new WritingSec(items);
    sec.complete(0);
    expect(sec.getState().correctCount).toBe(0);
  });

  it('complete trong feedback phase không có hiệu lực', () => {
    const sec = new WritingSec(items);
    sec.start();
    sec.complete(0);
    const midCorrect = sec.getState().correctCount;
    sec.complete(0);
    expect(sec.getState().correctCount).toBe(midCorrect);
  });

  it('skip tăng wrongCount + charResults có skipped=true', () => {
    const sec = new WritingSec(items);
    sec.start();
    sec.skip();
    expect(sec.getState().wrongCount).toBe(1);
    expect(sec.getState().charResults[0]).toMatchObject({
      char: items[0].hanzi,
      skipped: true,
    });
  });

  it('skip khi skipEnabled=false không có hiệu lực', () => {
    const sec = new WritingSec(items, { skipEnabled: false });
    sec.start();
    sec.skip();
    expect(sec.getState().wrongCount).toBe(0);
  });

  it('skip trong feedback phase không có hiệu lực', () => {
    const sec = new WritingSec(items);
    sec.start();
    sec.complete(0);
    const mid = sec.getState().wrongCount;
    sec.skip();
    expect(sec.getState().wrongCount).toBe(mid);
  });

  it('advance sang char tiếp theo sau delay', () => {
    const sec = new WritingSec(items, { nextCharDelay: 100 });
    sec.start();
    sec.complete(0);
    expect(sec.getState().currentHanzi).toBe(items[0].hanzi);
    vi.advanceTimersByTime(150);
    expect(sec.getState().currentHanzi).toBe(items[1].hanzi);
    expect(sec.getState().phase).toBe('playing');
  });

  it('complete last char → completed phase + onComplete signal', () => {
    const sec = new WritingSec(items, { nextCharDelay: 100 });
    const handler = vi.fn();
    sec.onComplete.addListener(handler);
    sec.start();
    sec.complete(0);
    vi.advanceTimersByTime(150);
    sec.complete(0);
    vi.advanceTimersByTime(150);
    sec.complete(0);
    vi.advanceTimersByTime(150);
    expect(sec.getState().phase).toBe('completed');
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ score: 100, chars: 3 }),
    );
  });

  it('onCharComplete phát khi complete', () => {
    const sec = new WritingSec(items);
    const handler = vi.fn();
    sec.onCharComplete.addListener(handler);
    sec.start();
    sec.complete(2);
    expect(handler).toHaveBeenCalledWith({
      char: items[0].hanzi,
      index: 0,
      total: 3,
    });
  });

  it('onSkip phát khi skip', () => {
    const sec = new WritingSec(items);
    const handler = vi.fn();
    sec.onSkip.addListener(handler);
    sec.start();
    sec.skip();
    expect(handler).toHaveBeenCalledWith({
      char: items[0].hanzi,
      correct: 0,
      wrong: 1,
    });
  });

  it('default config', () => {
    expect(DEFAULT_WRITING_CONFIG.skipEnabled).toBe(true);
    expect(DEFAULT_WRITING_CONFIG.nextCharDelay).toBe(800);
  });

  it('destroy cleanup', () => {
    const sec = new WritingSec(items);
    sec.start();
    sec.complete(0);
    sec.destroy();
  });

  it('mảng rỗng → complete ngay khi start + complete', () => {
    const sec = new WritingSec([], { nextCharDelay: 100 });
    const handler = vi.fn();
    sec.onComplete.addListener(handler);
    sec.start();
    sec.complete(0);
    vi.advanceTimersByTime(150);
    expect(sec.getState().phase).toBe('completed');
  });
});
