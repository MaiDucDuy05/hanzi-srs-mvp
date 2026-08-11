import { apiFetch, unwrap } from '../client';
import type { Paginated, Single, Course, CourseLesson } from '../types';
import { toQuery } from './utils';

export const coursesApi = {
  list: (params: { audience?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Course>>(`/courses${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  get: (id: string) => unwrap(apiFetch<Single<Course>>(`/courses/${id}`)),

  listLessons: (params: { courseId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<CourseLesson>>(`/course-lessons${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),
};
