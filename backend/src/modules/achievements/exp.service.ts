import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ExpTransaction } from './entities/exp-transaction.entity';
import { ConfigCacheService } from '../config/config-cache.service';
import {
  ExpTransactionType,
  ExpRefType,
} from '../../common/enums/achievements.enums';

/** Kết quả awardFromAttempt. */
export interface AttemptExpInput {
  correct: number;
  total: number;
  combo: number;
  refId: string;
}

/**
 * ExpService — quản lý EXP ledger + cache balance + daily cap (PR-33).
 * Internal service (không controller) — chỉ gọi server-side trong tx grading.
 * Tất cả write qua `em` (EntityManager của caller) → atomic với grading.
 */
@Injectable()
export class ExpService {
  private readonly maxDailyExp: number;

  constructor(
    @InjectEntityManager()
    private readonly em: EntityManager,
    private configService: ConfigService,
    private configCache: ConfigCacheService,
  ) {
    this.maxDailyExp = Number(this.configService.get<string>('MAX_DAILY_EXP') ?? 200);
  }

  /**
   * Cộng EXP generic. Áp daily cap (trừ streak type bypass).
   * @returns EXP thực cộng (sau cap), 0 nếu idempotent hoặc bị cap hết.
   */
  async award(
    em: EntityManager,
    userId: string,
    amount: number,
    type: ExpTransactionType,
    refType: ExpRefType | null = null,
    refId: string | null = null,
    idempotencyKey: string | null = null,
  ): Promise<number> {
    if (amount <= 0) return 0;

    // Idempotency: đã có tx với key này → skip.
    if (idempotencyKey) {
      const existing = await em.getRepository(ExpTransaction).findOne({
        where: { userId, idempotencyKey },
      });
      if (existing) return 0;
    }

    // Daily cap (streak bypass).
    const bypassCap = type === ExpTransactionType.EARN_STREAK;
    let capped = amount;
    if (!bypassCap) {
      capped = await this.applyCap(em, userId, amount);
      if (capped <= 0) return 0;
    }

    // Insert ledger + update cache (SELECT FOR UPDATE users).
    await this.recordTx(em, userId, capped, type, refType, refId, idempotencyKey);
    return capped;
  }

  /**
   * Cộng EXP từ attempt: 10 (lesson) + perfect 5 + combo bonus.
   * combo bonus = 2 * max(0, combo - 2).
   */
  async awardFromAttempt(
    em: EntityManager,
    userId: string,
    input: AttemptExpInput,
    idempotencyKey?: string,
  ): Promise<number> {
    const { correct, total, combo, refId } = input;
    const baseReward = await this.configCache.get('exp_base_reward', 10);
    const perfectReward = await this.configCache.get('exp_perfect_reward', 5);
    const comboMultiplier = await this.configCache.get('exp_combo_multiplier', 2);

    const isPerfect = total > 0 && correct === total;
    const comboBonus = comboMultiplier * Math.max(0, combo - 2);

    let totalAwarded = 0;
    const baseKey = idempotencyKey ?? `${refId}:${Date.now()}`;

    totalAwarded += await this.award(
      em, userId, baseReward, ExpTransactionType.EARN_LESSON,
      ExpRefType.PRACTICE_ATTEMPT, refId, `${baseKey}:lesson`,
    );
    if (isPerfect) {
      totalAwarded += await this.award(
        em, userId, perfectReward, ExpTransactionType.EARN_PERFECT,
        ExpRefType.PRACTICE_ATTEMPT, refId, `${baseKey}:perfect`,
      );
    }
    if (comboBonus > 0) {
      totalAwarded += await this.award(
        em, userId, comboBonus, ExpTransactionType.EARN_COMBO,
        ExpRefType.PRACTICE_ATTEMPT, refId, `${baseKey}:combo`,
      );
    }
    return totalAwarded;
  }

  /**
   * Trừ EXP (redeem). Lock row users, throw nếu không đủ.
   */
  async debit(
    em: EntityManager,
    userId: string,
    amount: number,
    refId: string,
    idempotencyKey: string,
  ): Promise<void> {
    // Idempotency.
    const existing = await em.getRepository(ExpTransaction).findOne({
      where: { userId, idempotencyKey },
    });
    if (existing) return;

    // Lock + check balance.
    const rows = await em.query(
      'SELECT current_exp FROM users WHERE id = $1 FOR UPDATE',
      [userId],
    );
    if (!rows.length) throw new BadRequestException('User not found');
    if (rows[0].current_exp < amount) {
      throw new BadRequestException('Không đủ EXP để redeem');
    }

    await this.recordTx(
      em, userId, -amount, ExpTransactionType.REDEEM,
      ExpRefType.USER_REWARD, refId, idempotencyKey,
    );
  }

  /** Đọc balance O(1) từ cache users. */
  async getBalance(userId: string): Promise<{ current: number; total: number }> {
    const rows = await this.em.query(
      'SELECT current_exp, total_exp FROM users WHERE id = $1',
      [userId],
    );
    if (!rows.length) return { current: 0, total: 0 };
    return { current: rows[0].current_exp, total: rows[0].total_exp };
  }

  // ── Private helpers ──

  /** Áp daily cap, trả về amount thực tế được cộng. */
  private async applyCap(em: EntityManager, userId: string, amount: number): Promise<number> {
    const today = new Date().toISOString().slice(0, 10);
    // Lock daily earnings row (insert if missing).
    const rows = await em.query(
      `SELECT earned FROM exp_daily_earnings WHERE user_id = $1 AND date = $2 FOR UPDATE`,
      [userId, today],
    );
    const earned = rows.length ? Number(rows[0].earned) : 0;
    const remaining = this.maxDailyExp - earned;
    return Math.min(amount, Math.max(0, remaining));
  }

  /** Insert ledger tx + update users cache (atomic trong em tx). */
  private async recordTx(
    em: EntityManager,
    userId: string,
    amount: number,
    type: ExpTransactionType,
    refType: ExpRefType | null,
    refId: string | null,
    idempotencyKey: string | null,
  ): Promise<void> {
    await em.getRepository(ExpTransaction).save(
      em.getRepository(ExpTransaction).create({
        userId, amount, type, refType, refId, idempotencyKey,
      }),
    );
    // Update cache: current_exp += amount, total_exp += max(amount, 0).
    // total_exp chỉ tăng khi cộng (redeem không giảm total).
    const totalDelta = amount > 0 ? amount : 0;
    await em.query(
      `UPDATE users SET current_exp = current_exp + $2, total_exp = total_exp + $3 WHERE id = $1`,
      [userId, amount, totalDelta],
    );

    // Update daily earnings if it's earning (amount > 0) and not bypassing cap
    if (amount > 0 && type !== ExpTransactionType.EARN_STREAK) {
      const today = new Date().toISOString().slice(0, 10);
      await em.query(
        `INSERT INTO exp_daily_earnings (user_id, date, earned) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, date) DO UPDATE SET earned = exp_daily_earnings.earned + $3`,
        [userId, today, amount],
      );
    }
  }
}
