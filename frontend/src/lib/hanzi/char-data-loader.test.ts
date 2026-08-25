import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

describe('loadCharData', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetch và trả về data khi response ok', async () => {
    const data = { strokes: ['M 0 0 L 1 1'], medians: [[[0, 0]]] };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => data,
    } as unknown as Response);

    const { loadCharData } = await import('./char-data-loader');
    const result = await loadCharData('你');
    expect(result).toEqual(data);
  });

  it('encode URI component cho char', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ strokes: [], medians: [] }),
    } as unknown as Response);

    const { loadCharData } = await import('./char-data-loader');
    await loadCharData('你');
    expect(fetchSpy).toHaveBeenCalledWith('/hanzi-data/%E4%BD%A0.json');
  });

  it('trả về null khi response không ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as unknown as Response);

    const { loadCharData } = await import('./char-data-loader');
    const result = await loadCharData('X');
    expect(result).toBeNull();
  });

  it('trả về null khi fetch throw', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('boom'));

    const { loadCharData } = await import('./char-data-loader');
    const result = await loadCharData('X');
    expect(result).toBeNull();
  });

  it('cache: lần 2 dùng cache, không gọi fetch', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ strokes: [], medians: [] }),
    } as unknown as Response);

    const { loadCharData } = await import('./char-data-loader');
    await loadCharData('你');
    await loadCharData('你');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('cache null cho char không tồn tại', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as unknown as Response);

    const { loadCharData } = await import('./char-data-loader');
    await loadCharData('X');
    await loadCharData('X');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
