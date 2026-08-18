import { UserActivity } from '../achievements/entities/user-activity.entity';
import { ActivityType } from '../../common/enums/achievements.enums';
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Test } from './entities/test.entity';
import { TestQuestion } from './entities/test-question.entity';
import { TestAttempt } from './entities/test-attempt.entity';
import { TestAnswer } from './entities/test-answer.entity';
import {
  CreateTestDto,
  UpdateTestDto,
  CreateTestQuestionDto,
  UpdateTestQuestionDto,
  StartTestAttemptDto,
  SubmitTestAnswerDto,
  SubmitTestAttemptDto,
  TestQueryDto,
  TestQuestionQueryDto,
  TestAttemptQueryDto,
} from './dto/test.dto';
import {
  TestAttemptStatus,
  TestStatus,
  TestQuestionType,
} from '../../common/enums/test.enums';
import { Role } from '../../common/enums/user.enums';
import {
  paginatedResult,
  findOrNotFound,
} from '../../common/helpers/query-helpers';

/**
 * Chuẩn hoá đáp án SHORT_ANSWER (PR-05 §2): bỏ khoảng trắng thừa, viết thường
 * để so khớp 2 đáp án khác nhau về hoa/thường hoặc dấu cách.
 */
function normalizeAnswer(raw: unknown): string {
  return String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Chấm một câu phía server (PR-05 §3.4). correctAnswer là JSONB dạng
 * `{ answer: ... , accepted: [...] }`. SHORT_ANSWER so khớp sau chuẩn hoá;
 * SINGLE_CHOICE / TRUE_FALSE so khớp chính xác. Không tin điểm client gửi lên.
 */
export function gradeQuestion(
  testQuestion: TestQuestion,
  submitted: unknown,
): { isCorrect: boolean; pointsAwarded: number } {
  const qContent = testQuestion.question?.content ?? {};
  const qType = testQuestion.question?.type;
  let isCorrect = false;

  if (qType === TestQuestionType.FILL_IN || qType === TestQuestionType.SHORT_ANSWER) {
    const accepted = Array.isArray(qContent.accepted_answers)
      ? (qContent.accepted_answers as unknown[]).map(normalizeAnswer)
      : (Array.isArray((qContent.correct_answer as any)?.accepted) 
         ? ((qContent.correct_answer as any).accepted as unknown[]).map(normalizeAnswer)
         : []);
    const single = qContent.correct_answer ? normalizeAnswer(typeof qContent.correct_answer === 'object' ? (qContent.correct_answer as any).answer : qContent.correct_answer) : null;
    const norm = normalizeAnswer(submitted);
    isCorrect = accepted.includes(norm) || (single !== null && norm === single);
  } else if (qType === TestQuestionType.ORDERING) {
    const correct = Array.isArray(qContent.correct_order) ? qContent.correct_order.join(',') : '';
    const sub = Array.isArray(submitted) ? submitted.join(',') : String(submitted ?? '');
    isCorrect = correct === sub;
  } else if (qType === TestQuestionType.MATCHING) {
    isCorrect = JSON.stringify(submitted) === JSON.stringify(qContent.pairs);
  } else {
    // SINGLE_CHOICE / TRUE_FALSE / MCQ
    const correct = typeof qContent.correct_answer === 'object' ? (qContent.correct_answer as any)?.answer : qContent.correct_answer;
    isCorrect = String(submitted ?? '') === String(correct ?? '');
  }

  return { isCorrect, pointsAwarded: isCorrect ? testQuestion.points : 0 };
}

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test) private repo: Repository<Test>,
    @InjectRepository(TestAttempt) private attemptRepo: Repository<TestAttempt>,
  ) {}
  async findAll(q: TestQueryDto, role?: string) {
    const { page = 1, limit = 20, teacherId, status } = q;
    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;
    if (role !== Role.ADMIN && role !== Role.TEACHER) {
      where.hiddenByAdmin = false;
    }
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string, role?: string) {
    const test = await findOrNotFound(this.repo, id, 'Test');
    if (role !== Role.ADMIN && role !== Role.TEACHER && test.hiddenByAdmin) {
      throw new ForbiddenException('This test has been hidden by administrator');
    }
    return test;
  }
  async create(dto: CreateTestDto) {
    return this.repo.save(this.repo.create(dto as any));
  }
  async update(id: string, dto: UpdateTestDto, userId: string, role: string) {
    const e = await this.findById(id, role);
    if (role !== Role.ADMIN && e.teacherId !== userId) {
      throw new ForbiddenException('You can only update your own tests');
    }
    Object.assign(e, dto);
    return this.repo.save(e);
  }
  async softDelete(id: string, userId: string, role: string) {
    const test = await this.findById(id, role);
    if (role !== Role.ADMIN && test.teacherId !== userId) {
      throw new ForbiddenException('You can only delete your own tests');
    }
    const attempts = await this.attemptRepo.count({
      where: { testId: id, status: In([TestAttemptStatus.SUBMITTED, TestAttemptStatus.GRADED]) }
    });
    if (attempts > 0) {
      throw new BadRequestException('EXAM_HAS_SUBMISSIONS');
    }
    await this.repo.softRemove(test);
  }

  async updateQuestionOrder(id: string, questionIds: string[], userId: string, role: string) {
    const test = await this.findById(id, role); // Check if test exists
    if (role !== Role.ADMIN && test.teacherId !== userId) {
      throw new ForbiddenException('You can only update your own tests');
    }

    // We update each question's displayOrder by iterating through the array.
    // Using transaction would be better, but doing simple updates for MVP.
    const promises = questionIds.map((questionId, index) =>
      this.repo.manager.update('test_questions', { id: questionId, testId: id }, { displayOrder: index })
    );
    await Promise.all(promises);
    return { updatedCount: promises.length };
  }

  /**
   * Add questions to a test without replacing existing ones.
   */
  async addQuestions(id: string, questionIds: string[], userId: string, role: string) {
    const test = await this.findById(id, role);
    if (role !== Role.ADMIN && test.teacherId !== userId) {
      throw new ForbiddenException('You can only update your own tests');
    }

    const testQuestionRepo = this.repo.manager.getRepository(TestQuestion);
    
    // Get max display order
    const existing = await testQuestionRepo.find({ where: { testId: id } as any, order: { displayOrder: 'DESC' }, take: 1 });
    let maxOrder = existing.length > 0 ? existing[0].displayOrder : 0;

    // Create new questions
    const toSave: Partial<TestQuestion>[] = questionIds.map((questionId) => {
      maxOrder += 1;
      return {
        testId: id,
        questionId,
        displayOrder: maxOrder,
        points: 1, // Default points
      };
    });

    await testQuestionRepo.save(toSave);
    return { addedCount: toSave.length };
  }

  /**
   * Replace all questions in a test (Cách 1: Create Exam FIRST → Add Questions AFTER).
   * Deletes existing questions and creates new ones.
   */
  async replaceQuestions(id: string, questionIds: string[], userId: string, role: string) {
    const test = await this.findById(id, role);
    if (role !== Role.ADMIN && test.teacherId !== userId) {
      throw new ForbiddenException('You can only update your own tests');
    }

    // Check if test has submissions - if so, don't allow replacing questions
    const attemptRepo = this.repo.manager.getRepository(TestAttempt);
    const attempts = await attemptRepo.count({
      where: { testId: id, status: In([TestAttemptStatus.SUBMITTED, TestAttemptStatus.GRADED]) }
    });
    if (attempts > 0) {
      throw new BadRequestException('Cannot modify questions because test has submissions');
    }

    // Delete all existing questions for this test
    const testQuestionRepo = this.repo.manager.getRepository(TestQuestion);
    await testQuestionRepo.delete({ testId: id } as any);

    // Create new questions
    const toSave: Partial<TestQuestion>[] = questionIds.map((questionId, index) => ({
      testId: id,
      questionId,
      displayOrder: index,
      points: 1, // Default points
    }));
    await testQuestionRepo.save(toSave);

    return { replacedCount: toSave.length };
  }
}

@Injectable()
export class TestQuestionService {
  constructor(
    @InjectRepository(TestQuestion) private repo: Repository<TestQuestion>,
    @InjectRepository(TestAttempt) private attemptRepo: Repository<TestAttempt>,
  ) {}

  /** Bóc correctAnswer khỏi câu hỏi khi trả cho học viên (PR-05 §1.1). */
  private stripAnswers(q: TestQuestion): TestQuestion {
    if (q.question && q.question.content) {
      const { 
        correct_answer, accepted_answers, correct_order, pairs,
        correctAnswer, acceptedAnswers, correctOrder,
        ...safeContent 
      } = q.question.content as any;
      q.question = { ...q.question, content: safeContent } as any;
    }
    return q;
  }

  async findAll(q: TestQuestionQueryDto, includeAnswer = false) {
    const { page = 1, limit = 50, testId } = q;
    const where: any = {};
    if (testId) where.testId = testId;
    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['question'],
      skip: (page - 1) * limit,
      take: limit,
      order: { displayOrder: 'ASC' },
    });
    return paginatedResult(
      includeAnswer ? data : data.map((d) => this.stripAnswers(d)),
      total,
      page,
      limit,
    );
  }
  async findById(id: string, includeAnswer = false) {
    const q = await this.repo.findOne({ where: { id } as any, relations: ['question'] });
    if (!q) throw new BadRequestException('Test question not found');
    return includeAnswer ? q : this.stripAnswers(q);
  }
  async create(dto: CreateTestQuestionDto) {
    return this.repo.save(this.repo.create(dto as any));
  }
  async update(id: string, dto: UpdateTestQuestionDto) {
    const e = await this.findById(id, true);
    Object.assign(e, dto);
    return this.repo.save(e);
  }
  async delete(id: string) {
    const q = await this.findById(id);
    const attempts = await this.attemptRepo.count({
      where: { testId: q.testId, status: In([TestAttemptStatus.SUBMITTED, TestAttemptStatus.GRADED]) }
    });
    if (attempts > 0) {
      throw new BadRequestException('Cannot delete question because test has submissions');
    }
    await this.repo.remove(q);
  }
}

@Injectable()
export class TestAttemptService {
  constructor(
    @InjectRepository(TestAttempt) private repo: Repository<TestAttempt>,
    @InjectRepository(Test) private testRepo: Repository<Test>,
    @InjectRepository(TestAnswer) private answerRepo: Repository<TestAnswer>,
    @InjectRepository(TestQuestion)
    private questionRepo: Repository<TestQuestion>,
  ) {}

  /**
   * PR-05 §1.2: học viên chỉ xem được attempt của chính mình (bỏ qua ?userId= client gửi lên);
   * teacher/admin được lọc theo userId/testId phục vụ màn kết quả.
   */
  async findAll(q: TestAttemptQueryDto, userId: string, role: string) {
    const { page = 1, limit = 20, testId, status } = q;
    const where: any = {};
    if (role === Role.TEACHER || role === Role.ADMIN) {
      if (q.userId) where.userId = q.userId;
    } else {
      where.userId = userId;
    }
    if (testId) where.testId = testId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({
      where,
      relations: ['test'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return paginatedResult(data, total, page, limit);
  }
  /** Xem attempt: chủ sở hữu hoặc teacher/admin (đồng bộ với findByAttempt). */
  async findById(id: string, userId: string, role: string) {
    const attempt = await findOrNotFound(this.repo, id, 'Test attempt');
    if (
      attempt.userId !== userId &&
      role !== Role.TEACHER &&
      role !== Role.ADMIN
    ) {
      throw new ForbiddenException('Not allowed to view this attempt');
    }
    return attempt;
  }
  async start(dto: StartTestAttemptDto, userId: string) {
    const test = await findOrNotFound(this.testRepo, dto.testId, 'Test');
    if (test.status !== TestStatus.PUBLISHED)
      throw new BadRequestException('Test is not published');

    const submittedCount = await this.repo.count({
      where: {
        testId: dto.testId,
        userId,
        status: In([TestAttemptStatus.SUBMITTED, TestAttemptStatus.GRADED]),
      },
    });
    if (submittedCount >= test.attemptLimit)
      throw new BadRequestException('Attempt limit reached');

    return this.repo.save(
      this.repo.create({
        testId: dto.testId,
        userId,
        assignmentId: dto.assignmentId,
        status: TestAttemptStatus.IN_PROGRESS,
        startedAt: new Date(),
      } as any),
    );
  }

  /**
   * Nộp bài (PR-05 §3.4): tính điểm tổng phía server từ các test_answers đã chấm.
   * Điểm tổng = tổng điểm đạt / tổng điểm toàn bài (tính cả câu bỏ trống).
   */
  async submit(id: string, dto: SubmitTestAttemptDto, userId: string) {
    const attempt = await findOrNotFound(this.repo, id, 'Test attempt');
    if (attempt.userId !== userId)
      throw new ForbiddenException('Attempt does not belong to user');
    if (attempt.status !== TestAttemptStatus.IN_PROGRESS)
      throw new BadRequestException('Attempt already submitted');

    const test = await findOrNotFound(this.testRepo, attempt.testId, 'Test');
    const [answers, questions] = await Promise.all([
      this.answerRepo.find({ where: { attemptId: id } as any }),
      this.questionRepo.find({
        where: { testId: test.id } as any,
        relations: ['question'],
        order: { displayOrder: 'ASC' },
      }),
    ]);
    const qIds = new Set(questions.map((q) => q.id));
    const totalPoints = questions.reduce((s, q) => s + q.points, 0);
    // Chỉ tính điểm cho câu thuộc đúng bài test của attempt (chặn inject câu bài khác).
    const earned = answers
      .filter((a) => qIds.has(a.questionId))
      .reduce((s, a) => s + a.pointsAwarded, 0);
    const score = totalPoints ? Math.round((earned / totalPoints) * 100) : 0;

    Object.assign(attempt, {
      status: TestAttemptStatus.GRADED,
      submittedAt: new Date(),
      durationSeconds: dto.durationSeconds,
      score,
    });
    
    await this.repo.manager.insert(UserActivity, {
      userId,
      activityType: ActivityType.PRACTICE_COMPLETED,
      details: { type: 'TEST', attemptId: id, testId: attempt.testId, score },
      expAwarded: 0,
    });

    return this.repo.save(attempt);
  }

  async getResult(id: string, userId: string, role: string) {
    const attempt = await this.findById(id, userId, role);
    const test = await findOrNotFound(this.testRepo, attempt.testId, 'Test');
    const answers = await this.answerRepo.find({ where: { attemptId: id } as any });
    let questions = await this.questionRepo.find({
      where: { testId: test.id } as any,
      relations: ['question'],
      order: { displayOrder: 'ASC' },
    });

    const canSeeAnswers =
      role === Role.TEACHER ||
      role === Role.ADMIN ||
      (test.showAnswersAfter && attempt.status === TestAttemptStatus.GRADED);

    if (!canSeeAnswers) {
      questions = questions.map((q) => {
        if (q.question && q.question.content) {
          const { 
            correct_answer, accepted_answers, correct_order, pairs,
            correctAnswer, acceptedAnswers, correctOrder,
            ...safeContent 
          } = q.question.content as any;
          q.question = { ...q.question, content: safeContent } as any;
        }
        return q;
      });
    }

    return { attempt, test, questions, answers };
  }
}

@Injectable()
export class TestAnswerService {
  constructor(
    @InjectRepository(TestAnswer) private repo: Repository<TestAnswer>,
    @InjectRepository(TestAttempt) private attemptRepo: Repository<TestAttempt>,
    @InjectRepository(TestQuestion)
    private questionRepo: Repository<TestQuestion>,
  ) {}

  /** Attempt phải thuộc người dùng và còn IN_PROGRESS mới nhận đáp án (PR-05 §3.4). */
  private async assertCanAnswer(
    attemptId: string,
    userId: string,
  ): Promise<TestAttempt> {
    const attempt = await findOrNotFound(
      this.attemptRepo,
      attemptId,
      'Test attempt',
    );
    if (attempt.userId !== userId)
      throw new ForbiddenException('Attempt does not belong to user');
    if (attempt.status !== TestAttemptStatus.IN_PROGRESS)
      throw new BadRequestException('Attempt already submitted');
    return attempt;
  }

  /** Lưu đáp án + chấm ngay phía server; upsert theo UNIQUE(attempt_id, question_id). */
  async submitAnswer(
    attemptId: string,
    dto: SubmitTestAnswerDto,
    userId: string,
  ) {
    const attempt = await this.assertCanAnswer(attemptId, userId);
    const question = await this.questionRepo.findOne({
      where: { id: dto.questionId } as any,
      relations: ['question'],
    });
    if (!question) throw new BadRequestException('Test question not found');
    // Chống inject: câu hỏi phải thuộc đúng bài test của attempt.
    if (question.testId !== attempt.testId)
      throw new BadRequestException('Question does not belong to this test');
    const submitted = dto.answer?.answer;
    const { isCorrect, pointsAwarded } = gradeQuestion(question, submitted);

    const existing = await this.repo.findOne({
      where: { attemptId, questionId: dto.questionId },
    });
    if (existing) {
      Object.assign(existing, { answer: dto.answer, isCorrect, pointsAwarded });
      return this.repo.save(existing);
    }
    return this.repo.save(
      this.repo.create({
        attemptId,
        questionId: dto.questionId,
        answer: dto.answer,
        isCorrect,
        pointsAwarded,
      } as any),
    );
  }

  /** Answers của một attempt: học viên chỉ xem attempt của mình; teacher/admin xem mọi attempt. */
  async findByAttempt(attemptId: string, userId: string, role: string) {
    const attempt = await findOrNotFound(
      this.attemptRepo,
      attemptId,
      'Test attempt',
    );
    if (
      attempt.userId !== userId &&
      role !== Role.TEACHER &&
      role !== Role.ADMIN
    ) {
      throw new ForbiddenException('Not allowed to view this attempt');
    }
    return this.repo.find({
      where: { attemptId },
      order: { createdAt: 'ASC' },
    });
  }
}
