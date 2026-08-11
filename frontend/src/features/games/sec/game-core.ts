/**
 * Game Logic Core — sec/
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    GameStateMachine                         │
 * │  ┌─────────┐   ┌──────────┐   ┌───────────┐              │
 * │  │  IDLE   │ → │ PLAYING  │ → │ COMPLETED │              │
 * │  └─────────┘   └──────────┘   └───────────┘              │
 * └─────────────────────────────────────────────────────────────┘
 *                          │
 *        ┌─────────────────┼─────────────────┐
 *        ▼                 ▼                 ▼
 * ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
 * │ BalloonSec   │  │ MemorySec    │  │ WritingSec  │
 * │              │  │              │  │             │
 * │ - rounds[]   │  │ - cards[]    │  │ - index    │
 * │ - options[]  │  │ - flipped[]  │  │ - feedback │
 * │ - score      │  │ - matched[]  │  │ - strokes[] │
 * └─────────────┘  └─────────────┘  └─────────────┘
 */

export type GamePhase = 'idle' | 'playing' | 'feedback' | 'completed';

export interface GameContext {
  phase: GamePhase;
  correct: number;
  wrong: number;
  moves: number;
  startedAt: number;
}

/** Signal bus — zero dependency event system */
export type ListenerFn<T> = (payload: T) => void;

export class Signal<T = void> {
  private readonly listeners = new Set<ListenerFn<T>>();

  addListener(fn: ListenerFn<T>): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  dispatch(payload: T): void {
    for (const fn of Array.from(this.listeners)) fn(payload);
  }

  clear(): void {
    this.listeners.clear();
  }
}

/** Object Pool — GC-free reuse objects */
export class ObjectPool<T> {
  private readonly pool: T[] = [];

  constructor(
    private readonly factory: () => T,
    private readonly reset: (obj: T) => void,
    private readonly initialSize = 16,
  ) {
    for (let i = 0; i < this.initialSize; i++) this.release(this.factory());
  }

  get(): T {
    const obj = this.pool.length > 0 ? this.pool.pop()! : this.factory();
    return obj;
  }

  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }

  prewarm(count: number): void {
    while (this.pool.length < count) this.pool.push(this.factory());
  }
}

/** Fisher-Yates shuffle — immutable, no side effects */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Compute score 0-100 */
export function computeScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
