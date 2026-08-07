import { describe, expect, it } from 'vitest';
import { normalizePinyin } from './pinyin';

describe('normalizePinyin', () => {
  it('bỏ dấu thanh và khoảng trắng', () => {
    expect(normalizePinyin('Nǐ hǎo')).toBe('nihao');
    expect(normalizePinyin('  Zhōngguó  ')).toBe('zhongguo');
  });

  it('chuẩn hoá ü thành v và chấp nhận u:', () => {
    expect(normalizePinyin('lǜ')).toBe('lv');
    expect(normalizePinyin('nü:')).toBe('nv');
    expect(normalizePinyin('ü')).toBe('v');
    expect(normalizePinyin('Lǚ xíng')).toBe('lvxing');
  });

  it('giữ nguyên ký tự không phải pinyin', () => {
    expect(normalizePinyin('abc')).toBe('abc');
  });
});
