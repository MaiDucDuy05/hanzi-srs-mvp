import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { Reward } from '../entities/reward.entity';
import { UserReward } from '../entities/user-reward.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { ExpService } from '../exp.service';
import { ActivityService } from '../activity.service';

describe('RewardsService', () => {
  let service: RewardsService;
  let rewardRepo: { find: jest.Mock };
  let userRewardRepo: { find: jest.Mock };
  let expService: { getBalance: jest.Mock; debit: jest.Mock };
  let activityService: { log: jest.Mock };
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    rewardRepo = { find: jest.fn() };
    userRewardRepo = { find: jest.fn() };
    expService = {
      getBalance: jest.fn(),
      debit: jest.fn().mockResolvedValue(undefined),
    };
    activityService = { log: jest.fn().mockResolvedValue(undefined) };
    dataSource = { transaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsService,
        { provide: getRepositoryToken(Reward), useValue: rewardRepo },
        { provide: getRepositoryToken(UserReward), useValue: userRewardRepo },
        { provide: getRepositoryToken(Subscription), useValue: { find: jest.fn() } },
        { provide: ExpService, useValue: expService },
        { provide: ActivityService, useValue: activityService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getCatalog', () => {
    it('returns rewards with affordable flag based on balance', async () => {
      rewardRepo.find.mockResolvedValue([
        { id: 'r1', code: 'VIP_24H', costExp: 100, active: true } as any,
        { id: 'r2', code: 'BIG_VIP', costExp: 5000, active: true } as any,
      ]);
      expService.getBalance.mockResolvedValue({ current: 200, total: 1000 });

      const result = await service.getCatalog('u1');

      expect(result[0]).toEqual(expect.objectContaining({ affordable: true, expNeeded: 0 }));
      expect(result[1]).toEqual(expect.objectContaining({ affordable: false, expNeeded: 4800 }));
    });
  });

  describe('getInventory', () => {
    it('returns user rewards ordered by redeemedAt DESC', async () => {
      userRewardRepo.find.mockResolvedValue([{ id: 'ur1' }]);

      const result = await service.getInventory('u1');

      expect(userRewardRepo.find).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        order: { redeemedAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('redeem', () => {
    function buildEmMock(opts: {
      existingUserReward?: any;
      reward?: any;
      subscriptions?: any[];
    }) {
      const userRewardRepoMock = {
        findOne: jest.fn().mockImplementation(({ where }) => {
          if (opts.existingUserReward && where?.idempotencyKey) {
            return Promise.resolve(opts.existingUserReward);
          }
          return Promise.resolve(null);
        }),
        create: jest.fn((x) => x),
        save: jest.fn().mockImplementation((x) => Promise.resolve({ ...x, id: 'ur-new' })),
      };
      const rewardRepoMock = {
        findOne: jest.fn().mockResolvedValue(opts.reward ?? null),
      };
      const subRepoMock = {
        find: jest.fn().mockResolvedValue(opts.subscriptions ?? []),
        create: jest.fn((x) => x),
        save: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
      };

      return {
        getRepository: jest.fn((entity: any) => {
          if (entity === UserReward) return userRewardRepoMock;
          if (entity === Reward) return rewardRepoMock;
          if (entity === Subscription) return subRepoMock;
          return null;
        }),
        query: jest.fn().mockResolvedValue([]),
      };
    }

    it('returns existing userReward when idempotencyKey matches', async () => {
      const existing = { id: 'ur1', idempotencyKey: 'k1' };
      const emMock = buildEmMock({ existingUserReward: existing });
      dataSource.transaction.mockImplementation((cb: any) => cb(emMock));

      const result = await service.redeem('u1', 'r1', 'k1');

      expect(result).toEqual(existing);
      expect(expService.debit).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when reward is missing', async () => {
      const emMock = buildEmMock({});
      dataSource.transaction.mockImplementation((cb: any) => cb(emMock));

      await expect(service.redeem('u1', 'r-x', 'k1')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when reward is inactive', async () => {
      const emMock = buildEmMock({
        reward: { id: 'r1', active: false, type: 'COSMETIC', costExp: 50, metadata: {} },
      });
      dataSource.transaction.mockImplementation((cb: any) => cb(emMock));

      await expect(service.redeem('u1', 'r1', 'k1')).rejects.toThrow(NotFoundException);
    });

    it('debits EXP, creates user_reward, logs activity for COSMETIC reward', async () => {
      const reward = {
        id: 'r1', code: 'COSMETIC_X', active: true,
        type: 'COSMETIC', costExp: 100, metadata: {},
      };
      const emMock = buildEmMock({ reward });
      dataSource.transaction.mockImplementation((cb: any) => cb(emMock));

      await service.redeem('u1', 'r1', 'k1');

      expect(expService.debit).toHaveBeenCalledWith(
        emMock, 'u1', 100, 'r1', 'k1',
      );
      expect(activityService.log).toHaveBeenCalledWith(
        emMock, 'u1', 'REDEEMED_REWARD',
        expect.objectContaining({ rewardCode: 'COSMETIC_X', cost: 100 }),
        -100,
      );
    });

    it('extends existing TEMPORARY_VIP subscription when scope matches', async () => {
      const reward = {
        id: 'r1', code: 'VIP', active: true,
        type: 'TEMPORARY_VIP', costExp: 50,
        metadata: { durationHours: 1, scope: ['practice'] },
      };
      const existingSub = {
        id: 'sub-1', userId: 'u1', plan: 'VIP', status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 60_000), scope: ['practice'],
      };
      const emMock = buildEmMock({ reward, subscriptions: [existingSub] });
      dataSource.transaction.mockImplementation((cb: any) => cb(emMock));

      await service.redeem('u1', 'r1', 'k1');

      // update was called on existing sub (extend) — sub.update was triggered
      expect(emMock.getRepository(Subscription).update).toHaveBeenCalled();
    });

    it('creates new TEMPORARY_VIP subscription when none matching scope exists', async () => {
      const reward = {
        id: 'r1', code: 'VIP', active: true,
        type: 'TEMPORARY_VIP', costExp: 50,
        metadata: { durationHours: 1, scope: ['practice'] },
      };
      const emMock = buildEmMock({ reward, subscriptions: [] });
      dataSource.transaction.mockImplementation((cb: any) => cb(emMock));

      await service.redeem('u1', 'r1', 'k1');

      // sub.save was called (create new) instead of update
      expect(emMock.getRepository(Subscription).save).toHaveBeenCalled();
    });

    it('generates voucher code for DISCOUNT_VOUCHER reward', async () => {
      const reward = {
        id: 'r2', code: 'VCH50', active: true,
        type: 'DISCOUNT_VOUCHER', costExp: 200,
        metadata: { percent: 50, target: 'course' },
      };
      const emMock = buildEmMock({ reward });
      dataSource.transaction.mockImplementation((cb: any) => cb(emMock));

      await service.redeem('u1', 'r2', 'k2');

      expect(emMock.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE user_rewards'),
        expect.arrayContaining(['ur-new']),
      );
    });
  });
});