import { redirect } from 'next/navigation';

export default async function YctLessonRedirect({
  params,
}: {
  params: Promise<{ locale: string; lessonId: string }>;
}) {
  const { locale, lessonId } = await params;
  redirect(`/${locale}/study/yct/${lessonId}`);
}
