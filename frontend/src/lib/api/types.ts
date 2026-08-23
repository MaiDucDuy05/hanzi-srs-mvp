/**
 * Types phản chiếu các entity của backend NestJS (api/v1).
 * Nguồn: backend/src/modules (entities) + common/enums.
 */

// ── Envelope ──
export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  message?: string;
}

export interface Single<T> {
  data: T;
  message?: string;
}

// ── Enums ──
export type Role = 'FREE' | 'TEACHER' | 'ADMIN';
export type ContentStatus = 'DRAFT' | 'PUBLISHED';
export type ContentType = 'VOCABULARY' | 'GRAMMAR';
export type PracticeType =
  | 'WORD_MATCHING'
  | 'FLASHCARD'
  | 'FILL_BLANK'
  | 'SENTENCE_ORDERING'
  | 'PINYIN_BALLOON_GAME'
  | 'MEMORY_GAME'
  | 'HANZI_WRITING';
export type SourceType = 'LEVEL' | 'LESSON' | 'TOPIC';
export type PracticeQuestionType = 'FILL_BLANK' | 'SENTENCE_ORDERING';
export type PracticeAnswerType = 'HANZI' | 'PINYIN' | 'TEXT';
export type PracticeAttemptStatus = 'IN_PROGRESS' | 'COMPLETED';
export type TestStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type TestQuestionType = 'SINGLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'FILL_IN' | 'ORDERING' | 'MATCHING' | 'SPEAKING' | 'WRITING';
export type TestAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
export type SubscriptionPlan = 'FREE' | 'VIP';
export type SubscriptionStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type ResourceTier = 'FREE' | 'VIP';
export type UpgradeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AiJobType = 'STORY' | 'STUDY_PATH';
export type AiJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type RewardType = 'TEMPORARY_VIP' | 'DISCOUNT_VOUCHER' | 'CONTENT_UNLOCK' | 'COSMETIC';

// ── Auth / Users ──
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: string;
  vipValidUntil?: string | null;
  banReason?: string | null;
  bannedAt?: string | null;
  dailyGoal?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  // accessToken nằm trong HttpOnly cookie (backend set) — body chỉ trả user.
  user: User;
}

// ── Curriculum ──
export interface HskLevel {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
  vocabularyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  levelId: string;
  title: string;
  description: string | null;
  displayOrder: number;
  status: ContentStatus;
  publishedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum SrsRating {
  AGAIN = 'AGAIN',
  HARD = 'HARD',
  GOOD = 'GOOD',
  EASY = 'EASY',
}

export interface UserVocabProgress {
  id: string;
  userId: string;
  vocabularyId: string;
  masteryLevel: number;
  reviewCount: number;
  easinessFactor: number;
  intervalDays: number;
  nextReviewAt: string;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonContentsAggregate {
  vocabularies: Vocabulary[];
  grammarPoints: GrammarPoint[];
}

export interface UserLessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  vocabCompleted: boolean;
  grammarCompleted: boolean;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vocabulary {
  id: string;
  levelId: string;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  partOfSpeech: string | null;
  example: string | null;
  audioKey: string | null;
  status: ContentStatus;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GrammarPoint {
  id: string;
  levelId: string;
  title: string;
  structure: string;
  explanation: string;
  status: ContentStatus;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonContent {
  id: string;
  lessonId: string;
  contentType: ContentType;
  contentId: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailKey: string | null;
  recommendedLevelId: string | null;
  status: ContentStatus;
  displayOrder: number;
  vocabularyCount: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  assignedBy: string;
  assignedTo: string;
  dueDate: string | null;
  vocabularyCount: number;
  status: 'PENDING' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface LessonSelectionOverview {
  hskLevels: HskLevel[];
  topics: Topic[];
  assignments: Assignment[];
  recentMistakeCount: number;
  totalMistakeCount: number;
}

export interface TopicVocabulary {
  id: string;
  topicId: string;
  vocabularyId: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  description: string | null;
  audience: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CourseLesson {
  id: string;
  courseId: string;
  lessonId: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type SpeakingStatus = 'SUBMITTED' | 'GRADED';

export interface SpeakingAttempt {
  id: string;
  userId: string;
  audioKey: string;
  status: SpeakingStatus;
  score: number | string | null;
  feedback: string | null;
  gradedBy: string | null;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ── Practice ──
export interface PracticeQuestion {
  id: string;
  questionType: PracticeQuestionType;
  levelId: string | null;
  lessonId: string | null;
  topicId: string | null;
  prompt: string | null;
  questionData: Record<string, unknown> | null;
  answerData: Record<string, unknown> | null;
  acceptedAnswers: Record<string, unknown> | null;
  answerType: PracticeAnswerType | null;
  translation: string | null;
  explanation: string | null;
  status: ContentStatus;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeAttempt {
  id: string;
  userId: string;
  practiceType: PracticeType;
  sourceType: SourceType;
  sourceId: string;
  idempotencyKey: string | null;
  questionData: Record<string, unknown> | null;
  answerData: Record<string, unknown> | null;
  score: number;
  correctCount: number;
  wrongCount: number;
  moveCount: number;
  durationSeconds: number;
  status: PracticeAttemptStatus;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Tests ──
export interface Test {
  id: string;
  teacherId: string;
  name: string;
  description: string | null;
  timeLimitMinutes: number;
  attemptLimit: number;
  status: TestStatus;
  accessCode: string | null;
  showScoreImmediately: boolean;
  hskLevel?: number | null;
  shuffleQuestions?: boolean;
  showAnswersAfter?: boolean;
  hiddenByAdmin?: boolean;
  hideReason?: string | null;
  hiddenAt?: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestQuestion {
  id: string;
  testId: string;
  questionId: string;
  question: {
    id: string;
    type: TestQuestionType;
    difficulty: string;
    content: Record<string, any>;
  };
  points: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  assignmentId?: string | null;
  status: TestAttemptStatus;
  startedAt: string;
  submittedAt: string | null;
  score: number;
  durationSeconds: number;
  createdAt: string;
  updatedAt: string;
  test?: {
    id?: string;
    name: string;
  };
  user?: {
    id?: string;
    fullName: string;
  };
}

export interface TestAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer: Record<string, unknown> | null;
  isCorrect: boolean;
  pointsAwarded: number;
  createdAt: string;
  updatedAt: string;
}

// ── Subscription ──
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startsAt: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LimitSettings {
  id: string;
  freeLimit: number;
  resetTimezone: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyUsageCheck {
  allowed: boolean;
  usedCount: number;
}

// ── Resources ──
export interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileKey: string;
  tier: ResourceTier;
  uploaderId: string;
  status: ContentStatus;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MistakeBookEntry {
  id: string;
  userId: string;
  sourceType: string;
  sourceId: string;
  questionType: string;
  questionSnapshot: Record<string, unknown>;
  userAnswer: Record<string, unknown> | null;
  correctAnswer: Record<string, unknown> | null;
  explanation: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VipUpgradeRequest {
  id: string;
  userId: string;
  status: UpgradeRequestStatus;
  plan: string;
  amount: number;
  transferNote: string | null;
  note: string | null;
  reviewedBy: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiJob {
  id: string;
  userId: string;
  jobType: AiJobType;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown> | null;
  status: AiJobStatus;
  error: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Rewards ──
export interface Reward {
  id: string;
  code: string;
  title: string;
  type: RewardType;
  costExp: number;
  metadata: Record<string, unknown> | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRewardDto {
  code: string;
  title: string;
  type: RewardType;
  costExp: number;
  metadata?: Record<string, unknown>;
  active?: boolean;
}

export interface UpdateRewardDto {
  title?: string;
  type?: RewardType;
  costExp?: number;
  metadata?: Record<string, unknown>;
  active?: boolean;
}

// ── Admin Dashboard ──
export interface MetricWithChange {
  value: number;
  changePercent?: number;
  changeValue?: number;
}

export interface DashboardSummary {
  totalUsers: MetricWithChange;
  activeVip: MetricWithChange;
  todayAttempts: { value: number; yesterday: number };
  monthlyRevenue: { value: number; lastMonth: number };
}

export interface ChartDataPoint {
  date: string;
  count: number;
}

export interface DashboardCharts {
  registrations: ChartDataPoint[];
  attempts: ChartDataPoint[];
}

export interface PendingVipItem {
  id: string;
  userFullName: string;
  plan: SubscriptionPlan;
  createdAt: string;
}

export interface ExpiringVipItem {
  id: string;
  userFullName: string;
  expiresAt: string;
}

export interface PendingContactItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export interface SystemErrorItem {
  id: string;
  jobName: string;
  errorMessage: string;
  createdAt: string;
}

export interface DashboardPendingItems {
  pendingVip: PendingVipItem[];
  expiringVip: ExpiringVipItem[];
  pendingContacts: PendingContactItem[];
  recentSystemErrors: SystemErrorItem[];
}

export type HealthStatus = 'Optimal' | 'Degraded' | 'Critical';

export interface CronJobStatus {
  name: string;
  lastRun: string;
  status: 'OK' | 'ERROR';
  errorMessage?: string;
}

export interface DashboardSystemHealth {
  healthPercent: number;
  statusLabel: HealthStatus;
  statusMessage: string;
  lastCheckedAt: string;
  aiCallsToday: number;
  storageUsedMb: number;
  cronJobs: CronJobStatus[];
}

// ── Sentence Ordering (PR-10) ──
export interface SentenceToken {
  id: string;
  text: string;
}

export interface SentenceQuestion {
  questionId: string;
  tokens: SentenceToken[];
  prompt?: string | null;
  translation?: string | null;
  explanation?: string | null;
}

export interface FillBlankQuestion {
  questionId: string;
  prompt: string;
  options: string[];
  translation?: string | null;
  explanation?: string | null;
}


export interface SentenceAnswer {
  questionId: string;
  tokenIds: string[];
}

export interface QuestionGradingResult {
  questionId: string;
  isCorrect: boolean;
  submittedOrder: string[];
  correctOrder: string[];
  missingTokenIds: string[];
  extraTokenIds: string[];
  wrongPositionIds: string[];
}

export interface SentenceGradingResult {
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  score: number;
  results: QuestionGradingResult[];
}

export interface SentenceOrderingStartResult {
  attemptId: string;
  questions: SentenceQuestion[];
  totalQuestions: number;
}

/** PR-13: Một chữ Hán trong phiên luyện viết. */
export interface HanziChar {
  char: string;
  pinyin: string;
  meaning: string;
  audioKey: string | null;
  vocabularyId: string;
}

export interface HanziWritingStartResult {
  attemptId: string;
  characters: HanziChar[];
  totalCharacters: number;
}

export interface HanziCharResult {
  char: string;
  mistakes: number;
  skipped: boolean;
}

export interface HanziWritingCompleteResult {
  completedChars: number;
  totalMistakes: number;
}




export interface TestAssignment {
  id: string;
  testId: string;
  classroomId: string | null;
  studentId: string | null;
  startTime: string;
  endTime: string;
  assignedBy: string;
  statusOnSubmit: 'GRADED' | 'SUBMITTED';
  test?: Test;
  student?: User;
}
