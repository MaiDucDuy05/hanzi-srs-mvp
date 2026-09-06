import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ContactForm } from '@/features/contact/components/contact-form';
import Image from 'next/image';
import { Mail } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Contact');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function ContactPage() {
  const t = await getTranslations('Contact');

  return (
    <div className="flex flex-1 items-center justify-center p-4 py-12 md:py-20 w-full relative">
      {/* Glow background effect */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#eaf4eb] rounded-full blur-[100px] -translate-y-1/2 opacity-70 z-0"></div>

      {/* Main Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden relative z-10 border border-gray-100">

        {/* Left Side (Info Panel) */}
        <div className="bg-[#f5f5e9] w-full md:w-[35%] p-8 md:p-10 flex flex-col items-center justify-center text-center">
          {/* Avatar / Logo */}
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-sm overflow-hidden mb-6 relative bg-white flex items-center justify-center">
            <Image
              src="/assets/illustrations/panda/panda-bamboo-circle.svg"
              alt={t('imageAlt')}
              width={100}
              height={100}
              className="object-contain"
            />
          </div>

          <h3 className="text-xl font-bold text-[#1a472a] mb-2 font-serif">{t('supportTitle')}</h3>
          <p className="text-sm text-gray-600 mb-8 max-w-[200px]">
            {t('supportTagline')}
          </p>

          <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-[#1a472a] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#2e5e3d]" />
            {t('supportEmail')}
          </div>
        </div>

        {/* Right Side (Form Panel) */}
        <div className="w-full md:w-[65%] p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-[#1a472a] mb-2 font-serif">{t('heading')}</h1>
          <p className="text-sm text-gray-500 mb-8">
            {t('subheading')}
          </p>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}
