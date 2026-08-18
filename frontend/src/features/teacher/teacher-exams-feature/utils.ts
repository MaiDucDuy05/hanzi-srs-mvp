// Utility functions and constants for teacher exams feature
import { Exam, ExamTemplate, ExamFilter, ExamSection, Question, QuestionSourceType } from './types';

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

// Mock questions for question selector (simulating unified question bank)
export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'FILL_IN',
    questionType: 'FILL_BLANK',
    sourceType: 'PRACTICE',
    hskLevel: 1,
    lessonId: 'lesson-1',
    topicId: 'topic-1',
    content: {
      prompt: 'Fill in the blank: 我___一杯咖啡。(drink)',
      translation: 'I drink a cup of coffee.',
      acceptedAnswers: ['喝', '喝咖啡', '饮'],
    },
    explanation: '喝 (hē) means "to drink" in Chinese.',
    difficulty: 'EASY',
    visibility: 'PUBLIC',
    tags: ['vocabulary', 'drink'],
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'q2',
    type: 'FILL_IN',
    questionType: 'FILL_BLANK',
    sourceType: 'PRACTICE',
    hskLevel: 1,
    lessonId: 'lesson-1',
    topicId: 'topic-1',
    content: {
      prompt: 'Fill in the blank: 我___一个苹果。(eat)',
      translation: 'I eat an apple.',
      acceptedAnswers: ['吃', '吃苹果'],
    },
    explanation: '吃 (chī) means "to eat" in Chinese.',
    difficulty: 'EASY',
    visibility: 'PUBLIC',
    tags: ['vocabulary', 'eat'],
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'q3',
    type: 'ORDERING',
    questionType: 'SENTENCE_ORDERING',
    sourceType: 'BOTH',
    hskLevel: 2,
    lessonId: 'lesson-2',
    topicId: 'topic-2',
    content: {
      prompt: 'Arrange the words: 你 / 今天 / 去 / 哪儿 / 想',
      correctOrder: ['你', '今天', '想', '去', '哪儿'],
      translation: 'Where do you want to go today?',
    },
    explanation: '想 + verb expresses "want to do something".',
    difficulty: 'MEDIUM',
    visibility: 'PUBLIC',
    tags: ['grammar', 'want'],
    isActive: true,
    createdAt: '2024-01-16',
  },
  {
    id: 'q4',
    type: 'MULTIPLE_CHOICE',
    questionType: 'SINGLE_CHOICE',
    sourceType: 'EXAM',
    hskLevel: 2,
    lessonId: null,
    topicId: null,
    content: {
      prompt: 'Which sentence is correct?',
      options: [
        { id: 'a', text: '我学习中文很努力。' },
        { id: 'b', text: '我很努力学习中文。' },
        { id: 'c', text: '很努力我学习中文。' },
        { id: 'd', text: '我努力很学习中文。' },
      ],
      correctAnswer: 'b',
    },
    explanation: 'Adverbs like 很 (very) should be placed before the verb.',
    difficulty: 'MEDIUM',
    visibility: 'PRIVATE',
    tags: ['grammar', 'adverb'],
    isActive: true,
    createdAt: '2024-01-17',
  },
  {
    id: 'q5',
    type: 'TRUE_FALSE',
    questionType: 'TRUE_FALSE',
    sourceType: 'PRACTICE',
    hskLevel: 1,
    lessonId: 'lesson-3',
    topicId: 'topic-3',
    content: {
      prompt: 'True or False: 苹果 means "apple"',
      correctAnswer: true,
    },
    explanation: '苹果 (píngguǒ) means apple.',
    difficulty: 'EASY',
    visibility: 'PUBLIC',
    tags: ['vocabulary', 'fruit'],
    isActive: true,
    createdAt: '2024-01-18',
  },
];

export const SOURCE_TYPE_OPTIONS = [
  { value: 'ALL', label: 'All Sources' },
  { value: 'PRACTICE', label: 'Practice Questions' },
  { value: 'EXAM', label: 'Exam Questions' },
  { value: 'BOTH', label: 'Reusable (Both)' },
];

export const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All Levels' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

export const QUESTION_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'FILL_IN', label: 'Fill in the Blank' },
  { value: 'ORDERING', label: 'Sentence Ordering' },
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
  { value: 'TRUE_FALSE', label: 'True/False' },
  { value: 'SHORT_ANSWER', label: 'Short Answer' },
];

export const HSK_LEVEL_OPTIONS = [
  { value: '', label: 'All Levels' },
  { value: '1', label: 'HSK 1' },
  { value: '2', label: 'HSK 2' },
  { value: '3', label: 'HSK 3' },
  { value: '4', label: 'HSK 4' },
  { value: '5', label: 'HSK 5' },
  { value: '6', label: 'HSK 6' },
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

export const getSourceTypeBadge = (sourceType: QuestionSourceType): { label: string; color: string } => {
  switch (sourceType) {
    case 'PRACTICE':
      return { label: 'Practice', color: '#78993a' };
    case 'EXAM':
      return { label: 'Exam', color: '#558866' };
    case 'BOTH':
      return { label: 'Reusable', color: '#c7cf35' };
    default:
      return { label: 'Unknown', color: '#94a3b8' };
  }
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'EASY':
      return '#22c55e';
    case 'MEDIUM':
      return '#f59e0b';
    case 'HARD':
      return '#ef4444';
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

export const getQuestionPreview = (question: Question): string => {
  const content = question.content;
  if (content.prompt) {
    return String(content.prompt).slice(0, 100) + (String(content.prompt).length > 100 ? '...' : '');
  }
  if (content.question) {
    return String(content.question).slice(0, 100) + (String(content.question).length > 100 ? '...' : '');
  }
  return 'No preview available';
};
