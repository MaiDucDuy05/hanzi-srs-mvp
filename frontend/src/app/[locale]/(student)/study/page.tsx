import { Suspense } from 'react';
import { StudyFeature } from '@/features/study/study-feature';
import { PageLoading } from '@/features/ui/components/spinner';

/**
 * Route: /study?levelId=xxx  → học theo cấp HSK
 * Route: /study?topicId=xxx  → học theo chủ đề
 */
export default function StudyPage() {
  return (
    <Suspense fallback={<PageLoading label="Đang tải..." />}>
      <StudyFeature />
    </Suspense>
  );
}
