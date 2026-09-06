import { Suspense } from 'react';
import { StudyFeature } from '@/features/study/study-feature';
import { PageLoading } from '@/features/ui/components/spinner';
import { getTranslations } from 'next-intl/server';

export default async function StudyPage() {
  const t = await getTranslations('Common');
  return (
    <Suspense fallback={<PageLoading label={t('loading')} />}>
      <StudyFeature />
    </Suspense>
  );
}
