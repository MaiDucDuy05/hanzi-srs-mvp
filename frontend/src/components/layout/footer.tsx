import Link from 'next/link';
import { APP_NAME } from '@/lib/utils/constants';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-6 dark:border-gray-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-gray-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {APP_NAME} — Nền tảng học tiếng Trung & luyện thi HSK
        </p>
        <div className="flex gap-4">
          <Link href="/contact" className="hover:text-brand">
            Liên hệ
          </Link>
          <Link href="/resources" className="hover:text-brand">
            Tài liệu
          </Link>
          <Link href="/upgrade-vip" className="hover:text-brand">
            Nâng cấp VIP
          </Link>
        </div>
      </div>
    </footer>
  );
}
