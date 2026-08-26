import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserStatsService } from './user-stats.service';
import { User } from '../../auth/entities/user.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { TestAttempt } from '../../test/entities/test-attempt.entity';

describe('UserStatsService', () => {
  let service: UserStatsService;
  let userRepo: { count: jest.Mock; createQueryBuilder: jest.Mock };
  let subRepo: { createQueryBuilder: jest.Mock };
  let attemptRepo: { count: jest.Mock; createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    userRepo = { count: jest.fn(), createQueryBuilder: jest.fn() };
    subRepo = { createQueryBuilder: jest.fn() };
    attemptRepo = { count: jest.fn(), createQueryBuilder: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserStatsService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Subscription), useValue: subRepo },
        { provide: getRepositoryToken(TestAttempt), useValue: attemptRepo },
      ],
    }).compile();

    service = module.get<UserStatsService>(UserStatsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSummaryStats', () => {
    it('returns total users and active VIP count', async () => {
      userRepo.count.mockResolvedValue(100);
      const qb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '25' }),
      };
      subRepo.createQueryBuilder.mockReturnValue(qb);

      const [users, vip] = await service.getSummaryStats();

      expect(users.value).toBe(100);
      expect(vip.value).toBe(25);
    });

    it('defaults VIP count to 0 when query returns nothing', async () => {
      userRepo.count.mockResolvedValue(0);
      const qb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };
      subRepo.createQueryBuilder.mockReturnValue(qb);

      const [, vip] = await service.getSummaryStats();
      expect(vip.value).toBe(0);
    });
  });

  describe('getAttemptsStats', () => {
    it('counts attempts for today and yesterday', async () => {
      attemptRepo.count
        .mockResolvedValueOnce(50) // today
        .mockResolvedValueOnce(40); // yesterday

      const result = await service.getAttemptsStats();

      expect(result.value).toBe(50);
      expect(result.yesterday).toBe(40);
    });
  });

  describe('getRegistrationsChart', () => {
    it('returns chart data with date and count', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { date: '01-01', count: '5' },
          { date: '01-02', count: '10' },
        ]),
      };
      userRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getRegistrationsChart(7);

      expect(result).toEqual([
        { date: '01-01', count: 5 },
        { date: '01-02', count: 10 },
      ]);
    });
  });

  describe('getAttemptsChart', () => {
    it('returns chart data from attempts', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ date: '01-01', count: '8' }]),
      };
      attemptRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getAttemptsChart(7);

      expect(result).toEqual([{ date: '01-01', count: 8 }]);
    });
  });
});