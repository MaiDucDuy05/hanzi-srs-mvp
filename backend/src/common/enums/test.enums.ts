/** Trạng thái bài kiểm tra do giáo viên tạo (PR-05). */
export enum TestStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

/** Loại câu hỏi trong test_questions (PR-05). */
export enum TestQuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  FILL_IN = 'FILL_IN',
  ORDERING = 'ORDERING',
  MATCHING = 'MATCHING',
  SPEAKING = 'SPEAKING',
  WRITING = 'WRITING',
}

export enum TestAttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
}
