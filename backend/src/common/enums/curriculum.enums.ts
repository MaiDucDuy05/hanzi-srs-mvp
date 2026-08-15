/** Trạng thái xuất bản nội dung (bài học, từ vựng, chủ đề, câu hỏi, tài liệu). */
export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
}

/** Loại nội dung trong lesson_contents (polymorphic join). */
export enum ContentType {
  VOCABULARY = 'VOCABULARY',
  GRAMMAR = 'GRAMMAR',
}

/** Đối tượng người học của course (người lớn / trẻ em). */
export enum Audience {
  ADULT = 'ADULT',
  CHILD = 'CHILD',
}
