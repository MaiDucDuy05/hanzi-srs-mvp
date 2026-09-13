'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

const HEADER_NAV = [
  { href: '/teacher', title: 'Tổng quan', exact: true },
];

export function TeacherHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-10 flex items-center justify-between border-b border-gray-100/50">
      
      {/* Top Navigation */}
      <nav className="flex items-center gap-8">
        {HEADER_NAV.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-bold transition-colors ${
                isActive 
                  ? 'text-[#1f5333]' 
                  : 'text-gray-400 hover:text-[#1f5333]'
              }`}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-5">
        <button className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1f5333] hover:border-gray-300 transition-colors shrink-0">
          <Bell className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
            <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id || 'Teacher'}`} 
              alt="Profile" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-black text-[#1f5333] leading-tight">{user?.fullName || 'Giáo viên HSK'}</p>
            <p className="text-[10px] text-gray-400 font-bold tracking-wide">Chủ nhiệm lớp HSK</p>
          </div>
        </div>
      </div>
    </header>
  );
}
