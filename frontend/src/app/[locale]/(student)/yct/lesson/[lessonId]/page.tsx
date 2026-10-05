import { redirect } from '@/i18n/routing';

export default async function YctLessonRedirect({
  params,
}: {
  params: Promise<{ locale: string; lessonId: string }>;
}) {
  const { locale, lessonId } = await params;
  redirect({ href: `/study/yct/${lessonId}`, locale });
}
