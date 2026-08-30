import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
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
import { ConfigCacheService } from '../config/config-cache.service';
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
import { RedisUsageService } from './redis-usage.service';

/** Ngày tính theo UTC (MVP); khi cấu hình resetTimezone sẽ đổi theo múi giờ. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription) private repo: Repository<Subscription>,
    private configCache: ConfigCacheService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
    const sub = await this.repo.save(this.repo.create(dto as any)) as any as Subscription;
    await this.cacheManager.del(`vip_entitlement:${sub.userId}`);
    return sub;
  }
  async update(id: string, dto: UpdateSubscriptionDto) {
    const e = await this.findById(id);
    Object.assign(e, dto);
    const sub = await this.repo.save(e);
    await this.cacheManager.del(`vip_entitlement:${sub.userId}`);
    return sub;
  }
  async delete(id: string) {
    const e = await this.findById(id);
    await this.repo.remove(e);
    await this.cacheManager.del(`vip_entitlement:${e.userId}`);
  }
  async checkVipEntitlement(userId: string): Promise<boolean> {
    const cacheKey = `vip_entitlement:${userId}`;
    const cached = await this.cacheManager.get<boolean>(cacheKey);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    const sub = await this.repo.findOne({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.VIP,
      },
    });
    
    let isVip = false;
    if (sub) {
      if (sub.expiresAt) {
        const gracePeriodDays = await this.configCache.get('VIP_GRACE_PERIOD_DAYS', 7);
        const expiryDate = new Date(sub.expiresAt);
        
        // Add grace period to expiry date
        const effectiveExpiryDate = new Date(expiryDate);
        effectiveExpiryDate.setDate(effectiveExpiryDate.getDate() + Number(gracePeriodDays));
        
        if (effectiveExpiryDate >= new Date()) {
          isVip = true;
        }
      } else {
        isVip = true;
      }
    }

    await this.cacheManager.set(cacheKey, isVip, 60000); // 60 seconds
    return isVip;
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
    private configCache: ConfigCacheService,
    private redisUsage: RedisUsageService,
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

  private async getFreeLimit(): Promise<number> {
    // Read from central SystemConfig via cache
    // The previous PracticeLimitSettings entity is kept for backward compatibility if needed,
    // but the system config takes precedence in PR-31.
    const limit = await this.configCache.get('FREE_DAILY_PLAY_LIMIT', 3);
    return Number(limit);
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
   * Tiêu thụ 1 lượt TRONG request tạo attempt (PR-14 §3.2, §3.3):
   * - VIP/Teacher/Admin miễn trừ.
   * - Dùng Redis INCR (atomic, ~0.1ms) thay SELECT...FOR UPDATE.
   * - Throw 429 nếu vượt limit.
   */
  async consumeLimit(
    userId: string,
    activityKey: string,
    role: string | undefined,
  ): Promise<{ allowed: boolean; usedCount: number; limit: number }> {
    if (role === Role.TEACHER || role === Role.ADMIN)
      return { allowed: true, usedCount: 0, limit: 0 };
    const isVip = await this.subscriptionSvc.checkVipEntitlement(userId);
    if (isVip) return { allowed: true, usedCount: 0, limit: 0 };

    const freeLimit = await this.getFreeLimit();

    // --- Redis path (fast, no locking on DB) ---
    const newCount = await this.redisUsage.increment(userId, activityKey);
    if (newCount !== null) {
      if (newCount > freeLimit) {
        // Over limit: undo increment để không tính oan
        await this.redisUsage.decrement(userId, activityKey);
        throw new HttpException(
          'FREE_ATTEMPT_LIMIT_REACHED: Bạn đã dùng hết lượt luyện tập của bài này hôm nay.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      return { allowed: true, usedCount: newCount, limit: freeLimit };
    }

    // --- Fallback: PG pessimistic lock khi Redis không khả dụng ---
    return this.dataSource.transaction(async (em) => {
      const usageDate = today();
      const usageRepo = em.getRepository(DailyPracticeUsage);

      let usage = await usageRepo
        .createQueryBuilder('u')
        .setLock('pessimistic_write')
        .where(
          'u.userId = :userId AND u.activityKey = :activityKey AND u.usageDate = :usageDate',
          { userId, activityKey, usageDate },
        )
        .getOne();

      if (!usage) {
        usage = usageRepo.create({ userId, activityKey, usageDate, usedCount: 0 });
        try {
          usage = await usageRepo.save(usage);
        } catch (err) {
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
            usage = usageRepo.create({ userId, activityKey, usageDate, usedCount: 0 });
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
    });
  }

  async revertUsage(userId: string, activityKey: string, role: string | undefined): Promise<void> {
    if (role === Role.TEACHER || role === Role.ADMIN) return;
    const isVip = await this.subscriptionSvc.checkVipEntitlement(userId);
    if (isVip) return;

    // Ưu tiên Redis
    if (this.redisUsage.isAvailable()) {
      await this.redisUsage.decrement(userId, activityKey);
      return;
    }

    // Fallback Postgres revert
    await this.dataSource.transaction(async (em) => {
      const usageRepo = em.getRepository(DailyPracticeUsage);
      const usage = await usageRepo
        .createQueryBuilder('u')
        .setLock('pessimistic_write')
        .where(
          'u.userId = :userId AND u.activityKey = :activityKey AND u.usageDate = :usageDate',
          { userId, activityKey, usageDate: today() },
        )
        .getOne();
      
      if (usage && usage.usedCount > 0) {
        usage.usedCount -= 1;
        await usageRepo.save(usage);
      }
    });
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
