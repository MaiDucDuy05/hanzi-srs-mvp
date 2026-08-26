import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { saveSession, loadSession, clearSession } from './storage';

describe('storage (sessionStorage)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saveSession lưu JSON vào sessionStorage', () => {
    saveSession('k', { a: 1, b: 'x' });
    const raw = window.sessionStorage.getItem('k');
    expect(raw).toBe('{"a":1,"b":"x"}');
  });

  it('loadSession trả về object đã lưu', () => {
    saveSession('k', { a: 1 });
    expect(loadSession<{ a: number }>('k')).toEqual({ a: 1 });
  });

  it('loadSession trả về null khi key không tồn tại', () => {
    expect(loadSession('missing')).toBeNull();
  });

  it('loadSession trả về null khi JSON không hợp lệ', () => {
    window.sessionStorage.setItem('broken', 'not-json{');
    expect(loadSession('broken')).toBeNull();
  });

  it('clearSession xoá key', () => {
    saveSession('k', 1);
    clearSession('k');
    expect(window.sessionStorage.getItem('k')).toBeNull();
  });

  it('saveSession không throw khi sessionStorage lỗi', () => {
    const setItem = vi
      .spyOn(window.sessionStorage, 'setItem')
      .mockImplementation(() => {
        throw new Error('quota');
      });
    expect(() => saveSession('k', 1)).not.toThrow();
    setItem.mockRestore();
  });
});

describe('storage (SSR)', () => {
  it('saveSession là no-op khi không có window', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error - test SSR
    delete globalThis.window;
    expect(() => saveSession('k', 1)).not.toThrow();
    globalThis.window = originalWindow;
  });

  it('loadSession trả về null khi không có window', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error - test SSR
    delete globalThis.window;
    expect(loadSession('k')).toBeNull();
    globalThis.window = originalWindow;
  });

  it('clearSession là no-op khi không có window', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error - test SSR
    delete globalThis.window;
    expect(() => clearSession('k')).not.toThrow();
    globalThis.window = originalWindow;
  });
});
