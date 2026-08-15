import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { randomUUID } from 'crypto';
import { Reward } from '../entities/reward.entity';
import { UserReward } from '../entities/user-reward.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { User } from '../../auth/entities/user.entity';
import { ExpService } from '../exp.service';
import { ActivityService } from '../activity.service';
import {
  RewardType,
  ActivityType,
} from '../../../common/enums/achievements.enums';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../common/enums/subscription.enums';

/**
 * RewardsService — catalog + redemption + inventory (PR-33).
 * Redeem: idempotent + SELECT FOR UPDATE + debit EXP + grant theo type.
 */
@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward) private rewardRepo: Repository<Reward>,
    @InjectRepository(UserReward) private userRewardRepo: Repository<UserReward>,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    private expService: ExpService,
    private activityService: ActivityService,
    private dataSource: DataSource,
  ) {}

  /** Catalog: active rewards + affordable flag cho client. */
  async getCatalog(userId: string) {
    const rewards = await this.rewardRepo.find({ where: { active: true } });
    const balance = await this.expService.getBalance(userId);
    return rewards.map((r) => ({
      ...r,
      affordable: balance.current >= r.costExp,
      expNeeded: Math.max(0, r.costExp - balance.current),
    }));
  }

  /** Inventory: user_rewards của user. */
  async getInventory(userId: string) {
    return this.userRewardRepo.find({
      where: { userId },
      order: { redeemedAt: 'DESC' },
    });
  }

  /** Redeem: trừ EXP + tạo user_reward + grant. */
  async redeem(userId: string, rewardId: string, idempotencyKey?: string) {
    const idemKey = idempotencyKey ?? `redeem:${userId}:${rewardId}:${Date.now()}`;

    return this.dataSource.transaction(async (em) => {
      // Idempotency: đã redeem với key này → return existing.
      const existing = await em.getRepository(UserReward).findOne({
        where: { userId, idempotencyKey: idemKey },
      });
      if (existing) return existing;

      const reward = await em.getRepository(Reward).findOne({ where: { id: rewardId } });
      if (!reward || !reward.active) throw new NotFoundException('Reward not found');

      // Debit EXP (lock + insufficient check inside).
      await this.expService.debit(em, userId, reward.costExp, rewardId, idemKey);

      // Create user_reward (snapshot).
      const userReward = em.getRepository(UserReward).create({
        userId, rewardId, idempotencyKey: idemKey,
        type: reward.type, metadata: { ...reward.metadata },
      });
      const saved = await em.getRepository(UserReward).save(userReward);

      // Grant theo type.
      await this.grant(em, userId, reward, saved.id);

      await this.activityService.log(
        em, userId, ActivityType.REDEEMED_REWARD,
        { rewardCode: reward.code, cost: reward.costExp, userRewardId: saved.id },
        -reward.costExp,
      );
      return saved;
    });
  }

  /** Grant phần thưởng theo type (trong tx). */
  private async grant(em: EntityManager, userId: string, reward: Reward, userRewardId: string) {
    const meta = reward.metadata as any;

    switch (reward.type) {
      case RewardType.TEMPORARY_VIP: {
        const durationHours = meta?.durationHours ?? 24;
        const scope: string[] = meta?.scope ?? [];
        const durationMs = durationHours * 3_600_000;
        // Tìm VIP active cùng scope để extend.
        const subs = await em.getRepository(Subscription).find({
          where: { userId, plan: SubscriptionPlan.VIP, status: SubscriptionStatus.ACTIVE },
        });
        const match = subs.find((s) => JSON.stringify(s.scope ?? []) === JSON.stringify(scope));
        if (match) {
          const base = match.expiresAt && match.expiresAt > new Date() ? match.expiresAt : new Date();
          await em.getRepository(Subscription).update(match.id, {
            expiresAt: new Date(base.getTime() + durationMs),
          });
        } else {
          await em.getRepository(Subscription).save(
            em.getRepository(Subscription).create({
              userId, plan: SubscriptionPlan.VIP,
              status: SubscriptionStatus.ACTIVE,
              startsAt: new Date(),
              expiresAt: new Date(Date.now() + durationMs),
              scope,
            }),
          );
        }
        break;
      }
      case RewardType.DISCOUNT_VOUCHER: {
        // Sinh voucher code unique, lưu vào user_reward metadata.
        const voucherCode = `VCH-${randomUUID().slice(0, 8).toUpperCase()}`;
        await em.query(
          'UPDATE user_rewards SET metadata = metadata || $2 WHERE id = $1',
          [userRewardId, JSON.stringify({ voucherCode, percent: meta?.percent, target: meta?.target })],
        );
        break;
      }
      case RewardType.CONTENT_UNLOCK:
      case RewardType.COSMETIC:
        // Metadata only — client check entitlement.
        break;
    }
  }
}
