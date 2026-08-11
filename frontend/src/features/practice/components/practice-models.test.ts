import { describe, expect, it } from 'vitest';
import type { Vocabulary } from '@/lib/api/types';
import { buildQuestions, computeScore, shuffle, splitChars } from './practice-models';

const vocab = [
  { id: 'v1', hanzi: '你好', pinyin: 'nǐ hǎo', meaningVi: 'xin chào', audioKey: 'a1' },
  { id: 'v2', hanzi: '学习', pinyin: 'xuéxí', meaningVi: 'học tập', audioKey: null },
] as unknown as Vocabulary[];

describe('shuffle', () => {
  it('trả về một hoán vị của mảng gốc (giữ nguyên phần tử, không mutate)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const out = shuffle(input);
    expect(out).toHaveLength(input.length);
    expect([...out].sort((a, b) => a - b)).toEqual(input);
    expect(out).not.toBe(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('xử lý mảng rỗng và 1 phần tử', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([42])).toEqual([42]);
  });
});

describe('buildQuestions', () => {
  it('map từ vựng thành câu hỏi chuẩn hoá (PR-03/04)', () => {
    const qs = buildQuestions(vocab);
    expect(qs).toEqual([
      { id: 'v1', hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'xin chào', audioKey: 'a1' },
      { id: 'v2', hanzi: '学习', pinyin: 'xuéxí', meaning: 'học tập', audioKey: null },
    ]);
  });
});

describe('computeScore', () => {
  it('tính điểm 0–100 làm tròn', () => {
    expect(computeScore(8, 10)).toBe(80);
    expect(computeScore(3, 3)).toBe(100);
    expect(computeScore(0, 5)).toBe(0);
    expect(computeScore(1, 3)).toBe(33);
  });

  it('trả về 0 khi tổng bằng 0', () => {
    expect(computeScore(5, 0)).toBe(0);
  });
});

describe('splitChars', () => {
  it('tách chữ Hán thành từng ký tự', () => {
    expect(splitChars('你好')).toEqual(['你', '好']);
    expect(splitChars('')).toEqual([]);
  });
});
