'use client';

import { TeacherGuard } from '@/features/layout/components/teacher-guard';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <TeacherGuard>{children}</TeacherGuard>;
}
