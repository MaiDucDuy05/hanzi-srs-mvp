import { apiFetch } from '../client';

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
};
