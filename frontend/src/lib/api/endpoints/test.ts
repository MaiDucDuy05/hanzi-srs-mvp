import { apiFetch, unwrap } from '../client';
import type { Paginated, Single, Test, TestQuestion, TestAttempt, TestAnswer } from '../types';
import { toQuery } from './utils';

export interface CreateTestDto {
  name: string;
  description?: string | null;
  timeLimitMinutes?: number;
  attemptLimit?: number;
  accessCode?: string | null;
  hskLevel?: number;
  shuffleQuestions?: boolean;
  showAnswersAfter?: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
  showScoreImmediately?: boolean;
}

export interface UpdateTestDto {
  name?: string;
  description?: string | null;
  timeLimitMinutes?: number;
  attemptLimit?: number;
  accessCode?: string | null;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  showScoreImmediately?: boolean;
}

export interface AddQuestionsToTestDto {
  questionIds: string[];
}

export const testApi = {
  list: (params: { status?: string; teacherId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Test>>(`/tests${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  get: (id: string) => unwrap(apiFetch<Single<Test>>(`/tests/${id}`)),

  create: (data: CreateTestDto) =>
    unwrap(apiFetch<Single<Test>>('/tests', { method: 'POST', body: JSON.stringify(data) })),

  update: (id: string, data: UpdateTestDto) =>
    unwrap(apiFetch<Single<Test>>(`/tests/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  remove: (id: string) => apiFetch(`/tests/${id}`, { method: 'DELETE' }),

  assign: (id: string, data: { classroomId?: string | null; studentId?: string | null; startTime: string; endTime: string; statusOnSubmit?: string }) =>
    unwrap(apiFetch<Single<any>>(`/tests/${id}/assign`, { method: 'POST', body: JSON.stringify(data) })),

  updateQuestionOrder: (testId: string, questionIds: string[]) =>
    unwrap(apiFetch<Single<any>>(`/tests/${testId}/questions/order`, { method: 'PUT', body: JSON.stringify({ questionIds }) })),

  // Add questions to test (from unified question bank)
  addQuestions: (testId: string, questionIds: string[]) =>
    apiFetch(`/tests/${testId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ questionIds }),
    }),

  // Replace all questions in a test
  replaceQuestions: (testId: string, questionIds: string[]) =>
    apiFetch(`/tests/${testId}/questions`, {
      method: 'PUT',
      body: JSON.stringify({ questionIds }),
    }),

  listQuestions: (params: { testId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<TestQuestion>>(`/test-questions${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  createQuestion: (data: Partial<TestQuestion>) =>
    unwrap(apiFetch<Single<TestQuestion>>('/test-questions', { method: 'POST', body: JSON.stringify(data) })),

  updateQuestion: (id: string, data: Partial<TestQuestion>) =>
    unwrap(apiFetch<Single<TestQuestion>>(`/test-questions/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  deleteQuestion: (id: string) => apiFetch(`/test-questions/${id}`, { method: 'DELETE' }),

  listAttempts: (params: { testId?: string; userId?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<TestAttempt>>(`/test-attempts${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => {
      console.log('listAttempts raw response:', r);
      return r.data || (Array.isArray(r) ? r : []);
    }),

  getAttempt: (id: string) => unwrap(apiFetch<Single<TestAttempt>>(`/test-attempts/${id}`)),

  startAttempt: (testId: string, assignmentId?: string) =>
    unwrap(apiFetch<Single<TestAttempt>>('/test-attempts', { method: 'POST', body: JSON.stringify({ testId, assignmentId }) })),

  submitAttempt: (id: string, durationSeconds: number) =>
    unwrap(apiFetch<Single<TestAttempt>>(`/test-attempts/${id}`, { method: 'PATCH', body: JSON.stringify({ durationSeconds }) })),

  completeGrading: (id: string) =>
    unwrap(apiFetch<Single<TestAttempt>>(`/test-attempts/${id}/complete-grading`, { method: 'PATCH' })),

  autoGradeObjective: (id: string) =>
    unwrap(apiFetch<Single<TestAttempt>>(`/test-attempts/${id}/auto-grade`, { method: 'PATCH' })),

  getAttemptResult: (attemptId: string) =>
    unwrap(apiFetch<Single<{
      attempt: TestAttempt;
      test: Test;
      questions: TestQuestion[];
      answers: TestAnswer[];
    }>>(`/test-attempts/${attemptId}/result`)),

  listAnswers: (attemptId: string) =>
    unwrap(apiFetch<Single<TestAnswer[]>>(`/test-attempts/${attemptId}/answers`)),

  submitAnswer: (attemptId: string, data: { questionId: string; answer?: unknown }) =>
    unwrap(apiFetch<Single<TestAnswer>>(`/test-attempts/${attemptId}/answers`, { method: 'POST', body: JSON.stringify({ questionId: data.questionId, answer: data.answer }) })),

  gradeAnswer: (attemptId: string, questionId: string, pointsAwarded: number) =>
    unwrap(apiFetch<Single<TestAnswer>>(`/test-attempts/${attemptId}/answers/${questionId}/grade`, { method: 'PATCH', body: JSON.stringify({ pointsAwarded }) })),
};
