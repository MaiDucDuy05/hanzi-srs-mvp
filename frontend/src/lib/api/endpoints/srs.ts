import { apiFetch } from '../client';
import type { UserVocabProgress } from '../types';

export const srsApi = {
  /**
   * Gửi đánh giá sau khi học flashcard.
   * @param vocabularyId - ID của từ vựng vừa ôn
   * @param rating - AGAIN | HARD | GOOD | EASY
   */
  submitReview: (vocabularyId: string, rating: string) =>
    apiFetch<{ data: UserVocabProgress }>('/srs/review', {
      method: 'POST',
      body: JSON.stringify({ vocabularyId, rating }),
    }).then((r) => r.data),

  /**
   * Lấy tiến độ SRS của user cho một lesson / level / topic.
   * @param key - lessonId | levelId | topicId
   * @param type - 'lesson' | 'level' | 'topic'
   * @returns Record<vocabularyId, UserVocabProgress>
   */
  getProgress(key: string, type: 'lesson' | 'level' | 'topic'): Promise<Record<string, UserVocabProgress>> {
    const params = type === 'lesson'
      ? `lessonId=${key}`
      : type === 'level'
        ? `levelId=${key}`
        : `topicId=${key}`;
    return apiFetch<{ data: Record<string, UserVocabProgress> }>(`/srs/progress?${params}`).then((r) => r.data);
  },
};
