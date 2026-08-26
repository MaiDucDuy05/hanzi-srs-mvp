import { describe, expect, it } from 'vitest';
import {
  HEAT_STYLES,
  getHeatLevel,
  getFailCount,
  getMistakeLabel,
  extractText,
  getInitials,
  clampPct,
  formatDate,
  formatScore,
  getScoreColor,
  getScoreBg,
  sortByFailCount,
  formatActivityLabel,
} from './utils';

describe('HEAT_STYLES', () => {
  it('định nghĩa 3 mức', () => {
    expect(HEAT_STYLES.critical).toBeDefined();
    expect(HEAT_STYLES.warning).toBeDefined();
    expect(HEAT_STYLES.normal).toBeDefined();
  });
});

describe('getHeatLevel', () => {
  it('trả về critical khi failCount >= 5', () => {
    expect(getHeatLevel(5)).toBe(HEAT_STYLES.critical);
    expect(getHeatLevel(10)).toBe(HEAT_STYLES.critical);
  });

  it('trả về warning khi failCount 3-4', () => {
    expect(getHeatLevel(3)).toBe(HEAT_STYLES.warning);
    expect(getHeatLevel(4)).toBe(HEAT_STYLES.warning);
  });

  it('trả về normal khi failCount < 3', () => {
    expect(getHeatLevel(0)).toBe(HEAT_STYLES.normal);
    expect(getHeatLevel(2)).toBe(HEAT_STYLES.normal);
  });
});

describe('getFailCount', () => {
  it('tối thiểu 1', () => {
    expect(getFailCount({ failCount: 0 } as any)).toBe(1);
    expect(getFailCount({ failCount: -1 } as any)).toBe(1);
  });

  it('giữ nguyên giá trị > 0', () => {
    expect(getFailCount({ failCount: 3 } as any)).toBe(3);
  });

  it('fallback 1 khi NaN/undefined', () => {
    expect(getFailCount({ failCount: 'bad' } as any)).toBe(1);
    expect(getFailCount({} as any)).toBe(1);
  });
});

describe('getMistakeLabel', () => {
  it('dùng hanzi + pinyin khi có', () => {
    expect(
      getMistakeLabel({
        questionSnapshot: { hanzi: '你好', pinyin: 'nǐ hǎo' },
        questionType: 'VOCAB',
      } as any),
    ).toBe('你好 — nǐ hǎo');
  });

  it('chỉ dùng hanzi khi thiếu pinyin', () => {
    expect(
      getMistakeLabel({
        questionSnapshot: { hanzi: '你好' },
        questionType: 'VOCAB',
      } as any),
    ).toBe('你好');
  });

  it('dùng question field khi không có hanzi', () => {
    expect(
      getMistakeLabel({
        questionSnapshot: { question: 'Câu hỏi dài...' },
        questionType: 'GRAMMAR',
      } as any),
    ).toBe('Câu hỏi dài...');
  });

  it('fallback questionType', () => {
    expect(
      getMistakeLabel({ questionSnapshot: null, questionType: 'GRAMMAR' } as any),
    ).toBe('GRAMMAR');
  });

  it('fallback — khi không có gì', () => {
    expect(getMistakeLabel({ questionSnapshot: null } as any)).toBe('—');
  });
});

describe('extractText', () => {
  it('trả — cho null/undefined', () => {
    expect(extractText(null)).toBe('—');
    expect(extractText(undefined)).toBe('—');
    expect(extractText('')).toBe('—');
  });

  it('trả nguyên chuỗi', () => {
    expect(extractText('hello')).toBe('hello');
  });

  it('chuyển số thành chuỗi', () => {
    expect(extractText(42)).toBe('42');
  });

  it('join mảng', () => {
    expect(extractText(['a', 'b', 'c'])).toBe('a, b, c');
  });

  it('lấy text/answer/hanzi từ object', () => {
    expect(extractText({ text: 'txt' })).toBe('txt');
    expect(extractText({ answer: 'ans' })).toBe('ans');
    expect(extractText({ hanzi: '你' })).toBe('你');
    expect(extractText({ pinyin: 'ni' })).toBe('ni');
  });

  it('fallback first value khi không có key ưu tiên', () => {
    expect(extractText({ random: 'X' })).toBe('X');
  });

  it('fallback — khi object rỗng', () => {
    expect(extractText({})).toBe('—');
  });
});

describe('getInitials', () => {
  it('?? khi không có tên', () => {
    expect(getInitials(null)).toBe('??');
    expect(getInitials(undefined)).toBe('??');
    expect(getInitials('')).toBe('??');
    expect(getInitials('   ')).toBe('??');
  });

  it('lấy 2 chữ cái đầu họ + tên', () => {
    expect(getInitials('Nguyễn Văn A')).toBe('NA');
    expect(getInitials('Trần Thị B')).toBe('TB');
  });

  it('lấy 2 chữ cái đầu của 1 từ', () => {
    expect(getInitials('Trần')).toBe('TR');
  });

  it('lấy chữ cái đầu và chữ cái cuối nếu nhiều từ', () => {
    expect(getInitials('A B C D')).toBe('AD');
  });
});

describe('clampPct', () => {
  it('clamp về 0-100', () => {
    expect(clampPct(50)).toBe(50);
    expect(clampPct(-10)).toBe(0);
    expect(clampPct(150)).toBe(100);
  });

  it('parse chuỗi số', () => {
    expect(clampPct('75')).toBe(75);
    expect(clampPct('100%')).toBe(0); // % không phải số
  });

  it('trả 0 cho giá trị không hợp lệ', () => {
    expect(clampPct(null)).toBe(0);
    expect(clampPct(undefined)).toBe(0);
    expect(clampPct('abc')).toBe(0);
    expect(clampPct(NaN)).toBe(0);
  });
});

describe('formatDate', () => {
  it('Hôm nay khi cùng ngày', () => {
    const now = new Date().toISOString();
    expect(formatDate(now)).toBe('Hôm nay');
  });

  it('Hôm qua khi 1 ngày trước', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatDate(yesterday.toISOString())).toBe('Hôm qua');
  });

  it('N ngày trước khi < 7 ngày', () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatDate(date.toISOString())).toBe('3 ngày trước');
  });

  it('format ngắn khi > 7 ngày', () => {
    const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = formatDate(date.toISOString());
    expect(result).not.toBe('Hôm nay');
    expect(result).not.toMatch(/ngày trước$/);
  });
});

describe('formatScore', () => {
  it('thêm % và làm tròn', () => {
    expect(formatScore(80.4)).toBe('80%');
    expect(formatScore(80.6)).toBe('81%');
    expect(formatScore(100)).toBe('100%');
    expect(formatScore(0)).toBe('0%');
  });
});

describe('getScoreColor', () => {
  it('xanh khi >= 80', () => {
    expect(getScoreColor(80)).toContain('text-');
    expect(getScoreColor(100)).toContain('text-');
  });
  it('vàng khi 60-79', () => {
    expect(getScoreColor(60)).toContain('text-');
    expect(getScoreColor(79)).toContain('text-');
  });
  it('đỏ khi < 60', () => {
    expect(getScoreColor(0)).toContain('text-');
    expect(getScoreColor(59)).toContain('text-');
  });
});

describe('getScoreBg', () => {
  it('trả về bg class theo mức điểm', () => {
    expect(getScoreBg(90)).toContain('bg-');
    expect(getScoreBg(70)).toContain('bg-');
    expect(getScoreBg(30)).toContain('bg-');
  });
});

describe('sortByFailCount', () => {
  it('sort giảm dần theo failCount', () => {
    const arr = [
      { failCount: 1 },
      { failCount: 5 },
      { failCount: 3 },
    ] as any;
    const sorted = sortByFailCount(arr);
    expect(sorted.map((m) => m.failCount)).toEqual([5, 3, 1]);
  });

  it('không mutate input', () => {
    const arr = [{ failCount: 1 }, { failCount: 2 }] as any;
    const before = [...arr];
    sortByFailCount(arr);
    expect(arr).toEqual(before);
  });
});

describe('formatActivityLabel', () => {
  it('chi tiết cho PRACTICE_COMPLETED + SENTENCE_ORDERING', () => {
    expect(
      formatActivityLabel({
        activityType: 'PRACTICE_COMPLETED',
        details: { type: 'SENTENCE_ORDERING' },
      }),
    ).toContain('Sắp xếp câu');
  });

  it('chi tiết cho HANZI_WRITING', () => {
    expect(
      formatActivityLabel({
        activityType: 'PRACTICE_COMPLETED',
        details: { type: 'HANZI_WRITING' },
      }),
    ).toContain('Viết Hán tự');
  });

  it('fallback label cho activity type lạ', () => {
    expect(
      formatActivityLabel({ activityType: 'UNKNOWN_TYPE' }),
    ).toBe('UNKNOWN_TYPE');
  });
});
