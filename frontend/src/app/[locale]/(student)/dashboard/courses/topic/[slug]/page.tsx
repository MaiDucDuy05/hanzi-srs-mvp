import { TopicDetailFeature } from '@/features/dashboard/page-features/topic-detail-feature';

export default function TopicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <TopicDetailFeature params={params} />;
}
