import { PageLoading } from '@/features/ui/components/spinner';
import { getTranslations } from 'next-intl/server';

export default async function Loading() {
  const t = await getTranslations('Layout');
  return <PageLoading label={t('loadingLabel')} />;
}
