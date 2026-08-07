import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';
import { Card, CardBody, CardHeader } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Đăng ký tài khoản',
  description: 'Đăng ký tài khoản miễn phí để bắt đầu học tiếng Trung với Hán Tự HSK.',
};

/** RSC (FE-006): shell server render sẵn; form là client island (RegisterForm). */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { next } = await searchParams;
  const safeNext = typeof next === 'string' ? next : undefined;

  return (
    <div className="mx-auto mt-10 max-w-md">
      <Card>
        <CardHeader title="Đăng ký tài khoản" subtitle="Bắt đầu học tiếng Trung miễn phí." />
        <CardBody>
          <RegisterForm next={safeNext} />
        </CardBody>
      </Card>
    </div>
  );
}
