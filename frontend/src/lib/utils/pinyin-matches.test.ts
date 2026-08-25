import { describe, expect, it } from 'vitest';
import { pinyinMatches } from './pinyin';

describe('pinyinMatches', () => {
  it('so khớp đúng khi cùng giá trị', () => {
    expect(pinyinMatches('nǐ', 'nǐ')).toBe(true);
  });

  it('so khớp khi khác dấu thanh', () => {
    expect(pinyinMatches('ni3', 'nǐ')).toBe(false); // số không chuẩn hoá
    expect(pinyinMatches('ni', 'nǐ')).toBe(true);
  });

  it('so khớp khi có khoảng trắng khác nhau', () => {
    expect(pinyinMatches(' nihao ', 'nǐ hǎo')).toBe(true);
  });

  it('so khớp v giữa v và u:', () => {
    expect(pinyinMatches('lü', 'lǜ')).toBe(true);
    expect(pinyinMatches('lu:', 'lǜ')).toBe(true);
  });

  it('trả về false khi khác chữ cái', () => {
    expect(pinyinMatches('nihao', 'nahao')).toBe(false);
  });

  it('phân biệt chữ hoa/thường sau khi normalize', () => {
    expect(pinyinMatches('NIHAO', 'nǐhǎo')).toBe(true);
  });

  it('chuỗi rỗng so khớp với nhau', () => {
    expect(pinyinMatches('', '')).toBe(true);
  });
});
