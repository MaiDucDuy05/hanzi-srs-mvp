import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

// Mock next/headers
const mockCookieStore = {
  get: vi.fn(),
};
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

describe('getServerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('trả về null khi không có cookie', async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    vi.stubGlobal('fetch', vi.fn());

    const { getServerUser } = await import('./server-auth');
    const result = await getServerUser();
    expect(result).toBeNull();
  });

  it('fetch /auth/me với Cookie header khi có token', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'jwt-token' });
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'u1', email: 'a@b.c' } }),
    });
    vi.stubGlobal('fetch', fetchSpy);

    const { getServerUser } = await import('./server-auth');
    const user = await getServerUser();

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.objectContaining({
        headers: { Cookie: 'access_token=jwt-token' },
        cache: 'no-store',
      }),
    );
    expect(user).toEqual({ id: 'u1', email: 'a@b.c' });
  });

  it('trả về null khi response không ok', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'jwt-token' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401 }),
    );

    const { getServerUser } = await import('./server-auth');
    const user = await getServerUser();
    expect(user).toBeNull();
  });

  it('trả về null khi body không có data', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'jwt-token' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    );

    const { getServerUser } = await import('./server-auth');
    const user = await getServerUser();
    expect(user).toBeNull();
  });

  it('trả về null khi fetch throw', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'jwt-token' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')));

    const { getServerUser } = await import('./server-auth');
    const user = await getServerUser();
    expect(user).toBeNull();
  });
});
