import React from 'react';
import { YctLessonPlayView } from '@/features/yct/yct-lesson-play-view';

export const metadata = {
  title: 'Bài Học & Trò Chơi YCT | Tiếng Trung Trẻ Em',
};

export default async function YctStudyLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return <YctLessonPlayView lessonId={lessonId} />;
}
