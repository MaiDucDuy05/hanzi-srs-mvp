import type { Metadata } from 'next';
import Link from 'next/link';
import { getServerUser } from '@/lib/auth/server-auth';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { ROLE_LABELS } from '@/lib/utils/constants';

// SEO (P1-1): trang chủ là Server Component — metadata + HTML render sẵn từ server.
export const metadata: Metadata = {
  title: 'Học tiếng Trung, chinh phục HSK',
  description:
    'Hệ thống học từ vựng, ngữ pháp theo cấp độ HSK kết hợp luyện tập, trò chơi và kiểm tra — hoàn toàn miễn phí.',
};

const FEATURES = [
  {
    href: '/learn',
    title: '📚 Học theo cấp độ',
    desc: 'Bài học HSK 1–6 với từ vựng, ngữ pháp và nội dung bài học.',
  },
  {
    href: '/topics',
    title: '🗂️ Chủ đề',
    desc: 'Ôn luyện từ vựng theo chủ đề thực tế, dễ nhớ hơn.',
  },
  {
    href: '/practice',
    title: '✍️ Luyện tập',
    desc: 'Ghép từ, thẻ học, điền khuyết và sắp xếp câu.',
  },
  {
    href: '/games',
    title: '🎮 Trò chơi',
    desc: 'Bóng pinyin, trí nhớ và tập viết chữ Hán.',
  },
  {
    href: '/tests/join',
    title: '📝 Kiểm tra',
    desc: 'Làm đề kiểm tra do giáo viên biên soạn.',
  },
  {
    href: '/resources',
    title: '📄 Tài liệu',
    desc: 'Tải giáo trình, đề thi và tài liệu tham khảo.',
  },
];

/**
 * RSC (FE-006): user đọc server-side từ cookie HttpOnly qua getServerUser()
 * — không phải client fetch, không giật PageLoading, hero đúng trạng thái ngay
 * từ HTML đầu tiên. Trang vẫn public (không auth-gate), chỉ phân biệt CTA theo user.
 */
export default async function HomePage() {
  const user = await getServerUser();

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl bg-linear-to-br from-brand to-brand-dark px-6 py-12 text-center text-white">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Học tiếng Trung, chinh phục HSK
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-white/85">
          Hệ thống học từ vựng, ngữ pháp theo cấp độ HSK kết hợp luyện tập, trò
          chơi và kiểm tra — hoàn toàn miễn phí.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {user ? (
            <>
              <Link href="/learn">
                <Button variant="secondary">Bắt đầu học</Button>
              </Link>
              <Link href="/practice">
                <Button variant="ghost" className="text-white hover:bg-white/15">
                  Luyện tập ngay
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button variant="secondary">Đăng ký miễn phí</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-white/15">
                  Đăng nhập
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Dashboard hub khi đã đăng nhập */}
      {user && (
        <section>
          <Card>
            <CardHeader
              title={<h2 className="text-xl font-bold">Xin chào, {user.fullName}!</h2>}
              subtitle={`Vai trò: ${ROLE_LABELS[user.role]}`}
            />
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  href="/learn"
                  className="rounded-lg border border-gray-200 p-4 text-sm font-medium hover:border-brand hover:text-brand"
                >
                  📚 Học theo cấp độ
                </Link>
                <Link
                  href="/mistake-book"
                  className="rounded-lg border border-gray-200 p-4 text-sm font-medium hover:border-brand hover:text-brand"
                >
                  📓 Sổ tay lỗi sai
                </Link>
                <Link
                  href="/profile"
                  className="rounded-lg border border-gray-200 p-4 text-sm font-medium hover:border-brand hover:text-brand"
                >
                  👤 Hồ sơ của tôi
                </Link>
              </div>
            </CardBody>
          </Card>
        </section>
      )}

      {/* Feature grid */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Tính năng nổi bật</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardBody>
                  <h3 className="font-bold group-hover:text-brand">{f.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
