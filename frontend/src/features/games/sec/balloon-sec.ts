/**
 * Balloon Game Logic — sec/
 *
 * State Flow:
 * ┌──────────────────────────────────────────────────────┐
 │ IDLE → PLAYING → FEEDBACK → PLAYING → ... → COMPLETED │
 └──────────────────────────────────────────────────────┘
 *
 * Events: onCorrect, onWrong, onProgress, onComplete
 */

import type { QuestionItem } from '../../practice/components/practice-models';
import { Signal } from './game-core';
import { computeScore, shuffle } from './game-core';

export interface BalloonConfig {
  rounds: number;
  optionsCount: number;
  feedbackDuration: number;
}

export const DEFAULT_BALLOON_CONFIG: BalloonConfig = {
  rounds: 10,
  optionsCount: 4,
  feedbackDuration: 800,
};

export interface BalloonCtx {
  readonly phase: 'idle' | 'playing' | 'feedback' | 'completed';
  readonly roundIndex: number;
  readonly totalRounds: number;
  readonly currentHanzi: string;
  readonly options: string[];
  readonly correctIndex: number;
  readonly pickedIndex: number | null;
  readonly correctCount: number;
  readonly wrongCount: number;
  readonly moves: number;
}

export class BalloonSec {
  // State
  private ctx: BalloonCtx;
  private config: BalloonConfig;
  private timer: ReturnType<typeof setTimeout> | null = null;

  // Events
  readonly onCorrect = new Signal<{ correct: number; wrong: number; progress: number }>();
  readonly onWrong = new Signal<{ answer: string; correct: number; wrong: number }>();
  readonly onProgress = new Signal<{ index: number; total: number }>();
  readonly onComplete = new Signal<{
    correct: number;
    wrong: number;
    score: number;
    rounds: number;
  }>();

  constructor(items: readonly QuestionItem[], config: Partial<BalloonConfig> = {}) {
    this.config = { ...DEFAULT_BALLOON_CONFIG, ...config };
    this.ctx = this.initContext(items);
  }

  private initContext(items: readonly QuestionItem[]): BalloonCtx {
    const rounds = shuffle(items.map((_, i) => i)).slice(0, Math.min(this.config.rounds, items.length));
    const roundOptions: string[][] = [];
    const correctIndices: number[] = [];

    for (const idx of rounds) {
      const wrong = shuffle(items.filter((_, j) => j !== idx).map((q) => q.pinyin)).slice(0, this.config.optionsCount - 1);
      const opts = shuffle([items[idx].pinyin, ...wrong]);
      roundOptions.push(opts);
      correctIndices.push(opts.indexOf(items[idx].pinyin));
    }

    return {
      phase: 'idle',
      roundIndex: 0,
      totalRounds: rounds.length,
      currentHanzi: items[rounds[0]]?.hanzi ?? '',
      options: roundOptions[0] ?? [],
      correctIndex: correctIndices[0] ?? -1,
      pickedIndex: null,
      correctCount: 0,
      wrongCount: 0,
      moves: 0,
    };
  }

  /** Start game */
  start(): BalloonCtx {
    return (this.ctx = { ...this.ctx, phase: 'playing' });
  }

  /** Pick an option by index */
  pick(optionIndex: number): BalloonCtx {
    if (this.ctx.phase !== 'playing') return this.ctx;
    if (this.ctx.pickedIndex !== null) return this.ctx;

    const isCorrect = optionIndex === this.ctx.correctIndex;
    const next: BalloonCtx = {
      ...this.ctx,
      phase: 'feedback',
      pickedIndex: optionIndex,
      correctCount: this.ctx.correctCount + (isCorrect ? 1 : 0),
      wrongCount: this.ctx.wrongCount + (isCorrect ? 0 : 1),
      moves: this.ctx.moves + 1,
    };

    this.ctx = next;
    this.clearTimer();

    if (isCorrect) {
      this.onCorrect.dispatch({
        correct: next.correctCount,
        wrong: next.wrongCount,
        progress: next.roundIndex / next.totalRounds,
      });
    } else {
      const correctAnswer = this.ctx.options[this.ctx.correctIndex];
      this.onWrong.dispatch({
        answer: correctAnswer,
        correct: next.correctCount,
        wrong: next.wrongCount,
      });
    }

    this.timer = setTimeout(() => this.advance(), this.config.feedbackDuration);
    return next;
  }

  private advance(): BalloonCtx {
    this.clearTimer();
    const nextRound = this.ctx.roundIndex + 1;

    if (nextRound >= this.ctx.totalRounds) {
      this.ctx = { ...this.ctx, phase: 'completed' };
      const score = computeScore(this.ctx.correctCount, this.ctx.totalRounds);
      this.onComplete.dispatch({
        correct: this.ctx.correctCount,
        wrong: this.ctx.wrongCount,
        score,
        rounds: this.ctx.totalRounds,
      });
      return this.ctx;
    }

    const items = this.getItems();
    const rounds = shuffle(items.map((_, i) => i)).slice(0, this.config.rounds);
    const idx = rounds[nextRound];
    const wrong = shuffle(items.filter((_, j) => j !== idx).map((q) => q.pinyin)).slice(0, this.config.optionsCount - 1);
    const opts = shuffle([items[idx].pinyin, ...wrong]);

    this.ctx = {
      ...this.ctx,
      phase: 'playing',
      roundIndex: nextRound,
      currentHanzi: items[idx].hanzi,
      options: opts,
      correctIndex: opts.indexOf(items[idx].pinyin),
      pickedIndex: null,
    };

    this.onProgress.dispatch({ index: nextRound, total: this.ctx.totalRounds });
    return this.ctx;
  }

  /** Get items from session — stored when created */
  private _items: readonly QuestionItem[] = [];
  setItems(items: readonly QuestionItem[]): void {
    this._items = items;
  }
  private getItems(): readonly QuestionItem[] {
    return this._items;
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /** Get current state snapshot */
  getState(): BalloonCtx {
    return this.ctx;
  }

  /** Clean up */
  destroy(): void {
    this.clearTimer();
    this.onCorrect.clear();
    this.onWrong.clear();
    this.onProgress.clear();
    this.onComplete.clear();
  }
}
