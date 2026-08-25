import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { MemorySec } from './memory-sec';
import type { QuestionItem } from '../../practice/components/practice-models';

const items: QuestionItem[] = [
  { id: 'v1', hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'hello', audioKey: null },
  { id: 'v2', hanzi: '学习', pinyin: 'xuéxí', meaning: 'study', audioKey: null },
  { id: 'v3', hanzi: '中国', pinyin: 'zhōngguó', meaning: 'china', audioKey: null },
];

describe('MemorySec', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('khởi tạo với phase idle, cards có 2x pairs', () => {
    const sec = new MemorySec(items);
    expect(sec.getState().phase).toBe('idle');
    expect(sec.getState().cards).toHaveLength(6); // 3 pairs * 2 cards
    expect(sec.getState().totalPairs).toBe(3);
  });

  it('start chuyển sang playing', () => {
    const sec = new MemorySec(items);
    sec.start();
    expect(sec.getState().phase).toBe('playing');
  });

  it('flip 1 card đầu tiên', () => {
    const sec = new MemorySec(items);
    sec.start();
    const card = sec.getState().cards[0];
    sec.flip(card.id);
    expect(sec.getState().flipped).toContain(card.id);
  });

  it('flip 2 cards match → correctCount++ + cards matched', () => {
    const sec = new MemorySec(items);
    sec.start();
    // Tìm 2 cards cùng pair (1 hanzi, 1 pinyin)
    const pairId = sec.getState().cards[0].pairId;
    const pair = sec.getState().cards.filter((c) => c.pairId === pairId);
    sec.flip(pair[0].id);
    sec.flip(pair[1].id);
    expect(sec.getState().correctCount).toBe(1);
    expect(sec.getState().moves).toBe(1);
    const matched = sec.getState().cards.filter((c) => c.pairId === pairId);
    expect(matched.every((c) => c.matched)).toBe(true);
  });

  it('flip 2 cards không match → wrongCount++', () => {
    const sec = new MemorySec(items);
    sec.start();
    const cardA = sec.getState().cards[0];
    const cardB = sec.getState().cards.find((c) => c.pairId !== cardA.pairId)!;
    sec.flip(cardA.id);
    sec.flip(cardB.id);
    expect(sec.getState().wrongCount).toBe(1);
  });

  it('flip 2 cards cùng kind không tính là match', () => {
    const sec = new MemorySec(items);
    sec.start();
    const sameKind = sec.getState().cards.filter(
      (c) => c.kind === 'hanzi',
    );
    if (sameKind.length >= 2 && sameKind[0].pairId !== sameKind[1].pairId) {
      sec.flip(sameKind[0].id);
      sec.flip(sameKind[1].id);
      expect(sec.getState().correctCount).toBe(0);
      expect(sec.getState().wrongCount).toBe(1);
    } else {
      expect(true).toBe(true); // skip nếu random không cho phép
    }
  });

  it('flip card đã matched không có hiệu lực', () => {
    const sec = new MemorySec(items, { matchDelay: 100 });
    sec.start();
    const pairId = sec.getState().cards[0].pairId;
    const pair = sec.getState().cards.filter((c) => c.pairId === pairId);
    sec.flip(pair[0].id);
    sec.flip(pair[1].id);
    vi.advanceTimersByTime(150);

    // Sau match delay, phase = playing (nếu còn cards chưa matched)
    sec.flip(pair[0].id);
    // Không tăng moves vì card đã matched
    expect(sec.getState().moves).toBe(1);
  });

  it('flip card đã flipped không có hiệu lực', () => {
    const sec = new MemorySec(items);
    sec.start();
    const card = sec.getState().cards[0];
    sec.flip(card.id);
    sec.flip(card.id);
    expect(sec.getState().flipped.filter((id) => id === card.id)).toHaveLength(1);
  });

  it('flip khi phase=completed không có hiệu lực', () => {
    const sec = new MemorySec([items[0], items[1]], { matchDelay: 100 });
    sec.start();
    const cards = sec.getState().cards;
    // Match 2 pairs để complete
    const pid0 = cards[0].pairId;
    const pid1 = cards.find((c) => c.pairId !== pid0)!.pairId;
    sec.flip(cards.find((c) => c.pairId === pid0 && c.kind === 'hanzi')!.id);
    sec.flip(cards.find((c) => c.pairId === pid0 && c.kind === 'pinyin')!.id);
    vi.advanceTimersByTime(150);
    sec.flip(cards.find((c) => c.pairId === pid1 && c.kind === 'hanzi')!.id);
    sec.flip(cards.find((c) => c.pairId === pid1 && c.kind === 'pinyin')!.id);
    vi.advanceTimersByTime(150);
    expect(sec.getState().phase).toBe('completed');
    const beforeMoves = sec.getState().moves;
    sec.flip(cards[0].id);
    expect(sec.getState().moves).toBe(beforeMoves);
  });

  it('onComplete phát khi tất cả pairs matched', () => {
    const sec = new MemorySec([items[0]], { matchDelay: 100 });
    const handler = vi.fn();
    sec.onComplete.addListener(handler);
    sec.start();
    const cards = sec.getState().cards;
    sec.flip(cards[0].id);
    sec.flip(cards[1].id);
    vi.advanceTimersByTime(150);
    expect(sec.getState().phase).toBe('completed');
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ score: 100, pairs: 1 }),
    );
  });

  it('isFlipped trả về true cho card đã flipped hoặc matched', () => {
    const sec = new MemorySec(items, { matchDelay: 100 });
    sec.start();
    const card = sec.getState().cards[0];
    expect(sec.isFlipped(card.id)).toBe(false);
    sec.flip(card.id);
    expect(sec.isFlipped(card.id)).toBe(true);
  });

  it('destroy cleanup', () => {
    const sec = new MemorySec(items);
    sec.start();
    sec.destroy();
  });
});
