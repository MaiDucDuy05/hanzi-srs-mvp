import { Suspense } from 'react';
import { HanziWritingSelectionFeature } from '@/features/practice/hanzi-writing-selection-feature';
import { PageLoading } from '@/features/ui/components/spinner';

export default function HanziWritingPage() {
  return (
    <Suspense fallback={<PageLoading label="Đang tải..." />}>
      <HanziWritingSelectionFeature />
    </Suspense>
  );
}
