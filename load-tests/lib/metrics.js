import { Counter } from 'k6/metrics';

// Business-specific metrics cho load test. Mỗi Counter đo 1 khía cạnh nghiệp vụ
// (không chỉ HTTP latency/throughput built-in). Hiện trong report JSON → debug
// flow đã chạy đúng, không chỉ status 200.
//
// Convention: <entity>_<verb>_total {tags}. Increment 1 lần sau check 2xx.

// Practice attempts (start) — đo mỗi variant có thực sự được gọi dưới tải.
export const practiceAttempts = new Counter('practice_attempts_total');
// Practice submits — start ≠ submit (user có thể bỏ giữa chừng).
export const practiceSubmits = new Counter('practice_submits_total');
// SRS rating distribution — phát hiện rating skew (content khó/dễ bất thường).
export const srsReviews = new Counter('srs_reviews_total');
// Achievements dashboard có data thật (streak > 0).
export const achievementsUnlocked = new Counter('achievements_unlocked_total');
// Test attempts (start) — đo mỗi test attempt được bắt đầu.
export const testAttempts = new Counter('test_attempts_total');
// Test submits — test attempt hoàn thành.
export const testSubmits = new Counter('test_submits_total');
// Test answers submitted — mỗi câu hỏi trả lời.
export const testAnswers = new Counter('test_answers_total');
// Admin write ops — DB contention watchpoint.
export const adminWrites = new Counter('admin_writes_total');
// Subscription quota block — 429-style nghiệp vụ (không phải throttle IP).
export const quotaBlocked = new Counter('quota_blocked_total');
export const quotaPassed = new Counter('quota_passed_total');
// Business error code — 4xx/5xx expected + unexpected.
export const businessErrors = new Counter('business_errors_total');