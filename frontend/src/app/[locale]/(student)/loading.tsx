'use client';

import { PageLoading } from '@/features/ui/components/spinner';
import { useTranslations } from 'next-intl';

export default function Loading() {
  const t = useTranslations('Layout');
  return <PageLoading label={t('loadingLabel')} />;
}
