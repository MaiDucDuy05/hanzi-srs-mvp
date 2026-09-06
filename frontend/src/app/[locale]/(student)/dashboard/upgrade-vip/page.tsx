import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { UpgradeVipFeature } from '@/features/student/upgrade-vip-feature';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Vip');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function UpgradeVipPage() {
  return <UpgradeVipFeature />;
}
