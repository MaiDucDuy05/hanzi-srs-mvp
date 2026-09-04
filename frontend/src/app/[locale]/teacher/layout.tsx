'use client';

import { TeacherGuard } from '@/features/layout/components/teacher-guard';
import { TeacherSidebar } from '@/features/teacher/components/teacher-sidebar';
import { TeacherHeader } from '@/features/teacher/components/teacher-header';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <TeacherGuard>
      <div className="flex h-screen bg-white text-gray-900 overflow-hidden font-sans">
        <TeacherSidebar />
        
        <div className="flex flex-1 flex-col overflow-hidden relative bg-white">
          <TeacherHeader />
          
          <main className="flex-1 overflow-y-auto p-10 relative">
            {children}
          </main>
        </div>
      </div>
    </TeacherGuard>
  );
}
