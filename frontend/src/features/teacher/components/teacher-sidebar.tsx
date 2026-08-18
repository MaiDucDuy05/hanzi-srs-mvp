'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Users, 
  GraduationCap, 
  FileCheck, 
  BookOpenCheck, 
  BrainCircuit,
  Plus,
  Settings,
  HelpCircle,
  LogOut,
  Database,
  LayoutDashboard
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/teacher', title: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher/students', title: 'Students', icon: GraduationCap },
  { href: '/teacher/exams', title: 'Exams', icon: FileCheck },
  { href: '/teacher/questions', title: 'Question Bank', icon: Database },
  { href: '/teacher/hskk-grading', title: 'HSKK Grading', icon: BookOpenCheck },
  { href: '/teacher/ai-library', title: 'AI Library', icon: BrainCircuit },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex h-full w-[260px] flex-col bg-[#fcfce8] p-6 shadow-sm border-r border-[#f3f4e1] relative">
      <div className="mb-10 flex flex-col items-center text-center mt-4">
        <div className="h-16 w-16 bg-[#d9e6d8] rounded-full flex items-center justify-center mb-3 shadow-inner overflow-hidden border-2 border-white">
           <img src="https://api.dicebear.com/7.x/bottts/svg?seed=panda" alt="Logo" className="h-12 w-12 object-cover" />
        </div>
        <h1 className="text-xl font-extrabold text-[#1f5333] tracking-tight">Cute Panda Forest</h1>
        <p className="text-[10px] text-gray-500 font-medium tracking-wide mt-1">Wise Guardian Portal</p>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/teacher' 
            ? pathname === '/teacher'
            : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-[13px] font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-[#eaf3c5] text-[#1f5333] shadow-sm'
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
        <button className="w-full bg-[#1f5333] text-white px-4 py-3 rounded-xl text-[13px] font-bold hover:bg-[#1f4e31] transition-colors shadow-sm flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" strokeWidth={3} />
          New Lesson Plan
        </button>
      </div>

      <div className="pt-6 border-t border-[#eaf3c5] space-y-1">
        <Link href="/teacher/settings" className="flex items-center gap-4 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-600 hover:bg-[#f3f4e1]/50 hover:text-[#11321e] transition-colors">
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>
        <Link href="/teacher/support" className="flex items-center gap-4 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-600 hover:bg-[#f3f4e1]/50 hover:text-[#11321e] transition-colors">
          <HelpCircle className="h-[18px] w-[18px]" />
          Support
        </Link>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-4 rounded-xl px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
