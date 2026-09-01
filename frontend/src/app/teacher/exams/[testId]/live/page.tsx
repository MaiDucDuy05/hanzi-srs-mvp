import { LiveHostFeature } from '@/features/live-quiz/host/live-host-feature';

export default async function TeacherLiveExamPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  return <LiveHostFeature testId={testId} />;
}
