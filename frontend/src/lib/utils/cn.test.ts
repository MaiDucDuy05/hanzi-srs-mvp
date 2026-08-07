import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('ghép các class hợp lệ', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('bỏ qua giá trị falsy', () => {
    expect(cn('a', null, false, undefined, 'c', '', 0 as unknown as string)).toBe('a c');
  });
});
