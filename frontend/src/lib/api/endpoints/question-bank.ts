import { apiFetch, unwrap } from '../client';
import type { Paginated, Single } from '../types';

// Question source types
export type TestQuestionType = 'SINGLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'FILL_IN' | 'ORDERING' | 'MATCHING';
export type QuestionSourceType = 'PRACTICE' | 'EXAM' | 'BOTH';

export interface QuestionBankItem {
  id: string;
  creatorId: string;
  type: TestQuestionType;
  questionType: string | null;
  sourceType: QuestionSourceType;
  visibility: 'PUBLIC' | 'PRIVATE';
  hskLevel: number | null;
  lessonId: string | null;
  topicId: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  content: Record<string, unknown>;
  explanation: string | null;
  tags: string[] | null;
  isActive: boolean;
  hiddenByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDto {
  type: TestQuestionType;
  content: Record<string, unknown>;
  visibility?: 'PUBLIC' | 'PRIVATE';
  hskLevel?: number | null;
  lessonId?: string | null;
  topicId?: string | null;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  explanation?: string | null;
  tags?: string[];
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {
  visibility?: 'PUBLIC' | 'PRIVATE';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface QueryQuestionDto {
  page?: number;
  limit?: number;
  type?: string;
  visibility?: string;
  hskLevel?: number;
  difficulty?: string;
  tags?: string;
  search?: string;
  sourceType?: QuestionSourceType;
  topicId?: string;
}

export const questionBankApi = {
  list: (params: QueryQuestionDto = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });
    return apiFetch<Paginated<QuestionBankItem>>(`/questions?${searchParams.toString()}`).then((r) => r.data);
  },

  get: (id: string) => unwrap(apiFetch<Single<QuestionBankItem>>(`/questions/${id}`)),

  create: (data: CreateQuestionDto) =>
    unwrap(apiFetch<Single<QuestionBankItem>>('/questions', { method: 'POST', body: JSON.stringify(data) })),

  update: (id: string, data: UpdateQuestionDto) =>
    unwrap(apiFetch<Single<QuestionBankItem>>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) })),

  remove: (id: string) => apiFetch(`/questions/${id}`, { method: 'DELETE' }),

  // Filter by source type
  listPracticeQuestions: (params: Omit<QueryQuestionDto, 'sourceType'> = {}) =>
    questionBankApi.list({ ...params, sourceType: 'PRACTICE' }),

  listExamQuestions: (params: Omit<QueryQuestionDto, 'sourceType'> = {}) =>
    questionBankApi.list({ ...params, sourceType: 'EXAM' }),

  listReusableQuestions: (params: Omit<QueryQuestionDto, 'sourceType'> = {}) =>
    questionBankApi.list({ ...params, sourceType: 'BOTH' }),
};
