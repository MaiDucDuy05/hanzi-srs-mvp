import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApi } from './use-api';

describe('useApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('bắt đầu với loading=true và data=null', () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useApi(fetcher));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('set data khi fetcher resolve', async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: 'a' });
    const { result } = renderHook(() => useApi(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 'a' });
    expect(result.current.error).toBeNull();
  });

  it('set error khi fetcher reject', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useApi(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('boom');
  });

  it('refetch gọi lại fetcher', async () => {
    let count = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      count++;
      return { count };
    });

    const { result } = renderHook(() => useApi(fetcher));

    await waitFor(() => expect(result.current.data).toEqual({ count: 1 }));

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.data).toEqual({ count: 2 }));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('use latest fetcher ref khi rerender với fetcher mới', async () => {
    const fetcherA = vi.fn().mockResolvedValue('A');
    const fetcherB = vi.fn().mockResolvedValue('B');

    const { result, rerender } = renderHook(
      ({ fn }) => useApi(fn, [fn]),
      { initialProps: { fn: fetcherA as () => Promise<unknown> } },
    );

    await waitFor(() => expect(result.current.data).toBe('A'));

    rerender({ fn: fetcherB as () => Promise<unknown> });

    await waitFor(() => expect(result.current.data).toBe('B'));
  });

  it('không throw khi unmount trước khi fetcher resolve', async () => {
    const fetcher = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 50)),
    );

    const { result, unmount } = renderHook(() => useApi(fetcher));

    unmount();

    // Sau unmount, result.current vẫn refer; chỉ cần chắc chắn không throw nội bộ.
    expect(result.current.loading).toBe(true);
  });
});
