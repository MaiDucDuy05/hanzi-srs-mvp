'use client';

import { TeacherGuard } from '@/components/layout/teacher-guard';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <TeacherGuard>{children}</TeacherGuard>;
}
