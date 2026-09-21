import { apiFetch } from '../client';
import { toQuery } from './utils';

export interface YctLevel {
  id: string;
  code: string;
  name: string;
  description: string | null;
  thumbnailKey: string | null;
  displayOrder: number;
  status: string;
  isActive: boolean;
  totalLessons?: number;
  totalVocabularies?: number;
  lessons?: YctLesson[];
}

export interface YctLesson {
  id: string;
  levelId: string;
  title: string;
  description: string | null;
  thumbnailKey: string | null;
  displayOrder: number;
  status: string;
  isActive: boolean;
  publishedAt: string | null;
  vocabCount?: number;
  vocabularies?: YctVocabulary[];
  level?: YctLevel;
}

export interface YctVocabulary {
  id: string;
  levelId: string | null;
  lessonId: string | null;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  audioKey: string | null;
  imageKey: string | null;
  partOfSpeech: string | null;
  example: string | null;
  status: string;
  isActive: boolean;
  level?: YctLevel;
  lesson?: YctLesson;
}

export const yctApi = {
  getLevels: () =>
    apiFetch<{ data: YctLevel[] }>('/yct/levels', { auth: false }).then((r) => r.data),

  getLevelByCode: (code: string) =>
    apiFetch<{ data: YctLevel }>(`/yct/levels/${code}`, { auth: false }).then((r) => r.data),

  getLessonDetail: (lessonId: string) =>
    apiFetch<{ data: YctLesson }>(`/yct/lessons/${lessonId}`, { auth: false }).then((r) => r.data),

  getVocabularies: (params: { levelId?: string; lessonId?: string; status?: string; search?: string; page?: number; limit?: number } = {}) =>
    apiFetch<{ data: { items: YctVocabulary[]; total: number } }>(`/yct/vocabularies${toQuery(params)}`, { auth: false }).then((r) => r.data),
};

export const adminYctApi = {
  getLevels: () =>
    apiFetch<{ data: YctLevel[] }>('/admin/yct/levels').then((r) => r.data),

  updateLevel: (id: string, data: Partial<YctLevel>) =>
    apiFetch<{ data: YctLevel }>(`/admin/yct/levels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then((r) => r.data),

  getLessons: (params: { levelId?: string; status?: string; search?: string; page?: number; limit?: number } = {}) =>
    apiFetch<{ data: { items: YctLesson[]; total: number; page: number; limit: number } }>(`/admin/yct/lessons${toQuery(params)}`).then((r) => r.data),

  getLesson: (id: string) =>
    apiFetch<{ data: YctLesson }>(`/admin/yct/lessons/${id}`).then((r) => r.data),

  createLesson: (data: Partial<YctLesson>) =>
    apiFetch<{ data: YctLesson }>('/admin/yct/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((r) => r.data),

  updateLesson: (id: string, data: Partial<YctLesson>) =>
    apiFetch<{ data: YctLesson }>(`/admin/yct/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then((r) => r.data),

  deleteLesson: (id: string) =>
    apiFetch(`/admin/yct/lessons/${id}`, { method: 'DELETE' }),

  getVocabularies: (params: { levelId?: string; lessonId?: string; status?: string; search?: string; page?: number; limit?: number } = {}) =>
    apiFetch<{ data: { items: YctVocabulary[]; total: number; page: number; limit: number } }>(`/admin/yct/vocabularies${toQuery(params)}`).then((r) => r.data),

  getVocabulary: (id: string) =>
    apiFetch<{ data: YctVocabulary }>(`/admin/yct/vocabularies/${id}`).then((r) => r.data),

  createVocabulary: (data: Partial<YctVocabulary>) =>
    apiFetch<{ data: YctVocabulary }>('/admin/yct/vocabularies', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((r) => r.data),

  updateVocabulary: (id: string, data: Partial<YctVocabulary>) =>
    apiFetch<{ data: YctVocabulary }>(`/admin/yct/vocabularies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then((r) => r.data),

  deleteVocabulary: (id: string) =>
    apiFetch(`/admin/yct/vocabularies/${id}`, { method: 'DELETE' }),

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiFetch<{ data: { url: string } }>('/admin/yct/upload-image', {
      method: 'POST',
      body: formData,
      contentType: false,
    });
    return res.data;
  },
};
