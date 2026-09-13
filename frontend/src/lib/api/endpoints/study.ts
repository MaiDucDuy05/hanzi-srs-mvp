import { apiFetch, unwrap } from '../client';
import type { Single } from '../types';

export interface GenerateExamQuestionsInput {
  lessonId?: string;
  vocabIds?: string[];
  customWords?: string[];
  count?: number;
  level?: string;
  questionTypes?: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface GeneratedQuestionItem {
  type: 'SINGLE_CHOICE' | 'FILL_IN' | 'ORDERING';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  targetVocab?: string;
  explanation?: string;
  content: {
    questionText?: string;
    question?: string;
    prompt?: string;
    options?: string[];
    correctAnswer?: string;
    acceptedAnswers?: string[];
    words?: string[];
    correctOrder?: string[];
  };
}

export interface GenerateAndCreateTestInput extends GenerateExamQuestionsInput {
  testName: string;
  description?: string;
  timeLimitMinutes?: number;
  attemptLimit?: number;
  hskLevel?: number;
}

export const studyApi = {
  generateExamQuestions: (data: GenerateExamQuestionsInput) =>
    apiFetch<GeneratedQuestionItem[]>('/study/ai/generate-exam-questions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  generateAndCreateTest: (data: GenerateAndCreateTestInput) =>
    apiFetch<{ test: any; totalQuestions: number; questions: GeneratedQuestionItem[] }>(
      '/study/ai/generate-and-create-test',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
};
