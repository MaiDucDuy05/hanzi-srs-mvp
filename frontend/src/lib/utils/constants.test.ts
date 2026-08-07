import { describe, expect, it } from 'vitest';
import { activityKey } from './constants';

describe('activityKey', () => {
  it('tạo key theo practiceType:sourceType:sourceId (PR-14)', () => {
    expect(activityKey('FLASHCARD', 'LEVEL', 'hsk1')).toBe('FLASHCARD:LEVEL:hsk1');
    expect(activityKey('MEMORY_GAME', 'LESSON', 'l-42')).toBe('MEMORY_GAME:LESSON:l-42');
  });

  it('cùng loại bài khác nguồn có key riêng', () => {
    expect(activityKey('FLASHCARD', 'LEVEL', 'hsk1')).not.toBe(
      activityKey('FLASHCARD', 'LESSON', 'hsk1'),
    );
  });
});
