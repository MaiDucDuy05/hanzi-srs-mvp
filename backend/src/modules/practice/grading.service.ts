/**
 * GradingService — chấm token ID cho PR-10 (Sentence Ordering).
 *
 * PR-10 §3.5:
 * - Backend kiểm tra đủ token, không trùng, không có token lạ.
 * - So sánh mảng token ID với đáp án đúng theo thứ tự.
 * - Mỗi câu đúng = 1 điểm (MVP).
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PracticeAttempt } from './entities/practice-attempt.entity';

export interface SentenceAnswer {
  questionId: string;
  tokenIds: string[];
}

export interface QuestionGradingResult {
  questionId: string;
  isCorrect: boolean;
  submittedOrder: string[];
  correctOrder: string[];
  missingTokenIds: string[];
  extraTokenIds: string[];
  wrongPositionIds: string[];
}

export interface GradingResult {
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  score: number;          // = totalCorrect (MVP)
  results: QuestionGradingResult[];
}

@Injectable()
export class GradingService {
  constructor(
    @InjectRepository(PracticeAttempt)
    private attemptRepo: Repository<PracticeAttempt>,
  ) {}

  /**
   * Chấm toàn bộ bài sắp xếp câu.
   *
   * @param attemptId — attempt đang nộp
   * @param answers    — mảng câu trả lời của user
   * @param durationSeconds — thời gian làm bài
   * @returns kết quả chấm điểm
   */
  async grade(
    attemptId: string,
    answers: SentenceAnswer[],
    durationSeconds: number,
  ): Promise<GradingResult> {
    const attempt = await this.attemptRepo.findOne({ where: { id: attemptId } });
    if (!attempt) throw new BadRequestException('Attempt not found');
    if (!attempt.questionData) throw new BadRequestException('Attempt has no question data');

    const snapshot = attempt.questionData as {
      correctAnswers?: Record<string, string[]>;
    };
    const correctAnswers = snapshot.correctAnswers ?? {};

    const results: QuestionGradingResult[] = [];
    let totalCorrect = 0;

    for (const answer of answers) {
      const result = this.gradeQuestion(answer, correctAnswers);
      results.push(result);
      if (result.isCorrect) totalCorrect++;
    }

    const totalQuestions = results.length;
    const score = totalCorrect; // MVP: mỗi câu đúng = 1 điểm

    return { totalQuestions, totalCorrect, totalWrong: totalQuestions - totalCorrect, score, results };
  }

  /**
   * Chấm một câu hỏi đơn lẻ.
   */
  private gradeQuestion(
    answer: SentenceAnswer,
    correctAnswers: Record<string, string[]>,
  ): QuestionGradingResult {
    const correctOrder: string[] = correctAnswers[answer.questionId] ?? [];

    // Validation: token thiếu
    const missingTokenIds = correctOrder.filter(
      (id) => !answer.tokenIds.includes(id),
    );

    // Validation: token thừa
    const extraTokenIds = answer.tokenIds.filter(
      (id) => !correctOrder.includes(id),
    );

    // Validation: token sai vị trí (đúng id nhưng sai chỗ)
    const wrongPositionIds: string[] = [];
    const maxLen = Math.max(answer.tokenIds.length, correctOrder.length);
    for (let i = 0; i < maxLen; i++) {
      const submittedId = answer.tokenIds[i];
      const correctId = correctOrder[i];
      if (submittedId !== undefined && correctId !== undefined && submittedId !== correctId) {
        if (!wrongPositionIds.includes(submittedId)) {
          wrongPositionIds.push(submittedId);
        }
      }
    }

    // Câu đúng khi: đủ token, không thừa, thứ tự giống nhau
    const isCorrect =
      missingTokenIds.length === 0 &&
      extraTokenIds.length === 0 &&
      answer.tokenIds.length === correctOrder.length &&
      answer.tokenIds.every((id, i) => id === correctOrder[i]);

    return {
      questionId: answer.questionId,
      isCorrect,
      submittedOrder: answer.tokenIds,
      correctOrder,
      missingTokenIds,
      extraTokenIds,
      wrongPositionIds,
    };
  }

  /**
   * Validate token submission — kiểm tra trước khi chấm.
   * Dùng khi FE gửi token lẻ từng câu.
   */
  validateSubmission(
    answers: SentenceAnswer[],
    correctAnswers: Record<string, string[]>,
  ): { valid: boolean; reason?: string } {
    for (const answer of answers) {
      const correctOrder = correctAnswers[answer.questionId];
      if (!correctOrder) {
        return { valid: false, reason: `Unknown question: ${answer.questionId}` };
      }

      const allIds = new Set<string>([...answer.tokenIds, ...correctOrder]);
      if (allIds.size !== answer.tokenIds.length + correctOrder.length) {
        // Có token trùng
        return { valid: false, reason: `Duplicate token in question ${answer.questionId}` };
      }
    }
    return { valid: true };
  }

  async gradeFillBlank(
    em: EntityManager,
    attemptId: string,
    answers: { questionId: string; tokenId: string }[],
    userId: string,
  ) {
    const attempt = await em.getRepository(PracticeAttempt).findOne({ where: { id: attemptId } });
    if (!attempt) throw new BadRequestException('Attempt not found');
    const qData = attempt.questionData as unknown as { correctAnswers?: Record<string, string> };
    const correctMap = qData?.correctAnswers || {};

    let totalCorrect = 0;
    const results = answers.map((ans) => {
      const correctId = correctMap[ans.questionId];
      const isCorrect = ans.tokenId === correctId;
      if (isCorrect) totalCorrect++;
      return {
        questionId: ans.questionId,
        isCorrect,
        submittedTokenId: ans.tokenId,
        correctTokenId: correctId,
      };
    });

    return {
      totalQuestions: Object.keys(correctMap).length,
      totalCorrect,
      totalWrong: Object.keys(correctMap).length - totalCorrect,
      score: totalCorrect,
      results,
    };
  }
}
