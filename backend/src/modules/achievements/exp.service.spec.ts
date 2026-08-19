import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpService } from './exp.service';
import { ExpTransaction } from './entities/exp-transaction.entity';
import { ExpDailyEarnings } from './entities/exp-daily-earnings.entity';
import { ExpTransactionType, ExpRefType } from '../../common/enums/achievements.enums';
import { ConfigCacheService } from '../config/config-cache.service';

describe('ExpService', () => {
  let service: ExpService;
  let expTxRepo: any;
  let dailyEarningsRepo: any;
  let em: any;

  beforeEach(async () => {
    expTxRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((x) => x),
      query: jest.fn(),
    };
    dailyEarningsRepo = { findOne: jest.fn(), save: jest.fn() };

    // Mock EntityManager: getRepository returns mock repos, query for raw SQL.
    em = {
      getRepository: jest.fn((entity) => {
        if (entity === ExpTransaction) return expTxRepo;
        return { findOne: jest.fn(), save: jest.fn(), create: jest.fn((x) => x) };
      }),
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpService,
        { provide: getRepositoryToken(ExpTransaction), useValue: expTxRepo },
        { provide: getRepositoryToken(ExpDailyEarnings), useValue: dailyEarningsRepo },
        { provide: EntityManager, useValue: em },
        { provide: ConfigCacheService, useValue: { get: jest.fn((key: string, defaultVal: number) => defaultVal) } },
      ],
    }).compile();

    service = module.get(ExpService);
  });

  describe('award — idempotency', () => {
    it('cùng idempotencyKey → return 0 lần 2', async () => {
      expTxRepo.findOne.mockResolvedValueOnce({ id: 'existing-tx' });
      const result = await service.award(
        em, 'user-1', 10, ExpTransactionType.EARN_LESSON,
        null, null, 'idem-key-1',
      );
      expect(result).toBe(0);
    });
  });

  describe('award — daily cap', () => {
    it('vượt MAX_DAILY_EXP → chỉ cộng phần dư', async () => {
      expTxRepo.findOne.mockResolvedValueOnce(null); // no existing idem
      // Cap: earned today = 190, max = 200 → remaining = 10.
      em.query.mockResolvedValueOnce([{ earned: 190 }]); // SELECT FOR UPDATE daily
      em.query.mockResolvedValueOnce([]); // UPDATE users

      const result = await service.award(
        em, 'user-1', 50, ExpTransactionType.EARN_LESSON,
        null, null, 'idem-key-2',
      );
      expect(result).toBe(10); // 200 - 190 = 10
    });

    it('đã đạt cap → return 0', async () => {
      expTxRepo.findOne.mockResolvedValueOnce(null);
      em.query.mockResolvedValueOnce([{ earned: 200 }]); // cap reached

      const result = await service.award(
        em, 'user-1', 10, ExpTransactionType.EARN_LESSON,
        null, null, 'idem-key-3',
      );
      expect(result).toBe(0);
    });
  });

  describe('award — streak bypass cap', () => {
    it('EARN_STREAK không bị cap', async () => {
      expTxRepo.findOne.mockResolvedValueOnce(null);
      em.query.mockResolvedValueOnce([]); // UPDATE users

      const result = await service.award(
        em, 'user-1', 50, ExpTransactionType.EARN_STREAK,
        ExpRefType.STREAK, null, 'streak-key-1',
      );
      expect(result).toBe(50); // full amount, no cap
    });
  });

  describe('debit — insufficient', () => {
    it('throw BadRequestException khi current_exp < amount', async () => {
      expTxRepo.findOne.mockResolvedValueOnce(null); // no existing idem
      em.query.mockResolvedValueOnce([{ current_exp: 5 }]); // SELECT FOR UPDATE users

      await expect(
        service.debit(em, 'user-1', 100, 'reward-1', 'debit-key-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('awardFromAttempt', () => {
    it('perfect + combo → 10 + 5 + combo bonus', async () => {
      // 3 award calls (lesson + perfect + combo), mỗi cái idempotent check + cap + record.
      expTxRepo.findOne.mockResolvedValue(null); // no existing
      // Cap queries: 3 calls, mỗi trả earned=0 (full cap available).
      em.query.mockResolvedValue([{ earned: 0 }]); // cap check (repeated)
      // 10 (lesson) + 5 (perfect) + 4 (combo: 2*(4-2)=4) = 19
      const result = await service.awardFromAttempt(
        em, 'user-1',
        { correct: 5, total: 5, combo: 4, refId: 'attempt-1' },
        'attempt-1:fill',
      );
      expect(result).toBe(19);
    });
  });
});
