import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { StudentExamTakingPage } from '@/features/student/student-exam-taking-page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard');
  return {
    title: t('examTakingTitle'),
  };
}

export default function TakeExamPage() {
  return <StudentExamTakingPage />;
}
