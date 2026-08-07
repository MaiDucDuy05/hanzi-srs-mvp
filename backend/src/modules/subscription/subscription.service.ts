import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  Repository,
  QueryFailedError,
} from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { DailyPracticeUsage } from './entities/daily-practice-usage.entity';
import { PracticeLimitSettings } from './entities/practice-limit-settings.entity';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  UpdateLimitSettingsDto,
  SubscriptionQueryDto,
  DailyUsageQueryDto,
} from './dto/subscription.dto';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../common/enums/subscription.enums';
import { Role } from '../../common/enums/user.enums';
import {
  paginatedResult,
  findOrNotFound,
} from '../../common/helpers/query-helpers';

/** Ngày tính theo UTC (MVP); khi cấu hình resetTimezone sẽ đổi theo múi giờ. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription) private repo: Repository<Subscription>,
  ) {}
  async findAll(q: SubscriptionQueryDto) {
    const { page = 1, limit = 20, userId, plan, status } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (plan) where.plan = plan;
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
    return findOrNotFound(this.repo, id, 'Subscription');
  }

  /**
   * Tự xem gói của mình (authenticated, không cần ADMIN): trả gói ACTIVE gần nhất
   * hoặc null nếu chưa có. Frontend dùng để phân biệt VIP subscriber vs FREE.
   */
  async findByUser(userId: string) {
    const sub = await this.repo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
    return sub || null;
  }

  /** GET /subscriptions/:id chỉ dành cho chủ sở hữu hoặc ADMIN (tránh rò gói người khác). */
  async findByIdScoped(id: string, userId: string, role: string) {
    const sub = await this.findById(id);
    if (sub.userId !== userId && role !== Role.ADMIN)
      throw new NotFoundException('Subscription not found');
    return sub;
  }

  async create(dto: CreateSubscriptionDto) {
    return this.repo.save(this.repo.create(dto as any));
  }
  async update(id: string, dto: UpdateSubscriptionDto) {
    const e = await this.findById(id);
    Object.assign(e, dto);
    return this.repo.save(e);
  }
  async delete(id: string) {
    await this.repo.remove(await this.findById(id));
  }
  async checkVipEntitlement(userId: string): Promise<boolean> {
    const sub = await this.repo.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.VIP,
      },
    });
    if (!sub) return false;
    if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) return false;
    return true;
  }
}

@Injectable()
export class DailyUsageService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(DailyPracticeUsage)
    private repo: Repository<DailyPracticeUsage>,
    @InjectRepository(PracticeLimitSettings)
    private settingsRepo: Repository<PracticeLimitSettings>,
    private subscriptionSvc: SubscriptionService,
  ) {}

  async findAll(q: DailyUsageQueryDto) {
    const { page = 1, limit = 20, userId, usageDate } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (usageDate) where.usageDate = usageDate;
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { usageDate: 'DESC' },
    });
    return paginatedResult(data, total, page, limit);
  }

  private async getFreeLimit(em?: EntityManager): Promise<number> {
    const settings = em
      ? await em.getRepository(PracticeLimitSettings).findOne({ where: {} })
      : await this.settingsRepo.findOne({ where: {} });
    return settings?.enabled !== false ? (settings?.freeLimit ?? 3) : 999;
  }

  /**
   * Kiểm tra lượt KHÔNG tăng (pure peek) — dùng cho màn hình báo trước.
   * Việc chốt lượt thật sự nằm ở `consumeInTransaction` trong API start (PR-14 §3.2).
   * Teacher/Admin/VIP miễn trừ (đồng bộ với consumeInTransaction).
   */
  async peek(
    userId: string,
    activityKey: string,
    role?: string,
  ): Promise<{ allowed: boolean; usedCount: number; limit: number }> {
    if (role === Role.TEACHER || role === Role.ADMIN)
      return { allowed: true, usedCount: 0, limit: 0 };
    const isVip = await this.subscriptionSvc.checkVipEntitlement(userId);
    if (isVip) return { allowed: true, usedCount: 0, limit: 0 };
    const freeLimit = await this.getFreeLimit();
    const usage = await this.repo.findOne({
      where: { userId, activityKey, usageDate: today() },
    });
    const usedCount = usage?.usedCount ?? 0;
    return { allowed: usedCount < freeLimit, usedCount, limit: freeLimit };
  }

  /**
   * Tiêu thụ 1 lượt TRONG transaction tạo attempt (PR-14 §3.2, §3.3):
   * - VIP/Teacher/Admin miễn trừ (không tăng bộ đếm).
   * - Row-lock (pessimistic_write) bản ghi usage để chống vượt giới hạn khi
   *   hai request chạy đồng thời; nếu hết lượt ném HTTP 429 FREE_ATTEMPT_LIMIT_REACHED.
   * - Nếu attempt tạo lỗi → transaction rollback → không mất lượt oan.
   */
  async consumeInTransaction(
    em: EntityManager,
    userId: string,
    activityKey: string,
    role: string | undefined,
  ): Promise<{ allowed: boolean; usedCount: number; limit: number }> {
    if (role === Role.TEACHER || role === Role.ADMIN)
      return { allowed: true, usedCount: 0, limit: 0 };
    const isVip = await this.subscriptionSvc.checkVipEntitlement(userId);
    if (isVip) return { allowed: true, usedCount: 0, limit: 0 };

    const usageDate = today();
    const freeLimit = await this.getFreeLimit(em);
    const usageRepo = em.getRepository(DailyPracticeUsage);

    // SELECT ... FOR UPDATE: khoá dòng usage để hai request không cùng vượt giới hạn.
    let usage = await usageRepo
      .createQueryBuilder('u')
      .setLock('pessimistic_write')
      .where(
        'u.userId = :userId AND u.activityKey = :activityKey AND u.usageDate = :usageDate',
        { userId, activityKey, usageDate },
      )
      .getOne();

    if (!usage) {
      usage = usageRepo.create({
        userId,
        activityKey,
        usageDate,
        usedCount: 0,
      });
      try {
        usage = await usageRepo.save(usage);
      } catch (err) {
        // Hai request cùng chèn bản ghi mới → dính unique(user,key,date);
        // đọc lại bản ghi đã tồn tại rồi khoá để tăng tiếp.
        if (!(err instanceof QueryFailedError)) throw err;
        usage = await usageRepo
          .createQueryBuilder('u')
          .setLock('pessimistic_write')
          .where(
            'u.userId = :userId AND u.activityKey = :activityKey AND u.usageDate = :usageDate',
            { userId, activityKey, usageDate },
          )
          .getOne();
        if (!usage) {
          // Winner đã rollback toàn bộ transaction → bản ghi không tồn tại,
          // thử chèn lại một lần nữa (không được 429 oan).
          usage = usageRepo.create({
            userId,
            activityKey,
            usageDate,
            usedCount: 0,
          });
          usage = await usageRepo.save(usage);
        }
      }
    }

    if (!usage || usage.usedCount >= freeLimit) {
      throw new HttpException(
        'FREE_ATTEMPT_LIMIT_REACHED: Bạn đã dùng hết lượt luyện tập của bài này hôm nay.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    usage.usedCount += 1;
    await usageRepo.save(usage);
    return { allowed: true, usedCount: usage.usedCount, limit: freeLimit };
  }
}

@Injectable()
export class LimitSettingsService {
  constructor(
    @InjectRepository(PracticeLimitSettings)
    private repo: Repository<PracticeLimitSettings>,
  ) {}
  async get() {
    const s = await this.repo.findOne({ where: {} });
    return s || null;
  }
  async upsert(dto: UpdateLimitSettingsDto) {
    let s = await this.repo.findOne({ where: {} });
    if (!s) {
      s = this.repo.create({
        freeLimit: dto.freeLimit ?? 3,
        resetTimezone: dto.resetTimezone ?? 'Asia/Ho_Chi_Minh',
        enabled: dto.enabled ?? true,
      });
    } else {
      Object.assign(s, dto);
    }
    return this.repo.save(s);
  }
}
