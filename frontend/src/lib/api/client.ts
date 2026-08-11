/**
 * API client — fetch wrapper cho backend NestJS (api/v1).
 * - Auth qua HttpOnly cookie (access_token): browser tự gửi mỗi request,
 *   frontend KHÔNG đọc/touch token (đã xoá TOKEN_KEY + interceptor header).
 * - Mọi call đi cùng origin (/api/v1) — Next rewrite proxy → backend,
 *   nên cookie được gửi tự động mà không cần CORS.
 * - Giải nén envelope { data, message }.
 * - Ném ApiError với message thân thiện từ backend.
 */

// Cùng origin (Next rewrite /api/v1/* → backend) để cookie HttpOnly tự gửi.
const BASE_URL = '/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = RequestInit & {
  auth?: boolean;
  /**
   * Mặc định 'application/json'. Truyền `false` cho multipart/form-data
   * (body = FormData) để browser tự đặt Content-Type kèm boundary.
   */
  contentType?: string | false;
};

/**
 * Gọi API. Mặc định gắn cookie HttpOnly access_token; truyền
 * `auth: false` cho endpoint public để 401 không kích hoạt đăng xuất.
 * Trả về body JSON đã parse (chưa bóc envelope — dùng helper `unwrap` nếu cần).
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { auth = true, contentType = 'application/json', headers, ...rest } = options;
  const retries = 2;

  let res: Response | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      res = await fetch(`${BASE_URL}${path}`, {
        ...rest,
        credentials: 'include',
        headers: {
          ...(contentType !== false ? { 'Content-Type': contentType } : {}),
          ...(headers as Record<string, string> | undefined),
        },
      });

      // Break out of retry loop if it's a successful response or client error (4xx)
      // We only retry network failures or 5xx server errors
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        break;
      }

      if (res.status >= 500) {
        throw new Error(`Server Error: ${res.status}`);
      }
    } catch {
      if (attempt < retries) {
        // Exponential backoff: 500ms, 1000ms
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
      } else if (!res) {
        throw new ApiError('Không kết nối được máy chủ. Vui lòng thử lại.', 0);
      }
    }
  }

  // Safety fallback if res is somehow null (e.g. fetch throws consistently)
  if (!res) {
    throw new ApiError('Không kết nối được máy chủ. Vui lòng thử lại.', 0);
  }

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // response không phải JSON (vd 204)
  }

  if (!res.ok) {
    // Token hết hạn/không hợp lệ: báo AuthProvider để chuyển về /login
    // (không áp dụng cho endpoint public như login/register — auth=false).
    if (res.status === 401 && auth) {
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
