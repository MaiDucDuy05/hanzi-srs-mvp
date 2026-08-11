/**
 * Nạp từ vựng theo nguồn luyện tập (PR-03/04/09/10/11/12).
 * - LEVEL: toàn bộ từ vựng của cấp.
 * - LESSON: từ vựng của cấp chứa bài học.
 * - TOPIC: từ vựng gắn trong chủ đề.
 */
import { curriculumApi } from '@/lib/api/endpoints';
import type { SourceType, Vocabulary } from '@/lib/api/types';

export async function loadSourceVocab(
  sourceType: SourceType,
  sourceId: string,
): Promise<Vocabulary[]> {
  if (sourceType === 'LEVEL') {
    return curriculumApi.listVocabularies({ levelId: sourceId, status: 'PUBLISHED' });
  }

  if (sourceType === 'LESSON') {
    const lesson = await curriculumApi.getLesson(sourceId);
    return curriculumApi.listVocabularies({ levelId: lesson.levelId, status: 'PUBLISHED' });
  }

  // TOPIC
  const links = await curriculumApi.listTopicVocabularies({ topicId: sourceId });
  const vocabs = await Promise.all(
    links.map((l) => curriculumApi.getVocabulary(l.vocabularyId)),
  );
  return vocabs.filter((v) => v.status === 'PUBLISHED');
}
