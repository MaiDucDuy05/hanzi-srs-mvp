import type { SourceType } from '@/lib/api/types';
import { WriteSentenceFeature } from '@/features/games/page-features/write-sentence-feature';

export default async function WriteSentencePage({
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
    return (
      <div className='flex-1 flex flex-col items-center justify-center h-full min-h-screen'>
        <p className='text-gray-500 font-medium'>Chọn một bài học để bắt đầu.</p>
      </div>
    );
  }

  return <WriteSentenceFeature sourceId={id} sourceType={type} />;
}
