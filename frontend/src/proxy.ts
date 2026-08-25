import { NextRequest, NextResponse } from 'next/server';

/**
 * Route protection server-side (FE-006). Auth qua HttpOnly cookie `access_token`:
 * - Proxy (tên mới của middleware trong Next 16) chạy trên server/edge → đọc được
 *   cookie (điểm khác biệt so với mô hình localStorage cũ khiến FE-006 bị hoãn).
 * - Chặn sớm trước khi client render: chưa đăng nhập → `/login?next=...`;
 *   sai quyền → `/`. Backend vẫn là nguồn sự thật (guard các controller) —
 *   proxy là defense-in-depth + trải nghiệm (không chờ JS hydrate).
 * - Decode payload JWT (KHÔNG verify chữ ký — chạy edge, không có secret backend;
 *   chỉ dùng để đọc role/exp cho redirect. Backend tự verify cookie thật).
 */

export const ACCESS_TOKEN_COOKIE = 'access_token';

/** Route yêu cầu đăng nhập — khớp AuthGuard client-side ở từng page. */
const AUTH_REQUIRED = [
  '/dashboard',
  '/practice',
  '/games',
  '/tests',
  '/teacher',
  '/admin',
  '/profile',
  '/mistake-book',
  '/topics',
  '/resources',
  '/upgrade-vip',
] as const;

/** Chỉ ADMIN (khớp AdminGuard). */
const ADMIN_ONLY = ['/admin'] as const;

/** TEACHER hoặc ADMIN (khớp TeacherGuard). */
const TEACHER_OR_ADMIN = ['/teacher'] as const;

/** Trang đăng nhập/đăng ký — đã có phiên thì không vào. */
const AUTH_PAGES = ['/login', '/register', '/forgot-password'] as const;

interface JwtPayload {
  sub?: string;
  role?: string;
  exp?: number;
}

/** Decode payload JWT (base64url → UTF-8). Edge-safe: atob + TextDecoder, không Buffer. */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload = ''] = token.split('.');
    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return typeof json === 'object' && json !== null ? (json as JwtPayload) : null;
  } catch {
    return null;
  }
}

/** Prefix route khớp: `/learn` hoặc `/learn/...`. */
function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function proxy(req: NextRequest) {
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const authed =
    !!payload && (typeof payload.exp !== 'number' || payload.exp * 1000 > Date.now());
  const role = payload?.role ?? null;
  const { pathname } = req.nextUrl;

  // 1) Trang cần đăng nhập mà chưa có phiên hợp lệ → về login (kèm next để quay lại).
  if (AUTH_REQUIRED.some((p) => matches(pathname, p)) && !authed) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2) Trang login/register mà đã có phiên → về trang chủ.
  if (AUTH_PAGES.some((p) => pathname === p) && authed) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 3) Phân quyền admin/teacher (đã xác thực) → về trang chủ nếu không đủ quyền.
  if (ADMIN_ONLY.some((p) => matches(pathname, p)) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (
    TEACHER_OR_ADMIN.some((p) => matches(pathname, p)) &&
    role !== 'TEACHER' &&
    role !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/practice/:path*',
    '/games/:path*',
    '/tests/:path*',
    '/teacher/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/mistake-book/:path*',
    '/topics/:path*',
    '/resources/:path*',
    '/upgrade-vip/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
