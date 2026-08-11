/**
 * Endpoint functions — map 1-1 với API NestJS (api/v1).
 * Trả về kiểu đã bóc envelope (data / paginated data).
 */
import { apiFetch, unwrap } from './client';
import type {
  AiJob,
  AuthResponse,
  Course,
  CourseLesson,
  DailyUsageCheck,
  HskLevel,
  Lesson,
  LessonContent,
  LimitSettings,
  MistakeBookEntry,
  Paginated,
  PracticeAttempt,
  PracticeQuestion,
  PracticeType,
  Resource,
  Single,
  SpeakingAttempt,
  SourceType,
  Subscription,
  Test,
  TestAnswer,
  TestAttempt,
  TestQuestion,
  Topic,
  TopicVocabulary,
  User,
  VipUpgradeRequest,
  Vocabulary,
  GrammarPoint,
} from './types';

function toQuery(params: Record<string, string | number | boolean | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

// ── Auth ──
export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    unwrap(apiFetch<Single<AuthResponse>>('/auth/register', { method: 'POST', body: JSON.stringify(data), auth: false })),

  login: (data: { email: string; password: string }) =>
    unwrap(apiFetch<Single<AuthResponse>>('/auth/login', { method: 'POST', body: JSON.stringify(data), auth: false })),

  // Profile hiện tại theo HttpOnly cookie — thay cho user lưu localStorage.
  me: () => unwrap(apiFetch<Single<User>>('/auth/me')),

  // Xoá cookie phía server (client không tự xoá được HttpOnly).
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};

// ── Curriculum ──
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

  createLesson: (data: Partial<Lesson>) =>
    unwrap(apiFetch<Single<Lesson>>('/lessons', { method: 'POST', body: JSON.stringify(data) })),

  updateLesson: (id: string, data: Partial<Lesson>) =>
    unwrap(apiFetch<Single<Lesson>>(`/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  deleteLesson: (id: string) => apiFetch(`/lessons/${id}`, { method: 'DELETE' }),

  listVocabularies: (params: { levelId?: string; status?: string; page?: number; limit?: number } = {}) =>
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
};

// ── Practice ──
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

// ── Tests ──
export const testApi = {
  list: (params: { status?: string; teacherId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Test>>(`/tests${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  get: (id: string) => unwrap(apiFetch<Single<Test>>(`/tests/${id}`)),

  create: (data: Partial<Test>) => unwrap(apiFetch<Single<Test>>('/tests', { method: 'POST', body: JSON.stringify(data) })),

  update: (id: string, data: Partial<Test>) =>
    unwrap(apiFetch<Single<Test>>(`/tests/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  remove: (id: string) => apiFetch(`/tests/${id}`, { method: 'DELETE' }),

  listQuestions: (params: { testId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<TestQuestion>>(`/test-questions${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  createQuestion: (data: Partial<TestQuestion>) =>
    unwrap(apiFetch<Single<TestQuestion>>('/test-questions', { method: 'POST', body: JSON.stringify(data) })),

  updateQuestion: (id: string, data: Partial<TestQuestion>) =>
    unwrap(apiFetch<Single<TestQuestion>>(`/test-questions/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  deleteQuestion: (id: string) => apiFetch(`/test-questions/${id}`, { method: 'DELETE' }),

  listAttempts: (params: { testId?: string; userId?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<TestAttempt>>(`/test-attempts${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  getAttempt: (id: string) => unwrap(apiFetch<Single<TestAttempt>>(`/test-attempts/${id}`)),

  startAttempt: (testId: string) =>
    unwrap(apiFetch<Single<TestAttempt>>('/test-attempts', { method: 'POST', body: JSON.stringify({ testId }) })),

  submitAttempt: (id: string, durationSeconds: number) =>
    unwrap(apiFetch<Single<TestAttempt>>(`/test-attempts/${id}`, { method: 'PATCH', body: JSON.stringify({ durationSeconds }) })),

  listAnswers: (attemptId: string) =>
    unwrap(apiFetch<Single<TestAnswer[]>>(`/test-attempts/${attemptId}/answers`)),

  submitAnswer: (attemptId: string, data: { questionId: string; answer?: unknown }) =>
    unwrap(apiFetch<Single<TestAnswer>>(`/test-attempts/${attemptId}/answers`, { method: 'POST', body: JSON.stringify({ questionId: data.questionId, answer: data.answer }) })),
};

// ── Subscription / Limits ──
export const subscriptionApi = {
  list: (params: { userId?: string; plan?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Subscription>>(`/subscriptions${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  // Gói của người dùng hiện tại (authenticated, không admin-only) — phân biệt VIP subscriber vs FREE.
  me: () => unwrap(apiFetch<Single<Subscription | null>>('/subscriptions/me')),

  getLimitSettings: () => unwrap(apiFetch<Single<LimitSettings>>('/limit-settings')),

  // userId lấy từ JWT phía server (PR-14 §3.2) — chỉ gửi activityKey.
  checkLimit: (activityKey: string) =>
    unwrap(apiFetch<Single<DailyUsageCheck>>('/daily-usage/checkLimit', { method: 'POST', body: JSON.stringify({ activityKey }) })),
};

// ── Resources ──
export const resourceApi = {
  list: (params: { tier?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Resource>>(`/resources${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  get: (id: string) => unwrap(apiFetch<Single<Resource>>(`/resources/${id}`)),

  create: (data: Partial<Resource>) =>
    unwrap(apiFetch<Single<Resource>>('/resources', { method: 'POST', body: JSON.stringify(data) })),

  createContact: (data: { name: string; email: string; phone?: string; message: string }) =>
    unwrap(apiFetch<Single<{ id: string }>>('/contact-requests', { method: 'POST', body: JSON.stringify(data), auth: false })),

  listMistakes: (params: { userId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<MistakeBookEntry>>(`/mistake-book${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  createMistake: (data: Partial<MistakeBookEntry>) =>
    unwrap(apiFetch<Single<MistakeBookEntry>>('/mistake-book', { method: 'POST', body: JSON.stringify(data) })),

  deleteMistake: (id: string) => apiFetch(`/mistake-book/${id}`, { method: 'DELETE' }),

  listVipRequests: (params: { userId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<VipUpgradeRequest>>(`/vip-upgrade-requests${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  createVipRequest: (data: { userId: string; note?: string }) =>
    unwrap(apiFetch<Single<VipUpgradeRequest>>('/vip-upgrade-requests', { method: 'POST', body: JSON.stringify(data) })),

  reviewVipRequest: (id: string, data: { status: 'APPROVED' | 'REJECTED'; note?: string }) =>
    unwrap(apiFetch<Single<VipUpgradeRequest>>(`/vip-upgrade-requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  listAiJobs: (params: { userId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<AiJob>>(`/ai-jobs${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  createAiJob: (data: { userId: string; jobType: string; inputData: Record<string, unknown> }) =>
    unwrap(apiFetch<Single<AiJob>>('/ai-jobs', { method: 'POST', body: JSON.stringify(data) })),

  // users (admin)
  listUsers: (params: { page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<User>>(`/users${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  // Admin-only — returns 403 for non-admin users.
  updateUser: (id: string, data: Partial<User>) =>
    unwrap(apiFetch<Single<User>>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),
};

// ── Courses ──
export const coursesApi = {
  list: (params: { audience?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Course>>(`/courses${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  get: (id: string) => unwrap(apiFetch<Single<Course>>(`/courses/${id}`)),

  listLessons: (params: { courseId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<CourseLesson>>(`/course-lessons${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),
};

// ── Speaking ──
export const speakingApi = {
  /** Tải file audio lên, trả audioKey. */
  uploadAudio: async (file: Blob): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/v1/audio/upload', { method: 'POST', credentials: 'include', body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message ?? 'Upload thất bại');
    }
    const json = await res.json() as { data: { audioKey: string } };
    return json.data.audioKey;
  },

  list: (params: { userId?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<SpeakingAttempt>>(`/speaking-attempts${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  create: (data: { audioKey: string }) =>
    unwrap(apiFetch<Single<SpeakingAttempt>>('/speaking-attempts', { method: 'POST', body: JSON.stringify(data) })),

  grade: (id: string, data: { score?: number | null; feedback?: string | null }) =>
    unwrap(apiFetch<Single<SpeakingAttempt>>(`/speaking-attempts/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),
};
