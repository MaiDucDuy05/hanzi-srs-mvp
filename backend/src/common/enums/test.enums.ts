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
  /** Câu hỏi nhóm (Cha): chứa đoạn văn/audio dùng chung cho nhiều câu hỏi Con. */
  GROUP = 'GROUP',
}

export enum TestAttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
}

/** Phân loại bài kiểm tra / mẫu đề thi. */
export enum TestCategory {
  QUIZ_15M = 'QUIZ_15M',             // Kiểm tra 15 phút
  TEST_1H = 'TEST_1H',               // Kiểm tra 1 tiếng
  MID_TERM = 'MID_TERM',             // Thi giữa kỳ
  FINAL_EXAM = 'FINAL_EXAM',         // Thi cuối kỳ
  CUSTOM_ASSIGNMENT = 'CUSTOM',      // Bài tập tùy chỉnh
}
