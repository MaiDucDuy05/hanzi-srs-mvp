import { apiFetch } from '../client';
import { toQuery } from './utils';

export const adminContentApi = {
  // Courses
  getCourses: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/admin/courses${toQuery(params)}`, { method: 'GET' }),
  createCourse: (data: any) =>
    apiFetch(`/admin/courses`, { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: string, data: any) =>
    apiFetch(`/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateCourseStatus: (id: string, status: string) =>
    apiFetch(`/admin/courses/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Lessons
  getLessons: (courseId: string, params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/admin/courses/${courseId}/lessons${toQuery(params)}`, { method: 'GET' }),
  createLesson: (courseId: string, data: any) =>
    apiFetch(`/admin/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
  updateLesson: (id: string, data: any) =>
    apiFetch(`/admin/lessons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateLessonStatus: (id: string, status: string) =>
    apiFetch(`/admin/lessons/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  reorderLessons: (items: { id: string; order: number }[]) =>
    apiFetch(`/admin/lessons/reorder`, { method: 'PUT', body: JSON.stringify({ items }) }),

  // Lesson Contents (Linking vocab/grammar to lessons)
  getLessonContents: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/lesson-contents${toQuery(params)}`, { method: 'GET' }),
  addLessonContent: (data: any) =>
    apiFetch(`/lesson-contents`, { method: 'POST', body: JSON.stringify(data) }),
  removeLessonContent: (id: string) =>
    apiFetch(`/lesson-contents/${id}`, { method: 'DELETE' }),

  // Vocabularies
  getVocabularies: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/admin/vocabularies${toQuery(params)}`, { method: 'GET' }),
  importVocabulariesCsv: (data: FormData) =>
    apiFetch(`/admin/vocabularies/import`, { method: 'POST', body: data, contentType: false }),
  createVocabulary: (data: any) =>
    apiFetch(`/admin/vocabularies`, { method: 'POST', body: JSON.stringify(data) }),
  updateVocabulary: (id: string, data: any) =>
    apiFetch(`/admin/vocabularies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVocabulary: (id: string) =>
    apiFetch(`/admin/vocabularies/${id}`, { method: 'DELETE' }),
  exportVocabulariesCsv: () =>
    apiFetch(`/admin/vocabularies/export`, { method: 'GET' }),
  uploadVocabularyAudio: (id: string, data: FormData) =>
    apiFetch(`/admin/vocabularies/${id}/audio`, { method: 'POST', body: data, contentType: false }),

  // Grammars
  getGrammars: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/admin/grammars${toQuery(params)}`, { method: 'GET' }),
  createGrammar: (data: any) =>
    apiFetch(`/admin/grammars`, { method: 'POST', body: JSON.stringify(data) }),
  updateGrammar: (id: string, data: any) =>
    apiFetch(`/admin/grammars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteGrammar: (id: string) =>
    apiFetch(`/admin/grammars/${id}`, { method: 'DELETE' }),

  // Topics
  getTopics: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/admin/topics${toQuery(params)}`, { method: 'GET' }),
  createTopic: (data: any) =>
    apiFetch(`/admin/topics`, { method: 'POST', body: JSON.stringify(data) }),
  updateTopic: (id: string, data: any) =>
    apiFetch(`/admin/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateTopicStatus: (id: string, status: string) =>
    apiFetch(`/admin/topics/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getTopicVocabularies: (topicId: string) =>
    apiFetch(`/admin/topics/${topicId}/vocabularies`, { method: 'GET' }),
  assignTopicVocabularies: (topicId: string, vocabularyIds: string[]) =>
    apiFetch(`/admin/topics/${topicId}/vocabularies`, { method: 'POST', body: JSON.stringify({ vocabularyIds }) }),
  removeTopicVocabulary: (topicId: string, vocabId: string) =>
    apiFetch(`/admin/topics/${topicId}/vocabularies/${vocabId}`, { method: 'PUT' }),

  // Questions
  getQuestions: (params?: Record<string, string | number | boolean | undefined>) =>
    apiFetch(`/admin/questions${toQuery(params)}`, { method: 'GET' }),
  createQuestion: (data: any) =>
    apiFetch(`/admin/questions`, { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id: string, data: any) =>
    apiFetch(`/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id: string) =>
    apiFetch(`/admin/questions/${id}`, { method: 'DELETE' }),
};
