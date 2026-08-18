// Types for teacher exams feature

export type ExamStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED';
export type QuestionSourceType = 'PRACTICE' | 'EXAM' | 'BOTH';

export interface ExamSection {
  type: 'LISTENING' | 'READING' | 'WRITING' | 'STROKE';
  label: string;
  icon: string;
  questionCount: number;
  isLocked?: boolean;
}

export interface Exam {
  id: string;
  title: string;
  status: ExamStatus;
  scheduledFor?: string;
  targetClass?: string;
  durationMinutes?: number;
  questionCount: number;
  sections: ExamSection[];
  closingIn?: string;
  dueDate?: string;
}

export interface ExamTemplate {
  id: string;
  title: string;
  description: string;
  icon: 'TIMER' | 'FILE_TEXT' | 'AWARD';
  accentColor: string;
  bgColor: string;
  hoverBorderColor: string;
}

export type ExamFilter = 'All' | 'Drafts' | 'Active' | 'Completed';

export interface ExamListItemProps {
  exam: Exam;
  onEdit?: (id: string) => void;
  onPreview?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface QuickTemplateCardProps {
  template: ExamTemplate;
  onClick?: () => void;
}

// Question from unified question bank API
export interface Question {
  id: string;
  type: string;
  questionType: string | null;
  sourceType: QuestionSourceType;
  hskLevel: number | null;
  lessonId: string | null;
  topicId: string | null;
  content: Record<string, unknown>;
  explanation: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  visibility: 'PUBLIC' | 'PRIVATE';
  tags: string[] | null;
  isActive: boolean;
  createdAt: string;
}

// Create test request
export interface CreateTestRequest {
  name: string;
  description?: string;
  timeLimitMinutes?: number;
  attemptLimit?: number;
  accessCode?: string;
  hskLevel?: number;
  shuffleQuestions?: boolean;
  showAnswersAfter?: boolean;
  questionIds?: string[];
}

// Update test request
export interface UpdateTestRequest {
  name?: string;
  description?: string;
  timeLimitMinutes?: number;
  attemptLimit?: number;
  accessCode?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  showScoreImmediately?: boolean;
}
