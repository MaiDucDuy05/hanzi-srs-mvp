/**
 * Memory Game Logic — sec/
 *
 * State Flow:
 * ┌────────────────────────────────────────────────────────┐
 │ IDLE → PLAYING → FEEDBACK → PLAYING (flip reset) → ... → COMPLETED │
 └────────────────────────────────────────────────────────┘
 *
 * Card pairs: hanzi + pinyin = 1 pair
 * Max 8 pairs (16 cards) per game
 */

import type { QuestionItem } from '../../practice/components/practice-models';
import { Signal } from './game-core';
import { computeScore, shuffle } from './game-core';

export interface MemoryConfig {
  maxPairs: number;
  matchDelay: number;
  noMatchDelay: number;
}

export const DEFAULT_MEMORY_CONFIG: MemoryConfig = {
  maxPairs: 8,
  matchDelay: 800,
  noMatchDelay: 1000,
};

export interface MemoryCard {
  id: string;
  pairId: string;
  kind: 'hanzi' | 'pinyin';
  value: string;
  matched: boolean;
}

export interface MemoryCtx {
  readonly phase: 'idle' | 'playing' | 'feedback' | 'completed';
  readonly cards: readonly MemoryCard[];
  readonly flipped: readonly string[];
  readonly matchedPairs: number;
  readonly totalPairs: number;
  readonly correctCount: number;
  readonly wrongCount: number;
  readonly moves: number;
}

export class MemorySec {
  private ctx: MemoryCtx;
  private config: MemoryConfig;
  private timer: ReturnType<typeof setTimeout> | null = null;

  // Events
  readonly onMatch = new Signal<{ pairId: string; correct: number; wrong: number }>();
  readonly onNoMatch = new Signal<{ aId: string; bId: string }>();
  readonly onComplete = new Signal<{
    correct: number;
    wrong: number;
    score: number;
    pairs: number;
  }>();

  constructor(items: readonly QuestionItem[], config: Partial<MemoryConfig> = {}) {
    this.config = { ...DEFAULT_MEMORY_CONFIG, ...config };
    this.ctx = this.initContext(items);
  }

  private initContext(items: readonly QuestionItem[]): MemoryCtx {
    const pairs = shuffle(items).slice(0, Math.min(this.config.maxPairs, items.length));
    const cards: MemoryCard[] = shuffle(
      pairs.flatMap((q) => [
        { id: `${q.id}:h`, pairId: q.id, kind: 'hanzi', value: q.hanzi, matched: false },
        { id: `${q.id}:p`, pairId: q.id, kind: 'pinyin', value: q.pinyin, matched: false },
      ]),
    );

    return {
      phase: 'idle',
      cards,
      flipped: [],
      matchedPairs: 0,
      totalPairs: pairs.length,
      correctCount: 0,
      wrongCount: 0,
      moves: 0,
    };
  }

  start(): MemoryCtx {
    return (this.ctx = { ...this.ctx, phase: 'playing' });
  }

  flip(cardId: string): MemoryCtx {
    if (this.ctx.phase === 'feedback') return this.ctx;
    if (this.ctx.phase === 'completed') return this.ctx;
    if (this.ctx.flipped.includes(cardId)) return this.ctx;

    const card = this.ctx.cards.find((c) => c.id === cardId);
    if (!card || card.matched) return this.ctx;

    const flipped = [...this.ctx.flipped, cardId];

    // Second card flipped
    if (flipped.length === 2) {
      const [aId, bId] = flipped;
      const a = this.ctx.cards.find((c) => c.id === aId)!;
      const b = this.ctx.cards.find((c) => c.id === bId)!;
      const isMatch = a.pairId === b.pairId && a.kind !== b.kind;

      this.clearTimer();

      if (isMatch) {
        this.ctx = {
          ...this.ctx,
          phase: 'feedback',
          flipped,
          correctCount: this.ctx.correctCount + 1,
          moves: this.ctx.moves + 1,
          cards: this.ctx.cards.map((c) =>
            c.id === aId || c.id === bId ? { ...c, matched: true } : c,
          ),
        };
        this.onMatch.dispatch({
          pairId: a.pairId,
          correct: this.ctx.correctCount,
          wrong: this.ctx.wrongCount,
        });

        this.timer = setTimeout(() => {
          const allMatched = this.ctx.cards.every((c) => c.matched);
          if (allMatched) {
            this.ctx = { ...this.ctx, phase: 'completed' };
            this.onComplete.dispatch({
              correct: this.ctx.correctCount,
              wrong: this.ctx.wrongCount,
              score: computeScore(this.ctx.correctCount, this.ctx.totalPairs),
              pairs: this.ctx.totalPairs,
            });
          } else {
            this.ctx = { ...this.ctx, phase: 'playing', flipped: [] };
          }
        }, this.config.matchDelay);
      } else {
        this.ctx = {
          ...this.ctx,
          phase: 'feedback',
          flipped,
          wrongCount: this.ctx.wrongCount + 1,
          moves: this.ctx.moves + 1,
        };
        this.onNoMatch.dispatch({ aId, bId });

        this.timer = setTimeout(() => {
          this.ctx = { ...this.ctx, phase: 'playing', flipped: [] };
        }, this.config.noMatchDelay);
      }
    } else {
      this.ctx = { ...this.ctx, flipped };
    }

    return this.ctx;
  }

  isFlipped(cardId: string): boolean {
    const card = this.ctx.cards.find((c) => c.id === cardId);
    return (card?.matched ?? false) || this.ctx.flipped.includes(cardId);
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  getState(): MemoryCtx {
    return this.ctx;
  }

  destroy(): void {
    this.clearTimer();
    this.onMatch.clear();
    this.onNoMatch.clear();
    this.onComplete.clear();
  }
}
