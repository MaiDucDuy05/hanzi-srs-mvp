import { apiFetch } from '../client';
import type { UserLessonProgress } from '../types';

export interface LessonProgressItem {
  id: string;
  title: string;
  progress: number;
}

export const studentApi = {
  getRecommendedLessons: (): Promise<LessonProgressItem[]> =>
    apiFetch<{ data: LessonProgressItem[] }>('/student/recommended-lessons').then(
      (r) => r.data,
    ),
  
  getLessonProgress: (lessonId: string): Promise<UserLessonProgress> =>
    apiFetch<{ data: UserLessonProgress }>(`/student/progress/lesson/${lessonId}`).then((r) => r.data),
    
  getLevelLessonProgress: (levelId: string): Promise<UserLessonProgress[]> =>
    apiFetch<{ data: UserLessonProgress[] }>(`/student/progress/level/${levelId}`).then((r) => r.data),
    
  completeLessonVocab: (lessonId: string): Promise<UserLessonProgress> =>
    apiFetch<{ data: UserLessonProgress }>(`/student/progress/lesson/${lessonId}/complete-vocab`, { method: 'POST' }).then((r) => r.data),
    
  completeLessonGrammar: (lessonId: string): Promise<UserLessonProgress> =>
    apiFetch<{ data: UserLessonProgress }>(`/student/progress/lesson/${lessonId}/complete-grammar`, { method: 'POST' }).then((r) => r.data),
};
