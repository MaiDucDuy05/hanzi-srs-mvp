'use client'; // Hot reload trigger

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  FolderOpen,
  Settings,
  ShieldAlert,
  GraduationCap,
  Target,
  Activity
} from 'lucide-react';

import { useAuth } from '@/lib/auth/auth-context';
import { LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', title: 'Bảng điều khiển', icon: LayoutDashboard, exact: true },
  { href: '/admin/curriculum', title: 'Nội dung học', icon: BookOpen },
  { href: '/admin/questions', title: 'Câu hỏi luyện tập', icon: Target },
  { href: '/admin/teacher-content', title: 'Quản lý giáo viên', icon: GraduationCap },
  { href: '/admin/users', title: 'Người dùng & Học sinh', icon: Users },
  { href: '/admin/messages', title: 'Tin nhắn & Liên hệ', icon: FolderOpen },
  { href: '/admin/subscriptions', title: 'Gói đăng ký VIP', icon: CreditCard },
  { href: '/admin/rewards', title: 'Phần thưởng & EXP', icon: ShieldAlert },
  { href: '/admin/resources', title: 'Tài nguyên', icon: FolderOpen },
  { href: '/admin/audit-logs', title: 'Nhật ký hệ thống', icon: Activity },
  { href: '/admin/settings', title: 'Cài đặt hệ thống', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  return (
    <aside className="flex h-full w-[280px] flex-col bg-pale-green rounded-tr-3xl rounded-br-3xl p-6 shadow-sm relative">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-forest">Cute Panda Forest</h1>
        <p className="text-xs text-gray-500 mt-1">Cổng Quản Trị Hệ Thống</p>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent-lime text-forest shadow-sm'
                  : 'text-gray-600 hover:bg-light-bamboo hover:text-forest'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm text-forest overflow-hidden border border-gray-200">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id || 'Admin'}`} alt="Admin" className="h-full w-full object-cover" />
          </div>
          <span className="text-sm font-medium text-forest truncate">{user?.fullName || 'Admin User'}</span>
        </div>
        
        <button 
          onClick={async () => {
            await logout();
            router.push('/login');
          }}
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-forest hover:bg-light-bamboo transition-colors rounded-full"
        >
          <LogOut className="h-5 w-5" strokeWidth={2.5} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
