import { describe, expect, it } from 'vitest';
import {
  EXAM_FILTERS,
  EXAM_TEMPLATES,
  SOURCE_TYPE_OPTIONS,
  DIFFICULTY_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  HSK_LEVEL_OPTIONS,
  getStatusColor,
  getStatusLabel,
  getIndicatorColor,
  getSourceTypeBadge,
  getDifficultyColor,
  formatDuration,
  getQuestionPreview,
} from './utils';

describe('EXAM_FILTERS', () => {
  it('định nghĩa 4 filter mặc định', () => {
    expect(EXAM_FILTERS).toEqual(['All', 'Drafts', 'Active', 'Completed']);
  });
});

describe('EXAM_TEMPLATES', () => {
  it('có 3 template', () => {
    expect(EXAM_TEMPLATES).toHaveLength(3);
  });
});

describe('options', () => {
  it('SOURCE_TYPE_OPTIONS có All/Practice/Exam/Both', () => {
    expect(SOURCE_TYPE_OPTIONS).toHaveLength(4);
  });
  it('DIFFICULTY_OPTIONS có All + 3 levels', () => {
    expect(DIFFICULTY_OPTIONS).toHaveLength(4);
  });
  it('QUESTION_TYPE_OPTIONS có All + 5 types', () => {
    expect(QUESTION_TYPE_OPTIONS).toHaveLength(6);
  });
  it('HSK_LEVEL_OPTIONS có All + HSK 1-6', () => {
    expect(HSK_LEVEL_OPTIONS).toHaveLength(7);
  });
});

describe('getStatusColor', () => {
  it('trả màu theo status', () => {
    expect(getStatusColor('DRAFT')).toHaveProperty('bg');
    expect(getStatusColor('ACTIVE')).toHaveProperty('bg');
    expect(getStatusColor('COMPLETED')).toHaveProperty('bg');
  });

  it('fallback cho status lạ', () => {
    expect(getStatusColor('UNKNOWN')).toHaveProperty('bg');
  });
});

describe('getStatusLabel', () => {
  it('dịch status', () => {
    expect(getStatusLabel('DRAFT')).toBe('Draft');
    expect(getStatusLabel('ACTIVE')).toBe('Active');
    expect(getStatusLabel('COMPLETED')).toBe('Completed');
  });

  it('fallback trả nguyên status', () => {
    expect(getStatusLabel('XYZ')).toBe('XYZ');
  });
});

describe('getIndicatorColor', () => {
  it('trả màu theo status', () => {
    expect(getIndicatorColor('DRAFT')).toMatch(/^#[0-9a-f]{6}$/i);
    expect(getIndicatorColor('ACTIVE')).toMatch(/^#[0-9a-f]{6}$/i);
    expect(getIndicatorColor('COMPLETED')).toMatch(/^#[0-9a-f]{6}$/i);
    expect(getIndicatorColor('UNKNOWN')).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('getSourceTypeBadge', () => {
  it('trả label cho mỗi source type', () => {
    expect(getSourceTypeBadge('PRACTICE').label).toBe('Practice');
    expect(getSourceTypeBadge('EXAM').label).toBe('Exam');
    expect(getSourceTypeBadge('BOTH').label).toBe('Reusable');
  });

  it('fallback cho source lạ', () => {
    expect(getSourceTypeBadge('OTHER' as any).label).toBe('Unknown');
  });
});

describe('getDifficultyColor', () => {
  it('trả màu theo difficulty', () => {
    expect(getDifficultyColor('EASY')).toMatch(/^#[0-9a-f]{6}$/i);
    expect(getDifficultyColor('MEDIUM')).toMatch(/^#[0-9a-f]{6}$/i);
    expect(getDifficultyColor('HARD')).toMatch(/^#[0-9a-f]{6}$/i);
    expect(getDifficultyColor('UNKNOWN')).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('formatDuration', () => {
  it('rỗng khi undefined hoặc 0', () => {
    expect(formatDuration(undefined)).toBe('');
    expect(formatDuration(0)).toBe('');
  });

  it('phút khi < 60', () => {
    expect(formatDuration(30)).toBe('30 Mins');
    expect(formatDuration(45)).toBe('45 Mins');
    expect(formatDuration(1)).toBe('1 Mins');
  });

  it('giờ + phút khi >= 60 và có phút lẻ', () => {
    expect(formatDuration(75)).toBe('1h 15m');
    expect(formatDuration(125)).toBe('2h 5m');
  });

  it('chỉ giờ khi chia hết', () => {
    expect(formatDuration(60)).toBe('1 Hour');
    expect(formatDuration(120)).toBe('2 Hours');
  });
});

describe('getQuestionPreview', () => {
  it('dùng content.prompt khi có', () => {
    const q = { content: { prompt: 'Hello world' } } as any;
    expect(getQuestionPreview(q)).toBe('Hello world');
  });

  it('cắt ngắn nếu > 100 ký tự', () => {
    const long = 'a'.repeat(150);
    const q = { content: { prompt: long } } as any;
    const result = getQuestionPreview(q);
    expect(result).toContain('...');
    expect(result.length).toBeLessThanOrEqual(103);
  });

  it('fallback question field', () => {
    const q = { content: { question: 'A question' } } as any;
    expect(getQuestionPreview(q)).toBe('A question');
  });

  it('fallback "No preview available"', () => {
    const q = { content: {} } as any;
    expect(getQuestionPreview(q)).toBe('No preview available');
  });
});
