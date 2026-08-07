import type { Metadata } from 'next';
import { getServerUser } from '@/lib/auth/server-auth';
import { HeroSection } from '@/components/home/hero-section';

// SEO (P1-1): trang chủ là Server Component — metadata + HTML render sẵn từ server.
export const metadata: Metadata = {
  title: 'Hán Tự HSK — Học tiếng Trung trong khu rừng tre',
  description:
    'Học từ vựng, trò chơi và bài kiểm tra HSK — vui như chơi, nhớ lâu như tre. Hệ thống học tiếng Trung và luyện thi HSK hoàn toàn miễn phí.',
};

/**
 * RSC (FE-006): user đọc server-side từ cookie HttpOnly qua getServerUser().
 * Trang chủ hiện tại chỉ có một layout riêng biệt duy nhất là HeroSection.
 */
export default async function HomePage() {
  const user = await getServerUser();

  return (
    <div className="w-full flex-1">
      <HeroSection user={user} />
    </div>
  );
}
