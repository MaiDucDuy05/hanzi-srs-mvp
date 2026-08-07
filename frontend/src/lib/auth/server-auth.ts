import { cookies } from 'next/headers';
import type { User } from '@/lib/api/types';

/**
 * Auth helper cho Server Components (FE-006): RSC fetch được API auth-gated
 * nhờ cookie HttpOnly — server component đọc `access_token` từ cookie của request
 * và gọi thẳng backend kèm header Cookie. Không dùng apiFetch (client), không cần
 * verify JWT ở frontend — backend là nguồn sự thật (trả 401 nếu cookie hết hạn).
 *
 * Dùng: `const user = await getServerUser()` trong async RSC.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export async function getServerUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get('access_token')?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      // Forward cookie gốc → backend tự parse (cookie-parser). KHÔNG lộ JWT vào URL.
      headers: { Cookie: `access_token=${token}` },
      // Auth trạng thái theo request — không cache.
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: User };
    return body.data ?? null;
  } catch {
    return null;
  }
}
