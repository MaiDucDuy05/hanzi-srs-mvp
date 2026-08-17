/** Loại giao dịch EXP trong ledger (exp_transactions). */
export enum ExpTransactionType {
  EARN_LESSON = 'EARN_LESSON',
  EARN_PERFECT = 'EARN_PERFECT',
  EARN_COMBO = 'EARN_COMBO',
  EARN_STREAK = 'EARN_STREAK',
  EARN_MISTAKE_REVIEW = 'EARN_MISTAKE_REVIEW',
  REDEEM = 'REDEEM',
  ADMIN_ADJUST = 'ADMIN_ADJUST',
}

/** Loại hoạt động ghi vào timeline (user_activities). */
export enum ActivityType {
  LESSON_COMPLETED = 'LESSON_COMPLETED',
  PRACTICE_COMPLETED = 'PRACTICE_COMPLETED',
  PERFECT_BONUS = 'PERFECT_BONUS',
  COMBO_BONUS = 'COMBO_BONUS',
  STREAK_MILESTONE = 'STREAK_MILESTONE',
  MISTAKE_REVIEWED = 'MISTAKE_REVIEWED',
  REDEEMED_REWARD = 'REDEEMED_REWARD',
  REWARD_GRANTED = 'REWARD_GRANTED',
  LEVEL_UP = 'LEVEL_UP',
}

/** Loại phần thưởng trong catalog rewards. */
export enum RewardType {
  TEMPORARY_VIP = 'TEMPORARY_VIP',
  DISCOUNT_VOUCHER = 'DISCOUNT_VOUCHER',
  CONTENT_UNLOCK = 'CONTENT_UNLOCK',
  COSMETIC = 'COSMETIC',
}

/** Ref type cho exp_transactions (bảng tham chiếu). */
export enum ExpRefType {
  PRACTICE_ATTEMPT = 'PRACTICE_ATTEMPT',
  USER_REWARD = 'USER_REWARD',
  MISTAKE_BOOK = 'MISTAKE_BOOK',
  STREAK = 'STREAK',
  ADMIN = 'ADMIN',
}
