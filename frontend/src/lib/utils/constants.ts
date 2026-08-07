import type { PracticeType, Role, SourceType } from '@/lib/api/types';

/** Nhãn tiếng Việt cho các loại luyện tập. */
export const PRACTICE_TYPE_LABELS: Record<PracticeType, string> = {
  WORD_MATCHING: 'Nối từ',
  FLASHCARD: 'Flashcard',
  FILL_BLANK: 'Điền chỗ trống',
  SENTENCE_ORDERING: 'Sắp xếp câu',
  PINYIN_BALLOON_GAME: 'Bắn bóng Pinyin',
  MEMORY_GAME: 'Memory',
  HANZI_WRITING: 'Luyện viết chữ Hán',
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  LEVEL: 'Cấp HSK',
  LESSON: 'Bài học',
  TOPIC: 'Chủ đề',
};

export const ROLE_LABELS: Record<Role, string> = {
  FREE: 'Học viên Free',
  TEACHER: 'Giáo viên',
  ADMIN: 'Quản trị viên',
};

/** Tạo activityKey cho PR-14: practiceType:sourceType:sourceId. */
export function activityKey(
  practiceType: PracticeType,
  sourceType: SourceType,
  sourceId: string,
): string {
  return `${practiceType}:${sourceType}:${sourceId}`;
}

export const APP_NAME = 'Hán Tự HSK';
