import { SentenceGameFeature } from '@/features/games/page-features/sentence-game-feature';
import { SourceType } from '@/lib/api/types';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function SentenceGamePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; lesson?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode;
  const id = params.lesson;

  let type: SourceType = 'LESSON';
  if (mode === 'hsk') type = 'LEVEL';
  else if (mode === 'topic') type = 'TOPIC';

  if (!id) {
    const t = await getTranslations('Games');
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('practiceNotFound')}</h1>
        <p className="text-gray-600 mb-6">{t('practiceNotFoundDesc')}</p>
        <Link href="/dashboard/courses" className="px-6 py-2 bg-[#215b3b] text-white rounded-lg hover:bg-[#1a4a2f] transition-colors">
          {t('backToCourses')}
        </Link>
      </div>
    );
  }

  return <SentenceGameFeature sourceType={type} sourceId={id} />;
}
