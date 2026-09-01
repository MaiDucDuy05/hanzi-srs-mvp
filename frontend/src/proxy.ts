import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export const ACCESS_TOKEN_COOKIE = 'access_token';

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

const ADMIN_ONLY = ['/admin'] as const;
const TEACHER_OR_ADMIN = ['/teacher'] as const;
const AUTH_PAGES = ['/login', '/register', '/forgot-password'] as const;

interface JwtPayload {
  sub?: string;
  role?: string;
  exp?: number;
}

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

function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function proxy(req: NextRequest) {
  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const authed =
    !!payload && (typeof payload.exp !== 'number' || payload.exp * 1000 > Date.now());
  const role = payload?.role ?? null;
  
  let { pathname } = req.nextUrl;
  
  // Lấy locale từ URL nếu có
  let locale = routing.defaultLocale;
  for (const loc of routing.locales) {
    if (pathname === `/${loc}`) {
      pathname = '/';
      locale = loc;
      break;
    } else if (pathname.startsWith(`/${loc}/`)) {
      pathname = pathname.slice(loc.length + 1);
      locale = loc;
      break;
    }
  }

  // 1) Trang cần đăng nhập mà chưa có phiên hợp lệ → về login (kèm next để quay lại).
  if (AUTH_REQUIRED.some((p) => matches(pathname, p)) && !authed) {
    const loginUrl = new URL(`/${locale}/login`, req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2) Trang login/register mà đã có phiên → về trang chủ.
  if (AUTH_PAGES.some((p) => pathname === p) && authed) {
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  // 3) Phân quyền admin/teacher (đã xác thực) → về trang chủ nếu không đủ quyền.
  if (ADMIN_ONLY.some((p) => matches(pathname, p)) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }
  if (
    TEACHER_OR_ADMIN.some((p) => matches(pathname, p)) &&
    role !== 'TEACHER' &&
    role !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  // 4) Chạy i18n proxy cho phép next-intl xử lý routing và cookies
  return intlMiddleware(req);
}

export const config = {
  // Khớp tất cả các đường dẫn trừ API, _next/static, _next/image, và các file tĩnh (.ico, .png, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/(vi|en)/:path*']
};
