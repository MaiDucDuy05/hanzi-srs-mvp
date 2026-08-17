// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export type Mistake = {
  id: string | number;
  userId?: string;
  sourceType?: string;
  sourceId?: string;
  questionType?: string | null;
  questionSnapshot?: Record<string, unknown> | null;
  userAnswer?: Record<string, unknown> | null;
  correctAnswer?: Record<string, unknown> | null;
  explanation?: string | null;
  failCount?: number | string | null;
};

export type Student = {
  id: string | number;
  fullName?: string | null;
  testAvg?: number | string | null;
  courseProgress?: number | string | null;
  vocabMastery?: number | string | null;
  email?: string;
  totalExp?: number;
  currentStreak?: number;
};

export type StudentDetail = {
  id: string;
  fullName: string;
  email?: string;
  totalExp: number;
  currentStreak: number;
  dailyGoal: number;
  createdAt: string;
};

export type StudentActivity = {
  id: string;
  activityType: string;
  details?: Record<string, unknown>;
  expAwarded: number;
  createdAt: string;
};

export type TestAttemptSummary = {
  id: string;
  testId: string;
  testName?: string;
  status: string;
  score: number;
  startedAt: string;
  submittedAt?: string | null;
};
