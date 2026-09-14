import { Suspense } from 'react';
import { HanziWritingSelectionFeature } from '@/features/practice/hanzi-writing-selection-feature';
import { PageLoading } from '@/features/ui/components/spinner';
import { getTranslations } from 'next-intl/server';

export default async function HanziWritingPage() {
  const t = await getTranslations('Common');
  return (
    <Suspense fallback={<PageLoading label={t('loading')} />}>
      <HanziWritingSelectionFeature />
    </Suspense>
  );
}
