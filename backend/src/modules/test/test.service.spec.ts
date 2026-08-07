import { gradeQuestion } from './test.service';
import { TestQuestionType } from '../../common/enums/test.enums';
import type { TestQuestion } from './entities/test-question.entity';

function question(partial: Partial<TestQuestion>): TestQuestion {
  return {
    id: 'q1',
    testId: 't1',
    questionType: TestQuestionType.SINGLE_CHOICE,
    content: 'x',
    options: null,
    correctAnswer: null,
    points: 2,
    displayOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  } as TestQuestion;
}

describe('gradeQuestion (PR-05 chấm điểm phía server)', () => {
  it('SINGLE_CHOICE: khớp chính xác → đúng, lệch → sai', () => {
    const q = question({
      questionType: TestQuestionType.SINGLE_CHOICE,
      correctAnswer: { answer: 'B' },
      points: 2,
    });
    expect(gradeQuestion(q, 'B')).toEqual({ isCorrect: true, pointsAwarded: 2 });
    expect(gradeQuestion(q, 'A')).toEqual({ isCorrect: false, pointsAwarded: 0 });
  });

  it('TRUE_FALSE: true/false so khớp chính xác', () => {
    const q = question({
      questionType: TestQuestionType.TRUE_FALSE,
      correctAnswer: { answer: 'TRUE' },
    });
    expect(gradeQuestion(q, 'TRUE').isCorrect).toBe(true);
    expect(gradeQuestion(q, 'FALSE').isCorrect).toBe(false);
  });

  it('SHORT_ANSWER: khớp đáp án chuẩn hoá hoa/thường và khoảng trắng thừa', () => {
    const q = question({
      questionType: TestQuestionType.SHORT_ANSWER,
      correctAnswer: { answer: 'nước  Hoa', accepted: ['Bắc  Kinh'] },
    });
    // accepted: ["Bắc  Kinh"] sau chuẩn hoá khớp với "bắc kinh" (hoa/thường + space)
    expect(gradeQuestion(q, 'bắc kinh').isCorrect).toBe(true);
    // đáp án đơn: "nước hoa" (chuẩn hoá) khớp "nước  Hoa"
    expect(gradeQuestion(q, 'Nước hoa').isCorrect).toBe(true);
    expect(gradeQuestion(q, 'Hà Nội').isCorrect).toBe(false);
  });

  it('SHORT_ANSWER: bỏ trống (undefined) → sai', () => {
    const q = question({
      questionType: TestQuestionType.SHORT_ANSWER,
      correctAnswer: { answer: 'a' },
    });
    expect(gradeQuestion(q, undefined).isCorrect).toBe(false);
  });

  it('pointsAwarded = points khi đúng, 0 khi sai', () => {
    const q = question({
      questionType: TestQuestionType.SINGLE_CHOICE,
      correctAnswer: { answer: 'C' },
      points: 5,
    });
    expect(gradeQuestion(q, 'C').pointsAwarded).toBe(5);
    expect(gradeQuestion(q, 'D').pointsAwarded).toBe(0);
  });
});
