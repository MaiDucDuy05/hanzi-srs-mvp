/** Queue và Job name constants — tách riêng để tránh circular import. */
export const PRACTICE_EVENTS_QUEUE = 'practice-events';
export const JOB_ATTEMPT_COMPLETED = 'attempt.completed';

/** Queue flush Redis daily usage counters → PostgreSQL (mỗi 5 phút). */
export const DAILY_USAGE_QUEUE = 'daily-usage';
export const JOB_FLUSH_USAGE = 'flush.usage';
