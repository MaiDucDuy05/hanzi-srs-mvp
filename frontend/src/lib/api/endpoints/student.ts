import { apiFetch } from '../client';
import type { StudentProgress } from '../types';

export const studentApi = {
  getProgress: (): Promise<StudentProgress> =>
    apiFetch<{ data: StudentProgress }>('/student/progress').then((r) => r.data),
};
