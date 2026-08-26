import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { ApiError, apiFetch, unwrap } from './client';

function makeResponse(
  status: number,
  body: unknown = null,
  ok?: boolean,
): Response {
  const isOk = ok ?? (status >= 200 && status < 300);
  return {
    ok: isOk,
    status,
    json: async () => body,
  } as unknown as Response;
}

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('trả về body JSON khi thành công', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(makeResponse(200, { data: { id: '1' } }));
    const result = await apiFetch<{ data: { id: string } }>('/auth/me');
    expect(result).toEqual({ data: { id: '1' } });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/auth/me',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    );
  });

  it('gửi body JSON khi POST', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(makeResponse(200, { data: { ok: true } }));
    await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'a@b.c', password: 'pw' }),
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.c', password: 'pw' }),
      }),
    );
  });

  it('throw ApiError với status + message từ backend', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(400, { message: 'Email không hợp lệ' }),
    );
    await expect(apiFetch('/x', { auth: false })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Email không hợp lệ',
    });
  });

  it('ghép nhiều message thành 1 chuỗi khi là array', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(400, { message: ['Lỗi A', 'Lỗi B'] }),
    );
    const err: any = await apiFetch('/x', { auth: false }).catch((e) => e);
    expect(err.message).toBe('Lỗi A, Lỗi B');
  });

  it('fallback message khi body không có message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeResponse(500, {}));
    const err: any = await apiFetch('/x', { auth: false }).catch((e) => e);
    expect(err.message).toBe('Yêu cầu thất bại. Vui lòng thử lại.');
  });

  it('fallback message khi body không phải JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json');
      },
    } as unknown as Response);
    const err: any = await apiFetch('/x', { auth: false }).catch((e) => e);
    expect(err.message).toBe('Yêu cầu thất bại. Vui lòng thử lại.');
  });

  it('dispatch event khi 401 + auth=true và message chứa "bị khóa"', async () => {
    window.alert = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert');
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(401, { message: 'Tài khoản của bạn đã bị khóa' }),
    );

    await expect(apiFetch('/me')).rejects.toBeInstanceOf(ApiError);
    expect(alertSpy).toHaveBeenCalledWith('Tài khoản của bạn đã bị khóa');
    expect(dispatchSpy).toHaveBeenCalled();
    const evt = dispatchSpy.mock.calls
      .map((c) => c[0])
      .find((e) => (e as Event).type === 'hanzi:unauthorized');
    expect(evt).toBeDefined();
  });

  it('không dispatch unauthorized khi auth=false', async () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeResponse(401, { message: 'bad' }),
    );

    await expect(apiFetch('/public', { auth: false })).rejects.toBeInstanceOf(
      ApiError,
    );
    const evt = dispatchSpy.mock.calls
      .map((c) => c[0])
      .find((e) => (e as Event).type === 'hanzi:unauthorized');
    expect(evt).toBeUndefined();
  });

  it('không set Content-Type khi contentType=false (multipart)', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(makeResponse(200, { ok: true }));
    const form = new FormData();
    form.append('a', 'b');
    await apiFetch('/upload', { method: 'POST', body: form, contentType: false });
    const headers = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Record<
      string,
      string
    >;
    expect(headers['Content-Type']).toBeUndefined();
  });

  it('retry tối đa 2 lần khi server lỗi 5xx', async () => {
    let count = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      count++;
      return makeResponse(503, { message: 'fail' });
    });
    await expect(apiFetch('/x', { auth: false })).rejects.toBeInstanceOf(ApiError);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('không retry với 4xx', async () => {
    let count = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      count++;
      return makeResponse(404, { message: 'nf' });
    });
    await expect(apiFetch('/x', { auth: false })).rejects.toBeInstanceOf(ApiError);
    expect(count).toBe(1);
  });

  it('throw ApiError khi fetch liên tục ném exception', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    const err: any = await apiFetch('/x', { auth: false }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
    expect(err.message).toContain('Không kết nối được');
  });

  it('trả về null khi response body rỗng (204)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('no body');
      },
    } as unknown as Response);
    const result = await apiFetch<null>('/x');
    expect(result).toBeNull();
  });
});

describe('unwrap', () => {
  it('bóc envelope {data, message}', async () => {
    const result = await unwrap(Promise.resolve({ data: { id: '1' }, message: 'ok' }));
    expect(result).toEqual({ id: '1' });
  });

  it('nhận Promise và unwrap', async () => {
    const result = await unwrap(Promise.resolve({ data: 42 }));
    expect(result).toBe(42);
  });
});
