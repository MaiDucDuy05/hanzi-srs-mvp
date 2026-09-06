import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { StudentExamResultFeature } from '@/features/student/student-exam-result-feature';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard');
  return {
    title: t('examResultTitle'),
  };
}

export default function StudentExamResultPage() {
  return <StudentExamResultFeature />;
}
