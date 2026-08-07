import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch, unwrap } from './client';

/**
 * Test transport layer (FE-008): apiFetch gửi cookie HttpOnly (credentials include),
 * không gắn Authorization header (auth qua cookie), 401 → sự kiện hanzi:unauthorized,
 * message từ backend, lỗi mạng.
 */

function makeFakeWindow() {
  const win = {
    dispatchEvent: vi.fn(),
  };
  return { win };
}

function jsonResponse(body: unknown, init: { ok: boolean; status: number }) {
  return {
    ok: init.ok,
    status: init.status,
    json: async () => body,
  } as unknown as Response;
}

const fetchMock = vi.fn<typeof fetch>();

describe('apiFetch transport (HttpOnly cookie)', () => {
  beforeEach(() => {
    const { win } = makeFakeWindow();
    vi.stubGlobal('window', win);
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('unwrap bóc envelope { data }', async () => {
    await expect(unwrap(Promise.resolve({ data: { a: 1 } }))).resolves.toEqual({ a: 1 });
    await expect(unwrap({ data: [1, 2] })).resolves.toEqual([1, 2]);
  });

  it('gọi API cùng origin /api/v1 với credentials include (cookie HttpOnly)', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: null }, { ok: true, status: 200 }));

    await apiFetch('/auth/me');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/auth/me');
    expect(init?.credentials).toBe('include');
  });

  it('KHÔNG gắn Authorization header — auth qua cookie', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: null }, { ok: true, status: 200 }));

    await apiFetch('/tests');

    const [, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('trả về body JSON chưa bóc envelope khi ok', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: 42, message: 'ok' }, { ok: true, status: 200 }));

    await expect(apiFetch('/x')).resolves.toEqual({ data: 42, message: 'ok' });
  });

  it('401 ở endpoint authenticated → dispatch sự kiện hanzi:unauthorized + ném ApiError', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Unauthorized' }, { ok: false, status: 401 }));

    await expect(apiFetch('/private')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
    });
    const win = window as unknown as { dispatchEvent: ReturnType<typeof vi.fn> };
    expect(win.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'hanzi:unauthorized' }));
  });

  it('không dispatch sự kiện khi 401 ở endpoint public (auth: false)', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Unauthorized' }, { ok: false, status: 401 }));

    await expect(apiFetch('/auth/login', { auth: false })).rejects.toBeInstanceOf(ApiError);
    const win = window as unknown as { dispatchEvent: ReturnType<typeof vi.fn> };
    expect(win.dispatchEvent).not.toHaveBeenCalled();
  });

  it('lấy message string từ backend', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 'Email đã tồn tại' }, { ok: false, status: 400 }));

    await expect(apiFetch('/auth/register', { auth: false })).rejects.toMatchObject({
      message: 'Email đã tồn tại',
      status: 400,
    });
  });

  it('nối message dạng mảng (validation)', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: ['a', 'b'] }, { ok: false, status: 400 }));

    await expect(apiFetch('/x')).rejects.toMatchObject({ message: 'a, b' });
  });

  it('lỗi mạng → ApiError status 0 với message thân thiện', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiFetch('/x')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
      message: 'Không kết nối được máy chủ. Vui lòng thử lại.',
    });
  });

  it('response 204 không JSON → trả về null', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204, json: async () => { throw new Error('no body'); } } as unknown as Response);

    await expect(apiFetch('/x')).resolves.toBeNull();
  });
});
