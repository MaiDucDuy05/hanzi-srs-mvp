import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';
import { Card, CardBody, CardHeader } from '@/features/ui/components/card';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào Hán Tự HSK để tiếp tục học tiếng Trung.',
};

/**
 * RSC (FE-006): shell server render sẵn; form là client island (LoginForm).
 * `next` (từ middleware ?next= khi chặn route) được đọc server-side và truyền
 * xuống form để sau đăng nhập quay lại đúng trang định truy cập.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { next } = await searchParams;
  const safeNext = typeof next === 'string' ? next : undefined;

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <CardHeader title="Đăng nhập" subtitle="Chào mừng bạn quay lại!" />
        <CardBody>
          <LoginForm next={safeNext} />
        </CardBody>
      </Card>
    </div>
  );
}
