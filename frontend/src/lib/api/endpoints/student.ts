import { apiFetch } from '../client';
import type { StudentProgress } from '../types';

export interface LessonProgressItem {
  id: string;
  title: string;
  progress: number;
}

export const studentApi = {
  getProgress: (): Promise<StudentProgress> =>
    apiFetch<{ data: StudentProgress }>('/student/progress').then((r) => r.data),

  getRecommendedLessons: (): Promise<LessonProgressItem[]> =>
    apiFetch<{ data: LessonProgressItem[] }>('/student/recommended-lessons').then(
      (r) => r.data,
    ),
};
