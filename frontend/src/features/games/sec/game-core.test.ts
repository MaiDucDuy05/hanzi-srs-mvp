import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Signal, ObjectPool, shuffle, computeScore } from './game-core';

describe('Signal', () => {
  it('addListener gọi callback khi dispatch', () => {
    const s = new Signal<number>();
    const fn = vi.fn();
    s.addListener(fn);
    s.dispatch(42);
    expect(fn).toHaveBeenCalledWith(42);
  });

  it('addListener trả về unsubscribe function', () => {
    const s = new Signal();
    const fn = vi.fn();
    const unsub = s.addListener(fn);
    s.dispatch();
    expect(fn).toHaveBeenCalledTimes(1);
    unsub();
    s.dispatch();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('dispatch với nhiều listener', () => {
    const s = new Signal();
    const a = vi.fn();
    const b = vi.fn();
    s.addListener(a);
    s.addListener(b);
    s.dispatch();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('clear xoá tất cả listener', () => {
    const s = new Signal();
    const fn = vi.fn();
    s.addListener(fn);
    s.clear();
    s.dispatch();
    expect(fn).not.toHaveBeenCalled();
  });

  it('dispatch không gọi listener đã unsub', () => {
    const s = new Signal();
    const fn = vi.fn();
    const unsub = s.addListener(fn);
    unsub();
    s.dispatch();
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('ObjectPool', () => {
  it('get trả về object mới khi pool rỗng', () => {
    const factory = vi.fn(() => ({ v: 1 }));
    const pool = new ObjectPool(factory, () => undefined, 0);
    const obj = pool.get();
    expect(obj).toEqual({ v: 1 });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it('release rồi get trả về cùng object (sau reset)', () => {
    const reset = vi.fn();
    const factory = vi.fn(() => ({ v: 1 }));
    const pool = new ObjectPool(factory, reset, 0);
    const a = pool.get();
    pool.release(a);
    const b = pool.get();
    expect(b).toBe(a);
    expect(reset).toHaveBeenCalledWith(a);
  });

  it('prewarm tăng pool size', () => {
    const factory = vi.fn(() => ({}));
    const pool = new ObjectPool(factory, () => undefined, 0);
    pool.prewarm(5);
    expect(factory).toHaveBeenCalledTimes(5);
  });

  it('initial size khởi tạo pool', () => {
    const factory = vi.fn(() => ({ v: Math.random() }));
    new ObjectPool(factory, () => undefined, 3);
    expect(factory).toHaveBeenCalledTimes(3);
  });
});

describe('shuffle', () => {
  it('trả về hoán vị cùng độ dài', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).toHaveLength(input.length);
    expect([...out].sort()).toEqual(input);
  });

  it('không mutate input', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it('trả về array mới', () => {
    const input = [1, 2, 3];
    expect(shuffle(input)).not.toBe(input);
  });

  it('xử lý mảng rỗng', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('xử lý mảng 1 phần tử', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

describe('computeScore', () => {
  it('tính % làm tròn', () => {
    expect(computeScore(8, 10)).toBe(80);
    expect(computeScore(3, 3)).toBe(100);
    expect(computeScore(0, 5)).toBe(0);
  });

  it('trả về 0 khi total = 0', () => {
    expect(computeScore(5, 0)).toBe(0);
    expect(computeScore(0, 0)).toBe(0);
  });
});
