import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { DailyPracticeUsage } from './entities/daily-practice-usage.entity';
import { PracticeLimitSettings } from './entities/practice-limit-settings.entity';
import { CreateSubscriptionDto, UpdateSubscriptionDto, UpdateLimitSettingsDto, SubscriptionQueryDto, DailyUsageQueryDto } from './dto/subscription.dto';
import { SubscriptionPlan, SubscriptionStatus } from '../../common/enums/subscription.enums';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class SubscriptionService {
  constructor(@InjectRepository(Subscription) private repo: Repository<Subscription>) {}
  async findAll(q: SubscriptionQueryDto) {
    const { page = 1, limit = 20, userId, plan, status } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (plan) where.plan = plan;
    if (status) where.status = status;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { createdAt: 'DESC' } });
    return paginatedResult(data, total, page, limit);
  }
  async findById(id: string) { return findOrNotFound(this.repo, id, 'Subscription'); }
  async findByUser(userId: string) {
    const sub = await this.repo.findOne({ where: { userId, status: SubscriptionStatus.ACTIVE } });
    return sub || null;
  }
  async create(dto: CreateSubscriptionDto) { return this.repo.save(this.repo.create(dto as any)); }
  async update(id: string, dto: UpdateSubscriptionDto) { const e = await this.findById(id); Object.assign(e, dto); return this.repo.save(e); }
  async delete(id: string) { await this.repo.remove(await this.findById(id)); }
  async checkVipEntitlement(userId: string): Promise<boolean> {
    const sub = await this.repo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE, plan: SubscriptionPlan.VIP },
    });
    if (!sub) return false;
    if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) return false;
    return true;
  }
}

@Injectable()
export class DailyUsageService {
  constructor(
    @InjectRepository(DailyPracticeUsage) private repo: Repository<DailyPracticeUsage>,
    @InjectRepository(PracticeLimitSettings) private settingsRepo: Repository<PracticeLimitSettings>,
    private subscriptionSvc: SubscriptionService,
  ) {}

  async findAll(q: DailyUsageQueryDto) {
    const { page = 1, limit = 20, userId, usageDate } = q;
    const where: any = {};
    if (userId) where.userId = userId;
    if (usageDate) where.usageDate = usageDate;
    const [data, total] = await this.repo.findAndCount({ where, skip: (page - 1) * limit, take: limit, order: { usageDate: 'DESC' } });
    return paginatedResult(data, total, page, limit);
  }

  async checkAndIncrement(userId: string, activityKey: string): Promise<{ allowed: boolean; usedCount: number }> {
    const isVip = await this.subscriptionSvc.checkVipEntitlement(userId);
    if (isVip) return { allowed: true, usedCount: 0 };

    const today = new Date().toISOString().slice(0, 10);
    const settings = await this.settingsRepo.findOne({ where: {} });
    const freeLimit = settings?.enabled !== false ? (settings?.freeLimit ?? 3) : 999;

    let usage = await this.repo.findOne({ where: { userId, activityKey, usageDate: today } });
    if (!usage) {
      usage = this.repo.create({ userId, activityKey, usageDate: today, usedCount: 0 });
      await this.repo.save(usage);
    }

    if (usage.usedCount >= freeLimit) return { allowed: false, usedCount: usage.usedCount };

    usage.usedCount += 1;
    await this.repo.save(usage);
    return { allowed: true, usedCount: usage.usedCount };
  }
}

@Injectable()
export class LimitSettingsService {
  constructor(@InjectRepository(PracticeLimitSettings) private repo: Repository<PracticeLimitSettings>) {}
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
