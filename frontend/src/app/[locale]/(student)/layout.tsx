'use client';

import { AuthGuard } from '@/features/layout/components/auth-guard';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
