import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { StudentExamsFeature } from '@/features/student/student-exams-feature';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard');
  return {
    title: t('examsListTitle'),
  };
}

export default function StudentExamsPage() {
  return <StudentExamsFeature />;
}
