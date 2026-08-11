'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

const HEADER_NAV = [
  { href: '/teacher', title: 'Dashboard', exact: true },
  { href: '/teacher/classes', title: 'Classes' },
  { href: '/teacher/reports', title: 'Reports' },
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
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search library..." 
            className="pl-10 pr-4 py-2 bg-[#f0f2f5] rounded-full text-[13px] font-medium w-64 border-none outline-none focus:ring-2 focus:ring-[#eaf3c5] transition-all"
          />
        </div>

        <button className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1f5333] hover:border-gray-300 transition-colors shrink-0">
          <Bell className="h-5 w-5" />
        </button>
        
        <button className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden hover:ring-2 hover:ring-[#c7cf35] transition-all">
          <img 
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id || 'Teacher'}`} 
            alt="Profile" 
            className="h-full w-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}
