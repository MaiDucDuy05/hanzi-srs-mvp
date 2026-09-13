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
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role === 'ADMIN') {
        router.replace('/admin');
      } else if (user.role === 'TEACHER') {
        router.replace('/teacher');
      }
    }
  }, [loading, user, router]);

  if (loading || !user || user.role === 'ADMIN' || user.role === 'TEACHER') {
    return <PageLoading label="Đang chuyển hướng..." />;
  }
  return <>{children}</>;
}
