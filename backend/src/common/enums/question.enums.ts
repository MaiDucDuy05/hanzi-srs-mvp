/**
 * Enum để phân biệt nguồn gốc câu hỏi.
 * - PRACTICE: Câu hỏi tự động tạo cho bài luyện tập hàng ngày
 * - EXAM: Câu hỏi được giáo viên tạo cho bài kiểm tra
 * - BOTH: Câu hỏi có thể dùng cho cả 2 mục đích
 */
export enum QuestionSourceType {
  PRACTICE = 'PRACTICE',
  EXAM = 'EXAM',
  BOTH = 'BOTH',
}
