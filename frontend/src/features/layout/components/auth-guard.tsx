'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { PageLoading } from '@/features/ui/components/spinner';

/**
 * Bọc trang yêu cầu đăng nhập. Nếu chưa có user → redirect /login.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return <PageLoading label="Đang kiểm tra đăng nhập..." />;
  return <>{children}</>;
}
