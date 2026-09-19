'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Users, 
  GraduationCap, 
  FileCheck, 
  BrainCircuit,
  Plus,
  Settings,
  HelpCircle,
  LogOut,
  Database,
  LayoutDashboard,
  BarChart,
  BookOpenCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/teacher', title: 'Tổng quan', icon: LayoutDashboard },
  { href: '/teacher/students', title: 'Học sinh', icon: GraduationCap },
  { href: '/teacher/exams', title: 'Đề thi', icon: FileCheck },
  { href: '/teacher/questions', title: 'Ngân hàng câu hỏi', icon: Database },
  { href: '/teacher/hskk-grading', title: 'Chấm bài thi', icon: BookOpenCheck },
  { href: '/teacher/exam-statistics', title: 'Thống kê điểm', icon: BarChart },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex h-full w-[260px] flex-col bg-[#fcfce8] p-6 shadow-sm border-r border-[#f3f4e1] relative">
      <div className="mb-8 flex items-center gap-3">
        <img src="/assets/images/logo/logo-mark.png" alt="Mầm Tre Hoa Ngữ" className="h-10 w-10 object-contain" />
        <div>
          <h1 className="text-base font-bold text-[#1f5333] leading-tight">Mầm Tre Hoa Ngữ</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Cổng Giáo Viên</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          // Normalize pathname (remove trailing slash)
          const cleanPath = pathname?.replace(/\/$/, '') || '';
          const cleanHref = item.href.replace(/\/$/, '');
          const isActive = cleanHref === '/teacher' 
            ? cleanPath === '/teacher'
            : cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-[13px] font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-[#eaf3c5] text-[#1f5333] shadow-sm border-2 border-[#c7cf35]/60'
                  : 'text-gray-600 hover:bg-[#f3f4e1]/50 hover:text-[#1f5333]'
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 2} />
              {item.title}
            </Link>
          );
        })}
      </nav>


      <div className="mt-8 mb-6">
        <Link 
          href="/teacher/exams"
          className="w-full bg-[#1f5333] text-white px-4 py-3 rounded-xl text-[13px] font-bold hover:bg-[#1f4e31] transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          Tạo giáo án mới
        </Link>
      </div>

      <div className="pt-6 border-t border-[#eaf3c5] space-y-1">
        <Link href="/teacher/settings" className="flex items-center gap-4 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-600 hover:bg-[#f3f4e1]/50 hover:text-[#11321e] transition-colors">
          <Settings className="h-[18px] w-[18px]" />
          Cài đặt
        </Link>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-4 rounded-xl px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
