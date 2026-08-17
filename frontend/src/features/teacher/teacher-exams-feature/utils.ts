// Utility functions and constants for teacher exams feature
import { Exam, ExamTemplate, ExamFilter, ExamSection } from './types';

export const EXAM_FILTERS: ExamFilter[] = ['All', 'Drafts', 'Active', 'Completed'];

export const EXAM_TEMPLATES: ExamTemplate[] = [
  {
    id: 'warmup-10min',
    title: '10-Min Warm-up',
    description: 'Vocabulary & tone recall exercises to start the day.',
    icon: 'TIMER',
    accentColor: '#78993a',
    bgColor: '#f4f7ed',
    hoverBorderColor: '#c7cf35',
  },
  {
    id: 'unit-test',
    title: 'Unit Test',
    description: 'Comprehensive assessment covering multiple chapters.',
    icon: 'FILE_TEXT',
    accentColor: '#558866',
    bgColor: '#eef5e9',
    hoverBorderColor: '#558866',
  },
  {
    id: 'mock-hsk',
    title: 'Mock HSK',
    description: 'Official format simulation with standardized grading.',
    icon: 'AWARD',
    accentColor: '#64748b',
    bgColor: '#f0f2f5',
    hoverBorderColor: '#64748b',
  },
];

export const MOCK_EXAM_SECTIONS: ExamSection[] = [
  { type: 'LISTENING', label: 'Listening', icon: 'Volume2', questionCount: 15, isLocked: false },
  { type: 'READING', label: 'Reading', icon: 'Image', questionCount: 20, isLocked: false },
  { type: 'STROKE', label: 'Stroke Puzzles', icon: 'Edit2', questionCount: 0, isLocked: true },
];

export const MOCK_EXAMS: Exam[] = [
  {
    id: 'exam-1',
    title: 'Unit 4: Food & Drink Test',
    status: 'DRAFT',
    targetClass: 'Class 2A',
    durationMinutes: 30,
    questionCount: 25,
    sections: MOCK_EXAM_SECTIONS.slice(0, 2),
  },
  {
    id: 'exam-2',
    title: 'Weekly HSK 1 Simulation',
    status: 'ACTIVE',
    targetClass: 'All Beginners',
    closingIn: '2 days',
    questionCount: 40,
    sections: MOCK_EXAM_SECTIONS,
  },
  {
    id: 'exam-3',
    title: 'Morning Warm-up: Tones',
    status: 'COMPLETED',
    targetClass: 'Class 1B',
    dueDate: 'Oct 20',
    questionCount: 10,
    sections: MOCK_EXAM_SECTIONS.slice(0, 1),
  },
];

export const getStatusColor = (status: string): { bg: string; text: string; border: string } => {
  switch (status) {
    case 'DRAFT':
      return { bg: '#fff4f4', text: '#e55353', border: '#ffd5d5' };
    case 'ACTIVE':
      return { bg: '#eaf3c5', text: '#4a5a3a', border: '#dde8a6' };
    case 'COMPLETED':
      return { bg: '#f0f2f5', text: '#64748b', border: '#e2e8f0' };
    default:
      return { bg: '#f0f2f5', text: '#64748b', border: '#e2e8f0' };
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'ACTIVE':
      return 'Active';
    case 'COMPLETED':
      return 'Completed';
    default:
      return status;
  }
};

export const getIndicatorColor = (status: string): string => {
  switch (status) {
    case 'DRAFT':
      return '#e55353';
    case 'ACTIVE':
      return '#78993a';
    case 'COMPLETED':
      return '#94a3b8';
    default:
      return '#94a3b8';
  }
};

export const formatDuration = (minutes: number | undefined): string => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} Mins`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} Hour${hours > 1 ? 's' : ''}`;
};
