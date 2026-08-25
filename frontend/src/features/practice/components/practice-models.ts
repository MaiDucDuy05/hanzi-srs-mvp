/**
 * Models & helpers dùng chung cho các phiên luyện tập (PR-03/04/09/10/11/12).
 * Câu hỏi được sinh client-side từ từ vựng của nguồn đã chọn (backend chấm theo
 * điểm client gửi lên trong MVP — PracticeAttemptService chỉ lưu dto).
 */
import type { PracticeType, SourceType, Vocabulary } from '@/lib/api/types';

export interface QuestionItem {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  audioKey: string | null;
}

export interface ModeResult {
  correctCount: number;
  wrongCount: number;
  moveCount: number;
  score: number;
  answerData: Record<string, unknown>;
  vocabResults?: Record<string, boolean>; // id -> isCorrect
}

/** Props chung cho mọi mode: dữ liệu câu hỏi + callback kết quả/trạng thái. */
export interface ModeProps<TState> {
  items: QuestionItem[];
  initialState?: TState | null;
  onStateChange: (state: TState) => void;
  onComplete: (result: ModeResult) => void;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Chuyển danh sách từ vựng thành câu hỏi chuẩn hoá. */
export function buildQuestions(vocab: Vocabulary[]): QuestionItem[] {
  return vocab.map((v) => ({
    id: v.id,
    hanzi: v.hanzi,
    pinyin: v.pinyin,
    meaning: v.meaningVi,
    audioKey: v.audioKey,
  }));
}

/** Điểm 0–100 dựa trên số câu/việc đúng. */
export function computeScore(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

/** Tách chữ Hán thành từng ký tự (dùng cho sắp xếp). */
export function splitChars(word: string): string[] {
  return Array.from(word);
}

export interface SourceRef {
  sourceType: SourceType;
  sourceId: string;
  label: string;
}

export const PRACTICE_TYPES: PracticeType[] = [
  'WORD_MATCHING',
  'FLASHCARD',
  'FILL_BLANK',
  'SENTENCE_ORDERING',
  'PINYIN_BALLOON_GAME',
  'MEMORY_GAME',
  'HANZI_WRITING',
];
