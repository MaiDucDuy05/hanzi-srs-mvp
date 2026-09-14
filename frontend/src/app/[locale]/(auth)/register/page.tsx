import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { RegisterForm } from '@/features/auth/components/register-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Auth.register');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { next } = await searchParams;
  const safeNext = typeof next === 'string' ? next : undefined;
  const t = await getTranslations('Auth.register');

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

      {/* Form Card */}
      <div className="w-full max-w-md px-8 py-10 bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1a472a] mb-2 text-center">
          {t('heading')}
        </h1>
        <p className="text-gray-600 mb-8 text-sm md:text-base text-center">
          {t('subheading')}
        </p>

        <RegisterForm next={safeNext} />
      </div>
    </div>
  );
}
