import { StudyLessonFeature } from '@/features/student/study-lesson-feature';

export default function StudyLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  return <StudyLessonFeature params={params} />;
}
