import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MistakeBookLayoutBody } from './mistake-book-layout-body';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('MistakeBook');
  return {
    title: t('metaTitle'),
  };
}

export default function MistakeBookLayout({ children }: { children: React.ReactNode }) {
  return <MistakeBookLayoutBody>{children}</MistakeBookLayoutBody>;
}
