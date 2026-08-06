'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { PageLoading } from '@/components/ui/spinner';

/**
 * Bọc trang chỉ dành cho giáo viên/admin. Không đủ quyền → redirect home.
 */
export function TeacherGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role !== 'TEACHER' && user.role !== 'ADMIN') router.replace('/');
  }, [loading, user, router]);

  if (loading || !user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
    return <PageLoading label="Đang kiểm tra quyền..." />;
  }
  return <>{children}</>;
}
