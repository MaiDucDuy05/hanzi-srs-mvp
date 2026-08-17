// Types for teacher exams feature

export type ExamStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED';

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
