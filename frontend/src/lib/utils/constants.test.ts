import { describe, expect, it } from 'vitest';
import {
  labelForPracticeType,
  labelForSourceType,
  labelForRole,
  activityKey,
  APP_NAME,
  type Translator,
} from './constants';

/** Identity translator: keys are returned as-is, so we can assert on key→label mapping. */
const t: Translator = (key: string) => key;

describe('labelForPracticeType', () => {
  it('trả về translation key cho mọi loại luyện tập', () => {
    expect(labelForPracticeType(t, 'WORD_MATCHING')).toBe('practiceTypeWordMatching');
    expect(labelForPracticeType(t, 'FLASHCARD')).toBe('practiceTypeFlashcard');
    expect(labelForPracticeType(t, 'FILL_BLANK')).toBe('practiceTypeFillBlank');
    expect(labelForPracticeType(t, 'SENTENCE_ORDERING')).toBe('practiceTypeSentenceOrdering');
    expect(labelForPracticeType(t, 'PINYIN_BALLOON_GAME')).toBe('practiceTypePinyinBalloonGame');
    expect(labelForPracticeType(t, 'MEMORY_GAME')).toBe('practiceTypeMemoryGame');
    expect(labelForPracticeType(t, 'HANZI_WRITING')).toBe('practiceTypeHanziWriting');
  });
});

describe('labelForSourceType', () => {
  it('trả về translation key cho LEVEL/LESSON/TOPIC', () => {
    expect(labelForSourceType(t, 'LEVEL')).toBe('sourceTypeLevel');
    expect(labelForSourceType(t, 'LESSON')).toBe('sourceTypeLesson');
    expect(labelForSourceType(t, 'TOPIC')).toBe('sourceTypeTopic');
  });
});

describe('labelForRole', () => {
  it('trả về translation key cho FREE/TEACHER/ADMIN', () => {
    expect(labelForRole(t, 'FREE')).toBe('roleFree');
    expect(labelForRole(t, 'TEACHER')).toBe('roleTeacher');
    expect(labelForRole(t, 'ADMIN')).toBe('roleAdmin');
  });
});

describe('activityKey', () => {
  it('ghép practiceType:sourceType:sourceId', () => {
    expect(activityKey('FLASHCARD', 'LEVEL', 'hsk1')).toBe('FLASHCARD:LEVEL:hsk1');
    expect(activityKey('WORD_MATCHING', 'LESSON', 'l-1')).toBe('WORD_MATCHING:LESSON:l-1');
  });
});

describe('APP_NAME', () => {
  it('có giá trị mặc định', () => {
    expect(APP_NAME).toBe('Hán Tự HSK');
  });
});
