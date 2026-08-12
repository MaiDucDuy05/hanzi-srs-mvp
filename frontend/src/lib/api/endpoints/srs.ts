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
   * Lấy tiến độ SRS của user cho một bài học.
   * @param lessonId - ID bài học để lọc progress
   * @returns Record<vocabularyId, UserVocabProgress>
   */
  getProgress: (lessonId: string): Promise<Record<string, UserVocabProgress>> =>
    apiFetch<{ data: Record<string, UserVocabProgress> }>(
      `/srs/progress?lessonId=${lessonId}`,
    ).then((r) => r.data),
};
