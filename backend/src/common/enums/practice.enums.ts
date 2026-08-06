/** Các dạng bài luyện tập dùng chung bảng practice_attempts (PR-03,04,09,10,11,12,13). */
export enum PracticeType {
  WORD_MATCHING = 'WORD_MATCHING',
  FLASHCARD = 'FLASHCARD',
  FILL_BLANK = 'FILL_BLANK',
  SENTENCE_ORDERING = 'SENTENCE_ORDERING',
  PINYIN_BALLOON_GAME = 'PINYIN_BALLOON_GAME',
  MEMORY_GAME = 'MEMORY_GAME',
  HANZI_WRITING = 'HANZI_WRITING',
}

/** Nguồn sinh bài luyện tập (polymorphic source_id). */
export enum SourceType {
  LEVEL = 'LEVEL',
  LESSON = 'LESSON',
  TOPIC = 'TOPIC',
}

export enum PracticeAttemptStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

/** Loại câu hỏi trong practice_questions (PR-09, PR-10). */
export enum PracticeQuestionType {
  FILL_BLANK = 'FILL_BLANK',
  SENTENCE_ORDERING = 'SENTENCE_ORDERING',
}

/** Loại đáp án của câu điền chỗ trống (PR-09). */
export enum PracticeAnswerType {
  HANZI = 'HANZI',
  PINYIN = 'PINYIN',
  TEXT = 'TEXT',
}
