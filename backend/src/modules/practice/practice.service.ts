import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PracticeQuestion } from './entities/practice-question.entity';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import {
  CreatePracticeQuestionDto,
  UpdatePracticeQuestionDto,
  StartPracticeAttemptDto,
  SubmitPracticeAttemptDto,
  PracticeQuestionQueryDto,
  PracticeAttemptQueryDto,
} from './dto/practice.dto';
import {
  PracticeAttemptStatus,
} from '../../common/enums/practice.enums';
import { Role } from '../../common/enums/user.enums';
import { DailyUsageService } from '../subscription/subscription.service';
import {
  paginatedResult,
  findOrNotFound,
} from '../../common/helpers/query-helpers';

@Injectable()
export class PracticeQuestionService {
  constructor(
    @InjectRepository(PracticeQuestion)
    private repo: Repository<PracticeQuestion>,
  ) {}
  async findAll(q: PracticeQuestionQueryDto, role?: string) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      questionType,
      levelId,
      status,
    } = q;
    const where: any = {};
    if (questionType) where.questionType = questionType;
    if (levelId) where.levelId = levelId;
    if (status) where.status = status;
    if (role !== Role.ADMIN && role !== Role.TEACHER) {
      where.hiddenByAdmin = false;
    }
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string, role?: string) {
    const question = await findOrNotFound(this.repo, id, 'Practice question');
    if (role !== Role.ADMIN && role !== Role.TEACHER && question.hiddenByAdmin) {
      throw new ForbiddenException('This question has been hidden by administrator');
    }
    return question;
  }
  async create(dto: CreatePracticeQuestionDto) {
    return this.repo.save(this.repo.create(dto as any));
  }
  async update(id: string, dto: UpdatePracticeQuestionDto) {
    const e = await this.findById(id, Role.ADMIN);
    Object.assign(e, dto);
    return this.repo.save(e);
  }
  async softDelete(id: string) {
    await this.repo.softRemove(await this.findById(id, Role.ADMIN));
  }
}

@Injectable()
export class PracticeAttemptService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(PracticeAttempt)
    private repo: Repository<PracticeAttempt>,
    private readonly limitSvc: DailyUsageService,
  ) {}

  /** Học viên chỉ xem attempt của mình; teacher/admin được lọc theo userId (PR-03..13). */
  async findAll(q: PracticeAttemptQueryDto, userId: string, role: string) {
    const { page = 1, limit = 20, practiceType, status } = q;
    const where: any = {};
    if (role === Role.TEACHER || role === Role.ADMIN) {
      if (q.userId) where.userId = q.userId;
    } else {
      where.userId = userId;
    }
    if (practiceType) where.practiceType = practiceType;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string, userId: string, role: string) {
    const attempt = await findOrNotFound(this.repo, id, 'Practice attempt');
    if (
      attempt.userId !== userId &&
      role !== Role.TEACHER &&
      role !== Role.ADMIN
    ) {
      throw new ForbiddenException('Not allowed to view this attempt');
    }
    return attempt;
  }

  /** activityKey theo PR-14 §1.2: practiceType:sourceType:sourceId. */
  private buildActivityKey(dto: StartPracticeAttemptDto): string {
    return `${dto.practiceType}:${dto.sourceType}:${dto.sourceId}`;
  }

  /**
   * Bắt đầu bài luyện tập (PR-14 §3.2):
   * - Retry cùng idempotencyKey trả attempt cũ, KHÔNG tăng lượt lần 2.
   * - Tiêu thụ lượt (consumeInTransaction) và tạo attempt trong CÙNG transaction;
   *   nếu tạo attempt lỗi → rollback → không mất lượt oan.
   * - Hết lượt → HTTP 429 FREE_ATTEMPT_LIMIT_REACHED (từ consumeInTransaction).
   */
  async start(
    dto: StartPracticeAttemptDto,
    userId: string,
    role: string | undefined,
  ) {
    if (dto.idempotencyKey) {
      const existing = await this.repo.findOne({
        where: { userId, idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing;
    }

    return this.dataSource.transaction(async (em) => {
      await this.limitSvc.consumeInTransaction(
        em,
        userId,
        this.buildActivityKey(dto),
        role,
      );
      const attempt = await em.getRepository(PracticeAttempt).save(
        em.getRepository(PracticeAttempt).create({
          ...dto,
          userId,
          status: PracticeAttemptStatus.IN_PROGRESS,
          startedAt: new Date(),
        } as any),
      );
      return attempt;
    });
  }

  async submit(id: string, dto: SubmitPracticeAttemptDto, userId: string) {
    const attempt = await findOrNotFound(this.repo, id, 'Practice attempt');
    // Chỉ chủ sở hữu attempt mới được nộp bài (chống force-complete attempt người khác).
    if (attempt.userId !== userId)
      throw new ForbiddenException('Attempt does not belong to user');
    if (attempt.status !== PracticeAttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt is not in progress');
    }
    Object.assign(attempt, dto, {
      status: PracticeAttemptStatus.COMPLETED,
      completedAt: new Date(),
    });
    return this.repo.save(attempt);
  }
}
