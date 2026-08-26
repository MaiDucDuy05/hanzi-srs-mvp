import { describe, expect, it } from 'vitest';
import {
  PRACTICE_TYPE_LABELS,
  SOURCE_TYPE_LABELS,
  ROLE_LABELS,
  activityKey,
  APP_NAME,
} from './constants';

describe('PRACTICE_TYPE_LABELS', () => {
  it('có nhãn cho mọi loại luyện tập', () => {
    expect(PRACTICE_TYPE_LABELS.WORD_MATCHING).toBeTruthy();
    expect(PRACTICE_TYPE_LABELS.FLASHCARD).toBeTruthy();
    expect(PRACTICE_TYPE_LABELS.FILL_BLANK).toBeTruthy();
    expect(PRACTICE_TYPE_LABELS.SENTENCE_ORDERING).toBeTruthy();
    expect(PRACTICE_TYPE_LABELS.PINYIN_BALLOON_GAME).toBeTruthy();
    expect(PRACTICE_TYPE_LABELS.MEMORY_GAME).toBeTruthy();
    expect(PRACTICE_TYPE_LABELS.HANZI_WRITING).toBeTruthy();
  });
});

describe('SOURCE_TYPE_LABELS', () => {
  it('có nhãn cho LEVEL/LESSON/TOPIC', () => {
    expect(SOURCE_TYPE_LABELS.LEVEL).toBeTruthy();
    expect(SOURCE_TYPE_LABELS.LESSON).toBeTruthy();
    expect(SOURCE_TYPE_LABELS.TOPIC).toBeTruthy();
  });
});

describe('ROLE_LABELS', () => {
  it('có nhãn cho FREE/TEACHER/ADMIN', () => {
    expect(ROLE_LABELS.FREE).toBeTruthy();
    expect(ROLE_LABELS.TEACHER).toBeTruthy();
    expect(ROLE_LABELS.ADMIN).toBeTruthy();
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
