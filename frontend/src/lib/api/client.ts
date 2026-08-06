/**
 * API client — fetch wrapper cho backend NestJS (api/v1).
 * - Tự đính JWT từ localStorage (trừ các endpoint public).
 * - Giải nén envelope { data, message }.
 * - Ném ApiError với message thân thiện từ backend.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const TOKEN_KEY = 'hanzi_srs_token';
export const USER_KEY = 'hanzi_srs_user';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, user: unknown): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser<T>(): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

type RequestOptions = RequestInit & { auth?: boolean };

/**
 * Gọi API. Mặc định gắn Bearer token; truyền `auth: false` cho endpoint public.
 * Trả về body JSON đã parse (chưa bóc envelope — dùng helper `unwrap` nếu cần).
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const token = auth ? getToken() : null;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers as Record<string, string> | undefined),
      },
    });
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Vui lòng thử lại.', 0);
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // response không phải JSON (vd 204)
  }

  if (!res.ok) {
    // Token hết hạn/không hợp lệ: xoá thông tin đăng nhập và báo AuthProvider
    // (không áp dụng cho endpoint public như login/register — auth=false).
    if (res.status === 401 && auth) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('hanzi:unauthorized'));
      }
    }
    const rawMessage = (body as { message?: unknown } | null)?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : typeof rawMessage === 'string'
        ? rawMessage
        : 'Yêu cầu thất bại. Vui lòng thử lại.';
    throw new ApiError(message, res.status);
  }

  return body as T;
}

/**
 * Bóc envelope dạng single: { data, message }.
 * Nhận cả Promise (để dùng trực tiếp với apiFetch).
 */
export async function unwrap<T>(
  body: { data: T } | Promise<{ data: T }>,
): Promise<T> {
  const resolved = await body;
  return resolved.data;
}
