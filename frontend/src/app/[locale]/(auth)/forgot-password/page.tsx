import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth.forgotPassword');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations('Auth.forgotPassword');

  return (
    <div className="relative flex flex-1 w-full min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-[#415e44]">
        <Image
          src="/images/auth-bg.jpg"
          alt={t('imageAlt')}
          fill
          className="object-cover opacity-80 mix-blend-overlay"
          priority
        />
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
