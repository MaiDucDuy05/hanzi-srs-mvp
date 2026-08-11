import { apiFetch, unwrap } from '../client';
import type { Paginated, Single, PracticeQuestion, PracticeAttempt, PracticeType, SourceType } from '../types';
import { toQuery } from './utils';

export interface StartPracticeInput {
  practiceType: PracticeType;
  sourceType: SourceType;
  sourceId: string;
  idempotencyKey?: string;
  questionData?: Record<string, unknown>;
}

export interface SubmitPracticeInput {
  answerData?: Record<string, unknown>;
  score: number;
  correctCount: number;
  wrongCount: number;
  moveCount: number;
  durationSeconds: number;
}

export const practiceApi = {
  listQuestions: (params: { questionType?: string; levelId?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<PracticeQuestion>>(`/practice-questions${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  getQuestion: (id: string) => unwrap(apiFetch<Single<PracticeQuestion>>(`/practice-questions/${id}`)),

  createQuestion: (data: Partial<PracticeQuestion>) =>
    unwrap(apiFetch<Single<PracticeQuestion>>('/practice-questions', { method: 'POST', body: JSON.stringify(data) })),

  updateQuestion: (id: string, data: Partial<PracticeQuestion>) =>
    unwrap(apiFetch<Single<PracticeQuestion>>(`/practice-questions/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  deleteQuestion: (id: string) => apiFetch(`/practice-questions/${id}`, { method: 'DELETE' }),

  listAttempts: (params: { userId?: string; practiceType?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<PracticeAttempt>>(`/practice-attempts${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  getAttempt: (id: string) => unwrap(apiFetch<Single<PracticeAttempt>>(`/practice-attempts/${id}`)),

  start: (data: StartPracticeInput) =>
    unwrap(apiFetch<Single<PracticeAttempt>>('/practice-attempts', { method: 'POST', body: JSON.stringify(data) })),

  submit: (id: string, data: SubmitPracticeInput) =>
    unwrap(apiFetch<Single<PracticeAttempt>>(`/practice-attempts/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),
};
