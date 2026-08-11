/**
 * Games SEC — exports
 *
 * Architecture overview:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                         UI Layer                           │
 * │   BalloonMode    │   MemoryMode    │   WritingMode         │
 * └───────────────────────┬─────────────────────────────────────┘
 *                         │ state changes, events
 * ┌───────────────────────▼─────────────────────────────────────┐
 * │                      SEC Layer (Logic)                      │
 * │   BalloonSec      │   MemorySec     │   WritingSec          │
 * └───────────────────────┬─────────────────────────────────────┘
 *                         │
 * ┌───────────────────────▼─────────────────────────────────────┐
 * │                    Core Utilities                            │
 * │   Signal (events) │ ObjectPool │ shuffle │ computeScore      │
 * └─────────────────────────────────────────────────────────────┘
 */

export { BalloonSec, DEFAULT_BALLOON_CONFIG } from './balloon-sec';
export type { BalloonCtx, BalloonConfig } from './balloon-sec';

export { MemorySec, DEFAULT_MEMORY_CONFIG } from './memory-sec';
export type { MemoryCtx, MemoryCard, MemoryConfig } from './memory-sec';

export { WritingSec, DEFAULT_WRITING_CONFIG } from './writing-sec';
export type { WritingCtx, WritingConfig, WritingResult } from './writing-sec';

export { Signal, ObjectPool, shuffle, computeScore } from './game-core';
