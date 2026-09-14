import type { PracticeType, Role, SourceType } from '@/lib/api/types';

export type Translator = (key: string) => string;

/**
 * Locale-aware label helpers. Pass a `next-intl` translator bound to the
 * `Constants` namespace so we don't need a hardcoded Vietnamese map here.
 *
 * Example:
 *   const t = useTranslations('Constants');
 *   const label = labelForPracticeType(t, 'HANZI_WRITING'); // → "Luyện viết chữ Hán" | "Hanzi Writing"
 */
export function labelForPracticeType(t: Translator, key: PracticeType): string {
  switch (key) {
    case 'WORD_MATCHING':
      return t('practiceTypeWordMatching');
    case 'FLASHCARD':
      return t('practiceTypeFlashcard');
    case 'FILL_BLANK':
      return t('practiceTypeFillBlank');
    case 'SENTENCE_ORDERING':
      return t('practiceTypeSentenceOrdering');
    case 'PINYIN_BALLOON_GAME':
      return t('practiceTypePinyinBalloonGame');
    case 'MEMORY_GAME':
      return t('practiceTypeMemoryGame');
    case 'HANZI_WRITING':
      return t('practiceTypeHanziWriting');
    default:
      return key;
  }
}

export function labelForSourceType(t: Translator, key: SourceType): string {
  switch (key) {
    case 'LEVEL':
      return t('sourceTypeLevel');
    case 'LESSON':
      return t('sourceTypeLesson');
    case 'TOPIC':
      return t('sourceTypeTopic');
    default:
      return key;
  }
}

export function labelForRole(t: Translator, key: Role): string {
  switch (key) {
    case 'FREE':
      return t('roleFree');
    case 'TEACHER':
      return t('roleTeacher');
    case 'ADMIN':
      return t('roleAdmin');
    default:
      return key;
  }
}

/** Tạo activityKey cho PR-14: practiceType:sourceType:sourceId. */
export function activityKey(
  practiceType: PracticeType,
  sourceType: SourceType,
  sourceId: string,
): string {
  return `${practiceType}:${sourceType}:${sourceId}`;
}

export const APP_NAME = 'Hán Tự HSK';
