import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from './entities/test.entity';
import { TestQuestion } from './entities/test-question.entity';
import { TestAttempt } from './entities/test-attempt.entity';
import { TestAnswer } from './entities/test-answer.entity';
import {
  CreateTestDto, UpdateTestDto, CreateTestQuestionDto, UpdateTestQuestionDto,
  StartTestAttemptDto, SubmitTestAnswerDto, SubmitTestAttemptDto,
} from './dto/test.dto';
import { TestAttemptStatus, TestStatus } from '../../common/enums/test.enums';
import { PaginatedResult } from '../../common/pagination.dto';

function paginated<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
async function findOr404<T extends { id: string }>(repo: Repository<T>, id: string, label: string): Promise<T> {
  const e = await repo.findOne({ where: { id } as any });
  if (!e) throw new NotFoundException(`${label} not found`);
  return e;
}

@Injectable()
export class TestService {
  constructor(@InjectRepository(Test) private repo: Repository<Test>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, teacherId, status } = q;
    const where: any = {};
    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'Test'); }
  async create(dto: CreateTestDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateTestDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async publish(id: string, accessCode?: string) {
    const e = await this.findById(id);
    e.status = TestStatus.PUBLISHED;
    if (accessCode) e.accessCode = accessCode;
    return this.repo.save(e);
  }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}

@Injectable()
export class TestQuestionService {
  constructor(@InjectRepository(TestQuestion) private repo: Repository<TestQuestion>) {}
  async findAll(q: any) {
    const { page = 1, limit = 50, testId } = q;
    const where: any = {};
    if (testId) where.testId = testId;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { displayOrder: 'ASC' } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'Test question'); }
  async create(dto: CreateTestQuestionDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateTestQuestionDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async delete(id: string) { await this.repo.remove(await this.findById(id)); }
}

@Injectable()
export class TestAttemptService {
  constructor(
    @InjectRepository(TestAttempt) private repo: Repository<TestAttempt>,
    @InjectRepository(Test) private testRepo: Repository<Test>,
  ) {}

  async findAll(q: any) {
    const { page = 1, limit = 20, testId, userId, status } = q;
    const where: any = {};
    if (testId) where.testId = testId;
    if (userId) where.userId = userId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'Test attempt'); }
  async start(dto: StartTestAttemptDto, userId: string) {
    const test = await findOr404(this.testRepo, dto.testId, 'Test');
    if (test.status !== TestStatus.PUBLISHED) throw new BadRequestException('Test is not published');

    // Check attempt limit
    const submittedCount = await this.repo.count({
      where: { testId: dto.testId, userId, status: TestAttemptStatus.SUBMITTED },
    });
    if (submittedCount >= test.attemptLimit) throw new BadRequestException('Attempt limit reached');

    return this.repo.save(this.repo.create({
      testId: dto.testId, userId, status: TestAttemptStatus.IN_PROGRESS, startedAt: new Date(),
    } as any));
  }
  async submit(id: string, dto: SubmitTestAttemptDto) {
    const attempt = await this.findById(id);
    if (attempt.status !== TestAttemptStatus.IN_PROGRESS) throw new BadRequestException('Attempt already submitted');
    Object.assign(attempt, { status: TestAttemptStatus.SUBMITTED, submittedAt: new Date(), durationSeconds: dto.durationSeconds });
    return this.repo.save(attempt);
  }
}

@Injectable()
export class TestAnswerService {
  constructor(@InjectRepository(TestAnswer) private repo: Repository<TestAnswer>) {}
  async submitAnswer(attemptId: string, dto: SubmitTestAnswerDto) {
    const answer = this.repo.create({
      attemptId, questionId: dto.questionId, answer: dto.answer, isCorrect: false, pointsAwarded: 0,
    } as any);
    return this.repo.save(answer);
  }
  async findByAttempt(attemptId: string) {
    return this.repo.find({ where: { attemptId } as any, order: { createdAt: 'ASC' } });
  }
}
