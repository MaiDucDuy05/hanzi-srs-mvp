import { apiFetch, unwrap } from '../client';
import type { Paginated, Single, TestQuestionType } from '../types';

export interface QuestionBankItem {
  id: string;
  creatorId: string;
  type: TestQuestionType;
  visibility: 'PUBLIC' | 'PRIVATE';
  hskLevel: number | null;
  lessonId: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  content: Record<string, unknown>;
  explanation: string | null;
  tags: string[] | null;
  createdAt: string;
}

export const questionBankApi = {
  list: (params: { page?: number; limit?: number; type?: string; visibility?: string; hskLevel?: number; difficulty?: string; tags?: string; search?: string } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });
    return apiFetch<Paginated<QuestionBankItem>>(`/questions?${searchParams.toString()}`).then((r) => r.data);
  },

  get: (id: string) => unwrap(apiFetch<Single<QuestionBankItem>>(`/questions/${id}`)),

  create: (data: Partial<QuestionBankItem>) => 
    unwrap(apiFetch<Single<QuestionBankItem>>('/questions', { method: 'POST', body: JSON.stringify(data) })),

  update: (id: string, data: Partial<QuestionBankItem>) =>
    unwrap(apiFetch<Single<QuestionBankItem>>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) })),

  remove: (id: string) => apiFetch(`/questions/${id}`, { method: 'DELETE' }),
};
