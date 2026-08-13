import { apiFetch, unwrap } from '../client';
import type { Paginated, Single, HskLevel, Lesson, Vocabulary, GrammarPoint, LessonContent, Topic, TopicVocabulary, LessonContentsAggregate, Assignment, LessonSelectionOverview } from '../types';
import { toQuery } from './utils';

export const curriculumApi = {
  listLevels: (params: { page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<HskLevel>>(`/hsk-levels${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  getLevel: (id: string) => unwrap(apiFetch<Single<HskLevel>>(`/hsk-levels/${id}`)),

  createLevel: (data: Partial<HskLevel>) =>
    unwrap(apiFetch<Single<HskLevel>>('/hsk-levels', { method: 'POST', body: JSON.stringify(data) })),

  updateLevel: (id: string, data: Partial<HskLevel>) =>
    unwrap(apiFetch<Single<HskLevel>>(`/hsk-levels/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  deleteLevel: (id: string) => apiFetch(`/hsk-levels/${id}`, { method: 'DELETE' }),

  listLessons: (params: { levelId?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Lesson>>(`/lessons${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  getLesson: (id: string) => unwrap(apiFetch<Single<Lesson>>(`/lessons/${id}`)),

  getLessonContents: (lessonId: string) =>
    apiFetch<{ data: LessonContentsAggregate }>(`/lessons/${lessonId}/contents`).then((r) => r.data),

  createLesson: (data: Partial<Lesson>) =>
    unwrap(apiFetch<Single<Lesson>>('/lessons', { method: 'POST', body: JSON.stringify(data) })),

  updateLesson: (id: string, data: Partial<Lesson>) =>
    unwrap(apiFetch<Single<Lesson>>(`/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  deleteLesson: (id: string) => apiFetch(`/lessons/${id}`, { method: 'DELETE' }),

  listVocabularies: (params: { levelId?: string; topicId?: string; status?: string; search?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Vocabulary>>(`/vocabularies${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  getVocabulary: (id: string) => unwrap(apiFetch<Single<Vocabulary>>(`/vocabularies/${id}`)),

  createVocabulary: (data: Partial<Vocabulary>) =>
    unwrap(apiFetch<Single<Vocabulary>>('/vocabularies', { method: 'POST', body: JSON.stringify(data) })),

  updateVocabulary: (id: string, data: Partial<Vocabulary>) =>
    unwrap(apiFetch<Single<Vocabulary>>(`/vocabularies/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  deleteVocabulary: (id: string) => apiFetch(`/vocabularies/${id}`, { method: 'DELETE' }),

  listGrammar: (params: { levelId?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<GrammarPoint>>(`/grammar-points${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  createGrammar: (data: Partial<GrammarPoint>) =>
    unwrap(apiFetch<Single<GrammarPoint>>('/grammar-points', { method: 'POST', body: JSON.stringify(data) })),

  updateGrammar: (id: string, data: Partial<GrammarPoint>) =>
    unwrap(apiFetch<Single<GrammarPoint>>(`/grammar-points/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  deleteGrammar: (id: string) => apiFetch(`/grammar-points/${id}`, { method: 'DELETE' }),

  listLessonContents: (params: { lessonId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<LessonContent>>(`/lesson-contents${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  createLessonContent: (data: Partial<LessonContent>) =>
    unwrap(apiFetch<Single<LessonContent>>('/lesson-contents', { method: 'POST', body: JSON.stringify(data) })),

  updateLessonContent: (id: string, data: Partial<LessonContent>) =>
    unwrap(apiFetch<Single<LessonContent>>(`/lesson-contents/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  deleteLessonContent: (id: string) => apiFetch(`/lesson-contents/${id}`, { method: 'DELETE' }),

  listTopics: (params: { status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Topic>>(`/topics${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  getTopic: (id: string) => unwrap(apiFetch<Single<Topic>>(`/topics/${id}`)),

  createTopic: (data: Partial<Topic>) =>
    unwrap(apiFetch<Single<Topic>>('/topics', { method: 'POST', body: JSON.stringify(data) })),

  updateTopic: (id: string, data: Partial<Topic>) =>
    unwrap(apiFetch<Single<Topic>>(`/topics/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  deleteTopic: (id: string) => apiFetch(`/topics/${id}`, { method: 'DELETE' }),

  listTopicVocabularies: (params: { topicId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<TopicVocabulary>>(`/topic-vocabularies${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  createTopicVocabulary: (data: Partial<TopicVocabulary>) =>
    unwrap(apiFetch<Single<TopicVocabulary>>('/topic-vocabularies', { method: 'POST', body: JSON.stringify(data) })),

  deleteTopicVocabulary: (id: string) => apiFetch(`/topic-vocabularies/${id}`, { method: 'DELETE' }),

  // Lesson selection overview — aggregate HSK, Topics, Assignments, Mistake stats
  getLessonSelectionOverview: () =>
    apiFetch<{ data: LessonSelectionOverview }>('/lesson-selection/overview').then((r) => r.data),

  // Assignments
  listAssignments: (params: { assignedTo?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Assignment>>(`/assignments${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),
};
