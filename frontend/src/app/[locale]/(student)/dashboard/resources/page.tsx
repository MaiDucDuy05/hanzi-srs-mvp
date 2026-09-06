import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { StudentResourcesFeature } from '@/features/student/student-resources-feature';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Dashboard');
  return {
    title: t('resourcesTitle'),
    description: t('resourcesDescription'),
  };
}

export default function StudentResourcesPage() {
  return (
    <div className="p-6">
      <StudentResourcesFeature />
    </div>
  );
}
