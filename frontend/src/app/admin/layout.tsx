import { ReactNode } from 'react';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-off-white overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 h-full overflow-y-auto bg-white p-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
