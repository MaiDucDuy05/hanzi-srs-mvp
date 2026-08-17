import { apiFetch } from '../client';
import { toQuery } from './utils';

export const adminContentApi = {
  // Courses
  getCourses: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/v1/admin/courses${toQuery(params)}`, { method: 'GET' }),
  createCourse: (data: any) =>
    apiFetch(`/v1/admin/courses`, { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: string, data: any) =>
    apiFetch(`/v1/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateCourseStatus: (id: string, status: string) =>
    apiFetch(`/v1/admin/courses/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Lessons
  getLessons: (courseId: string, params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/v1/admin/courses/${courseId}/lessons${toQuery(params)}`, { method: 'GET' }),
  createLesson: (courseId: string, data: any) =>
    apiFetch(`/v1/admin/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
  updateLesson: (id: string, data: any) =>
    apiFetch(`/v1/admin/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateLessonStatus: (id: string, status: string) =>
    apiFetch(`/v1/admin/lessons/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  reorderLessons: (items: { id: string; order: number }[]) =>
    apiFetch(`/v1/admin/lessons/reorder`, { method: 'PUT', body: JSON.stringify({ items }) }),

  // Vocabularies
  getVocabularies: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/v1/admin/vocabularies${toQuery(params)}`, { method: 'GET' }),
  importVocabulariesCsv: (data: FormData) =>
    apiFetch(`/v1/admin/vocabularies/import`, { method: 'POST', body: data, contentType: false }),
  createVocabulary: (data: any) =>
    apiFetch(`/v1/admin/vocabularies`, { method: 'POST', body: JSON.stringify(data) }),
  updateVocabulary: (id: string, data: any) =>
    apiFetch(`/v1/admin/vocabularies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVocabulary: (id: string) =>
    apiFetch(`/v1/admin/vocabularies/${id}`, { method: 'DELETE' }),
  exportVocabulariesCsv: () =>
    apiFetch(`/v1/admin/vocabularies/export`, { method: 'GET' }),
  uploadVocabularyAudio: (id: string, data: FormData) =>
    apiFetch(`/v1/admin/vocabularies/${id}/audio`, { method: 'POST', body: data, contentType: false }),

  // Grammars
  getGrammars: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/v1/admin/grammars${toQuery(params)}`, { method: 'GET' }),
  createGrammar: (data: any) =>
    apiFetch(`/v1/admin/grammars`, { method: 'POST', body: JSON.stringify(data) }),
  updateGrammar: (id: string, data: any) =>
    apiFetch(`/v1/admin/grammars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGrammar: (id: string) =>
    apiFetch(`/v1/admin/grammars/${id}`, { method: 'DELETE' }),

  // Topics
  getTopics: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/v1/admin/topics${toQuery(params)}`, { method: 'GET' }),
  createTopic: (data: any) =>
    apiFetch(`/v1/admin/topics`, { method: 'POST', body: JSON.stringify(data) }),
  updateTopic: (id: string, data: any) =>
    apiFetch(`/v1/admin/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateTopicStatus: (id: string, status: string) =>
    apiFetch(`/v1/admin/topics/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getTopicVocabularies: (topicId: string) =>
    apiFetch(`/v1/admin/topics/${topicId}/vocabularies`, { method: 'GET' }),
  assignTopicVocabularies: (topicId: string, vocabularyIds: string[]) =>
    apiFetch(`/v1/admin/topics/${topicId}/vocabularies`, { method: 'POST', body: JSON.stringify({ vocabularyIds }) }),
  removeTopicVocabulary: (topicId: string, vocabId: string) =>
    apiFetch(`/v1/admin/topics/${topicId}/vocabularies/${vocabId}`, { method: 'PUT' }),

  // Questions
  getQuestions: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/v1/admin/questions${toQuery(params)}`, { method: 'GET' }),
  createQuestion: (data: any) =>
    apiFetch(`/v1/admin/questions`, { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id: string, data: any) =>
    apiFetch(`/v1/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id: string) =>
    apiFetch(`/v1/admin/questions/${id}`, { method: 'DELETE' }),
};
