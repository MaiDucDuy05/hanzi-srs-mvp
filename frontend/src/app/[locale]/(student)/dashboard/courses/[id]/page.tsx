import { CourseDetailFeature } from '@/features/dashboard/page-features/course-detail-feature';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <CourseDetailFeature params={params} />;
}
