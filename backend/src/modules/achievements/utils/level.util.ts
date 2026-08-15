/**
 * Level computation từ totalExp (PR-33).
 * Fixed thresholds in code (không query DB — tiết kiệm query).
 * - L1: 0-99, L2: 100-299, L3: 300-599, L4: 600-999, L5: 1000-1500.
 * - Sau L5: +500 EXP/level (L6: 1501-2000, L7: 2001-2500...).
 * Dễ ở mốc đầu → cảm giác tiến bộ nhanh, kích thích dopamin người mới.
 */

/** EXP floor của L1-L5 (index 0 = L1 floor). */
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000];
/** L5 ceiling — exp <= 1500 vẫn là L5. */
const L5_CEILING = 1500;
/** Sau L5: mỗi level cần thêm bao nhiêu EXP. */
const POST_L5_STEP = 500;

export interface LevelInfo {
  level: number;
  /** EXP floor của level hiện tại. */
  currentLevelFloor: number;
  /** EXP floor của level kế tiếp. */
  nextLevelFloor: number;
  /** Tiến độ 0-1 giữa 2 mốc. */
  progress: number;
  /** EXP còn thiếu để lên level kế tiếp. */
  expToNext: number;
}

/**
 * Tính level từ totalExp.
 * @example getLevel(0)→L1; getLevel(100)→L2; getLevel(1500)→L5; getLevel(1501)→L6.
 */
export function getLevel(totalExp: number): LevelInfo {
  if (totalExp < 0) totalExp = 0;

  // L1-L5: tìm threshold lớn nhất <= totalExp.
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalExp >= LEVEL_THRESHOLDS[i]) {
      const floor = LEVEL_THRESHOLDS[i];

      // L5 special: range 1000-1500 (inclusive ceiling).
      if (i === LEVEL_THRESHOLDS.length - 1 && totalExp <= L5_CEILING) {
        return {
          level: i + 1,
          currentLevelFloor: floor,
          nextLevelFloor: L5_CEILING + 1,
          progress: (totalExp - floor) / (L5_CEILING - floor),
          expToNext: L5_CEILING + 1 - totalExp,
        };
      }

      // L1-L4: range [threshold[i], threshold[i+1]).
      if (i < LEVEL_THRESHOLDS.length - 1) {
        const ceiling = LEVEL_THRESHOLDS[i + 1];
        return {
          level: i + 1,
          currentLevelFloor: floor,
          nextLevelFloor: ceiling,
          progress: (totalExp - floor) / (ceiling - floor),
          expToNext: ceiling - totalExp,
        };
      }

      // Beyond L5 → fall through to L6+ logic.
      break;
    }
  }

  // L6+: exp > 1500, +500/level. L6 starts at 1501.
  const beyond = totalExp - L5_CEILING - 1;
  const extraLevels = Math.floor(beyond / POST_L5_STEP);
  const level = 6 + extraLevels;
  const currentLevelFloor = L5_CEILING + 1 + extraLevels * POST_L5_STEP;
  const nextLevelFloor = currentLevelFloor + POST_L5_STEP;

  return {
    level,
    currentLevelFloor,
    nextLevelFloor,
    progress: (totalExp - currentLevelFloor) / POST_L5_STEP,
    expToNext: nextLevelFloor - totalExp,
  };
}
