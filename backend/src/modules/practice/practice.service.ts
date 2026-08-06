import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeQuestion } from './entities/practice-question.entity';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { CreatePracticeQuestionDto, UpdatePracticeQuestionDto, StartPracticeAttemptDto, SubmitPracticeAttemptDto } from './dto/practice.dto';
import { PracticeAttemptStatus } from '../../common/enums/practice.enums';
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
export class PracticeQuestionService {
  constructor(@InjectRepository(PracticeQuestion) private repo: Repository<PracticeQuestion>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', questionType, levelId, status } = q;
    const where: any = {};
    if (questionType) where.questionType = questionType;
    if (levelId) where.levelId = levelId;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { [sortBy]: sortOrder } });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'Practice question'); }
  async create(dto: CreatePracticeQuestionDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdatePracticeQuestionDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async softDelete(id: string) { await this.repo.softRemove(await this.findById(id)); }
}

@Injectable()
export class PracticeAttemptService {
  constructor(@InjectRepository(PracticeAttempt) private repo: Repository<PracticeAttempt>) {}
  async findAll(q: any) {
    const { page = 1, limit = 20, userId, practiceType, status } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (practiceType) where.practiceType = practiceType;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({
      where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' },
    });
    return paginated(data, total, page, limit);
  }
  async findById(id: string) { return findOr404(this.repo, id, 'Practice attempt'); }
  async start(dto: StartPracticeAttemptDto, userId: string) {
    if (dto.idempotencyKey) {
      const existing = await this.repo.findOne({
        where: { userId, idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing;
    }
    const attempt = this.repo.create({
      ...dto,
      userId,
      status: PracticeAttemptStatus.IN_PROGRESS,
      startedAt: new Date(),
    } as any);
    return this.repo.save(attempt);
  }
  async submit(id: string, dto: SubmitPracticeAttemptDto) {
    const attempt = await this.findById(id);
    if (attempt.status !== PracticeAttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt is not in progress');
    }
    Object.assign(attempt, dto, { status: PracticeAttemptStatus.COMPLETED, completedAt: new Date() });
    return this.repo.save(attempt);
  }
}
