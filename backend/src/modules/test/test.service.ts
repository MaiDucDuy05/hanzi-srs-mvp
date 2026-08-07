import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  question: TestQuestion,
  submitted: unknown,
): { isCorrect: boolean; pointsAwarded: number } {
  const ca = question.correctAnswer ?? {};
  let isCorrect = false;
  if (question.questionType === TestQuestionType.SHORT_ANSWER) {
    const accepted = Array.isArray(ca.accepted)
      ? (ca.accepted as unknown[]).map(normalizeAnswer)
      : [];
    const single = ca.answer != null ? normalizeAnswer(ca.answer) : null;
    const norm = normalizeAnswer(submitted);
    isCorrect = accepted.includes(norm) || (single !== null && norm === single);
  } else {
    // SINGLE_CHOICE / TRUE_FALSE: so khớp chính xác (chuẩn hoá kiểu number/string).
    isCorrect = String(submitted ?? '') === String(ca?.answer ?? '');
  }
  return { isCorrect, pointsAwarded: isCorrect ? question.points : 0 };
}

@Injectable()
export class TestService {
  constructor(@InjectRepository(Test) private repo: Repository<Test>) {}
  async findAll(q: TestQueryDto) {
    const { page = 1, limit = 20, teacherId, status } = q;
    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) {
    return findOrNotFound(this.repo, id, 'Test');
  }
  async create(dto: CreateTestDto) {
    return this.repo.save(this.repo.create(dto as any));
  }
  async update(id: string, dto: UpdateTestDto) {
    const e = await this.findById(id);
    Object.assign(e, dto);
    return this.repo.save(e);
  }
  async softDelete(id: string) {
    await this.repo.softRemove(await this.findById(id));
  }
}

@Injectable()
export class TestQuestionService {
  constructor(
    @InjectRepository(TestQuestion) private repo: Repository<TestQuestion>,
  ) {}

  /** Bóc correctAnswer khỏi câu hỏi khi trả cho học viên (PR-05 §1.1). */
  private stripAnswers(q: TestQuestion): TestQuestion {
    const { correctAnswer: _omitted, ...rest } = q;
    return rest as TestQuestion;
  }

  async findAll(q: TestQuestionQueryDto, includeAnswer = false) {
    const { page = 1, limit = 50, testId } = q;
    const where: any = {};
    if (testId) where.testId = testId;
    const [data, total] = await this.repo.findAndCount({
      where,
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
    const q = await findOrNotFound(this.repo, id, 'Test question');
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
    await this.repo.remove(await this.findById(id));
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
        status: TestAttemptStatus.SUBMITTED,
      },
    });
    if (submittedCount >= test.attemptLimit)
      throw new BadRequestException('Attempt limit reached');

    return this.repo.save(
      this.repo.create({
        testId: dto.testId,
        userId,
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
      status: TestAttemptStatus.SUBMITTED,
      submittedAt: new Date(),
      durationSeconds: dto.durationSeconds,
      score,
    });
    return this.repo.save(attempt);
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
    const question = await findOrNotFound(
      this.questionRepo,
      dto.questionId,
      'Test question',
    );
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
