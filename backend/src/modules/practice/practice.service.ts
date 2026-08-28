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

import { SrsService } from '../srs/srs.service';
import { SrsRating } from '../srs/dto/srs.dto';
import { ExpService } from '../achievements/exp.service';
import { ActivityService } from '../achievements/activity.service';
import { StreakService } from '../achievements/streak.service';
import { ActivityType } from '../../common/enums/achievements.enums';

@Injectable()
export class PracticeAttemptService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(PracticeAttempt)
    private repo: Repository<PracticeAttempt>,
    private readonly limitSvc: DailyUsageService,
    private readonly srsService: SrsService,
    private readonly expService: ExpService,
    private readonly activityService: ActivityService,
    private readonly streakService: StreakService,
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

    // Tích hợp SRS: duyệt qua vocabResults nếu có
    if (dto.answerData && dto.answerData.vocabResults) {
      const vocabResults = dto.answerData.vocabResults as Record<string, boolean>;
      for (const [vocabId, isCorrect] of Object.entries(vocabResults)) {
        try {
          await this.srsService.submitReview(userId, {
            vocabularyId: vocabId,
            rating: isCorrect ? SrsRating.GOOD : SrsRating.AGAIN,
          });
        } catch (e) {
          // Bỏ qua lỗi nếu từ vựng không tồn tại để không làm hỏng việc submit practice
          console.warn(`Failed to update SRS for vocab ${vocabId}:`, e);
        }
      }
    }

    const updateData = {
      ...dto,
      status: PracticeAttemptStatus.COMPLETED,
      completedAt: new Date(),
    };
    Object.assign(attempt, updateData);

    await this.repo.update({ id: attempt.id }, updateData as any);
    const savedAttempt = attempt;

    // Bắt đầu logging activity và cộng EXP
    try {
      await this.dataSource.transaction(async (em) => {
        const totalQ = dto.answerData && (dto.answerData as any).totalQuestions ? (dto.answerData as any).totalQuestions : (attempt.correctCount + attempt.wrongCount);
        const expAwarded = await this.expService.awardFromAttempt(
          em, userId,
          { correct: attempt.correctCount || 0, total: totalQ || 0, combo: 0, refId: attempt.id },
          `${attempt.id}:practice`
        );
        
        if (expAwarded > 0) {
          await this.activityService.log(
            em, userId, ActivityType.PRACTICE_COMPLETED,
            { attemptId: attempt.id, type: attempt.practiceType, correct: attempt.correctCount, total: totalQ },
            expAwarded
          );
        }
        await this.streakService.recordActivityAndCheckMilestones(em, userId);
      });
    } catch (e) {
      console.warn(`Failed to log activity/exp for generic practice ${id}:`, e);
    }

    return savedAttempt;
  }
}
