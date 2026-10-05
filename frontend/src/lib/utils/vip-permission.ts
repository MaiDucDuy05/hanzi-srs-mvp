import type { User } from '../api/types';

/**
 * Kiểm tra xem người dùng có quyền VIP hay không.
 * Quản trị viên (ADMIN) và Giáo viên (TEACHER) luôn có đầy đủ quyền lợi như VIP.
 * Học viên có gói VIP còn hạn (vipValidUntil > now) được tính là VIP.
 */
export function isUserVip(user?: User | null): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'TEACHER') return true;
  if (!user.vipValidUntil) return false;
  return new Date(user.vipValidUntil).getTime() > Date.now();
}

/**
 * Kiểm tra xem một cấp độ (HSK / YCT) có phải là khoá VIP hay không.
 * - HSK 1 và YCT 1: Khoá học hoàn toàn miễn phí.
 * - HSK 2..9 và YCT 2..6: Khoá học yêu cầu VIP (chỉ mở miễn phí 3 bài đầu).
 */
export function isLevelVip(levelCode?: string | null): boolean {
  if (!levelCode) return false;
  const normalized = levelCode.toUpperCase().replace(/\s+/g, '');
  if (normalized === 'HSK1' || normalized === 'YCT1') {
    return false;
  }
  return true;
}

export interface LessonAccessCheckParams {
  levelCode?: string | null;
  lessonOrder: number;
  isVip: boolean;
}

/**
 * Kiểm tra xem một bài học cụ thể có thể truy cập được không:
 * 1. Nếu cấp độ là HSK 1 hoặc YCT 1: Mở miễn phí 100% tất cả bài học.
 * 2. Nếu cấp độ là HSK 2..9 hoặc YCT 2..6 (khoá VIP):
 *    - Bài 1, 2, 3 (lessonOrder <= 3): Mở miễn phí cho mọi học viên trải nghiệm.
 *    - Bài 4 trở đi (lessonOrder > 3): Chỉ thành viên VIP mới có thể truy cập.
 */
export function isLessonAccessible({
  levelCode,
  lessonOrder,
  isVip,
}: LessonAccessCheckParams): boolean {
  // Nếu là người dùng VIP -> luôn mở khoá toàn bộ
  if (isVip) return true;

  // Cấp độ miễn phí hoàn toàn (HSK 1 / YCT 1)
  if (!isLevelVip(levelCode)) {
    return true;
  }

  // Cấp độ VIP nhưng là 3 bài học đầu tiên (1, 2, 3)
  if (lessonOrder <= 3) {
    return true;
  }

  // Từ bài 4 trở đi cần VIP
  return false;
}
