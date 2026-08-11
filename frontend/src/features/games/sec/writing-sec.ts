/**
 * Writing Game Logic — sec/
 *
 * State Flow:
 * ┌──────────────────────────────────────────────────────┐
 │ IDLE → PLAYING → FEEDBACK (done) → PLAYING → ... → COMPLETED │
 └──────────────────────────────────────────────────────┘
 *
 * User traces strokes in correct order.
 * Can skip hard characters.
 */

import type { QuestionItem } from '../../practice/components/practice-models';
import { Signal } from './game-core';
import { computeScore } from './game-core';

export interface WritingConfig {
  nextCharDelay: number;
  skipEnabled: boolean;
}

export const DEFAULT_WRITING_CONFIG: WritingConfig = {
  nextCharDelay: 800,
  skipEnabled: true,
};

export interface WritingCtx {
  readonly phase: 'idle' | 'playing' | 'feedback' | 'completed';
  readonly charIndex: number;
  readonly totalChars: number;
  readonly currentHanzi: string;
  readonly currentPinyin: string;
  readonly currentMeaning: string;
  readonly correctCount: number;
  readonly wrongCount: number;
  readonly moves: number;
  readonly feedback: 'done' | null;
}

export interface WritingResult {
  correct: number;
  wrong: number;
  score: number;
  chars: number;
}

export class WritingSec {
  private ctx: WritingCtx;
  private config: WritingConfig;
  private items: readonly QuestionItem[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  // Events
  readonly onCharComplete = new Signal<{ char: string; index: number; total: number }>();
  readonly onSkip = new Signal<{ char: string; correct: number; wrong: number }>();
  readonly onComplete = new Signal<WritingResult>();

  constructor(items: readonly QuestionItem[], config: Partial<WritingConfig> = {}) {
    this.items = items;
    this.config = { ...DEFAULT_WRITING_CONFIG, ...config };
    this.ctx = this.initContext(items);
  }

  private initContext(items: readonly QuestionItem[]): WritingCtx {
    return {
      phase: 'idle',
      charIndex: 0,
      totalChars: items.length,
      currentHanzi: items[0]?.hanzi ?? '',
      currentPinyin: items[0]?.pinyin ?? '',
      currentMeaning: items[0]?.meaning ?? '',
      correctCount: 0,
      wrongCount: 0,
      moves: 0,
      feedback: null,
    };
  }

  start(): WritingCtx {
    return (this.ctx = { ...this.ctx, phase: 'playing' });
  }

  /** Called when user completes tracing a character */
  complete(): WritingCtx {
    if (this.ctx.phase !== 'playing') return this.ctx;

    this.clearTimer();
    this.ctx = {
      ...this.ctx,
      phase: 'feedback',
      feedback: 'done',
      correctCount: this.ctx.correctCount + 1,
      moves: this.ctx.moves + 1,
    };

    this.onCharComplete.dispatch({
      char: this.ctx.currentHanzi,
      index: this.ctx.charIndex,
      total: this.ctx.totalChars,
    });

    this.timer = setTimeout(() => this.next(), this.config.nextCharDelay);
    return this.ctx;
  }

  /** Skip current character */
  skip(): WritingCtx {
    if (!this.config.skipEnabled) return this.ctx;
    if (this.ctx.phase === 'feedback') return this.ctx;

    this.clearTimer();
    this.ctx = {
      ...this.ctx,
      phase: 'feedback',
      feedback: 'done',
      wrongCount: this.ctx.wrongCount + 1,
      moves: this.ctx.moves + 1,
    };

    this.onSkip.dispatch({
      char: this.ctx.currentHanzi,
      correct: this.ctx.correctCount,
      wrong: this.ctx.wrongCount,
    });

    this.timer = setTimeout(() => this.next(), this.config.nextCharDelay);
    return this.ctx;
  }

  private next(): WritingCtx {
    this.clearTimer();
    const nextIdx = this.ctx.charIndex + 1;

    if (nextIdx >= this.items.length) {
      this.ctx = { ...this.ctx, phase: 'completed', feedback: null };
      const score = computeScore(this.ctx.correctCount, this.ctx.totalChars);
      this.onComplete.dispatch({
        correct: this.ctx.correctCount,
        wrong: this.ctx.wrongCount,
        score,
        chars: this.ctx.totalChars,
      });
      return this.ctx;
    }

    const item = this.items[nextIdx];
    this.ctx = {
      ...this.ctx,
      phase: 'playing',
      charIndex: nextIdx,
      currentHanzi: item.hanzi,
      currentPinyin: item.pinyin,
      currentMeaning: item.meaning,
      feedback: null,
    };
    return this.ctx;
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  getState(): WritingCtx {
    return this.ctx;
  }

  destroy(): void {
    this.clearTimer();
    this.onCharComplete.clear();
    this.onSkip.clear();
    this.onComplete.clear();
  }
}
