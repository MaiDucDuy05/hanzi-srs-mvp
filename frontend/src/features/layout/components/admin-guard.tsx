'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { PageLoading } from '@/features/ui/components/spinner';

/** Bọc trang chỉ dành cho quản trị viên. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role !== 'ADMIN') router.replace('/');
  }, [loading, user, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return <PageLoading label="Đang kiểm tra quyền..." />;
  }
  return <>{children}</>;
}
