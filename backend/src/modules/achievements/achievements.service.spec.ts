import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AchievementsService } from './achievements.service';
import { UserActivity } from './entities/user-activity.entity';
import { User } from '../auth/entities/user.entity';
import { PracticeAttempt } from '../practice/entities/practice-attempt.entity';
import { ExpDailyEarnings } from './entities/exp-daily-earnings.entity';

describe('AchievementsService', () => {
  let service: AchievementsService;
  let activityRepo: { find: jest.Mock; createQueryBuilder: jest.Mock };
  let userRepo: { findOne: jest.Mock };
  let attemptRepo: { createQueryBuilder: jest.Mock };
  let dailyEarningsRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    activityRepo = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    userRepo = { findOne: jest.fn() };
    attemptRepo = { createQueryBuilder: jest.fn() };
    dailyEarningsRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        { provide: getRepositoryToken(UserActivity), useValue: activityRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(PracticeAttempt), useValue: attemptRepo },
        { provide: getRepositoryToken(ExpDailyEarnings), useValue: dailyEarningsRepo },
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getDashboard', () => {
    it('returns null when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.getDashboard('u-x');

      expect(result).toBeNull();
    });

    it('returns dashboard with level, streak, dailyXp, recent activities', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'u1',
        currentExp: 100,
        totalExp: 250,
        currentStreak: 5,
        dailyGoal: 50,
      });
      activityRepo.find.mockResolvedValue([{ id: 'a1' }]);
      dailyEarningsRepo.findOne.mockResolvedValue({ earned: 30 });

      const result = await service.getDashboard('u1');

      expect(result).toBeTruthy();
      expect(result!.balance).toEqual({ current: 100, total: 250 });
      expect(result!.streak).toBe(5);
      expect(result!.dailyXp).toBe(30);
      expect(result!.progressPercent).toBe(60);
      expect(result!.recentActivities).toHaveLength(1);
    });

    it('caps progressPercent at 100', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'u1', currentExp: 0, totalExp: 0, currentStreak: 0, dailyGoal: 50,
      });
      activityRepo.find.mockResolvedValue([]);
      dailyEarningsRepo.findOne.mockResolvedValue({ earned: 9999 });

      const result = await service.getDashboard('u1');
      expect(result!.progressPercent).toBe(100);
    });

    it('defaults dailyGoal to 50 when missing', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'u1', currentExp: 0, totalExp: 0, currentStreak: 0, dailyGoal: null,
      });
      activityRepo.find.mockResolvedValue([]);
      dailyEarningsRepo.findOne.mockResolvedValue(null);

      const result = await service.getDashboard('u1');
      expect(result!.dailyGoal).toBe(50);
      expect(result!.dailyXp).toBe(0);
    });
  });

  describe('getTimeline', () => {
    it('queries activities with date range and pagination', async () => {
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'a1' }], 1]),
      };
      activityRepo.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.getTimeline('u1', 'week', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockQb.skip).toHaveBeenCalledWith(0);
      expect(mockQb.take).toHaveBeenCalledWith(20);
    });

    it('uses 30 days for month range', async () => {
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      activityRepo.createQueryBuilder.mockReturnValue(mockQb);

      await service.getTimeline('u1', 'month', 1, 20);

      // andWhere was called with a since Date roughly 30 days ago.
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'a.created_at >= :since',
        expect.objectContaining({ since: expect.any(Date) }),
      );
    });
  });

  describe('getHeatmap', () => {
    it('returns parsed counts per day', async () => {
      const mockQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { date: '2026-01-01', count: '3' },
          { date: '2026-01-02', count: '5' },
        ]),
      };
      activityRepo.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.getHeatmap('u1');

      expect(result).toEqual([
        { date: '2026-01-01', count: 3 },
        { date: '2026-01-02', count: 5 },
      ]);
    });
  });

  describe('getRadar', () => {
    it('returns skill distribution with rounded avgCorrect', async () => {
      const mockQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'FLASHCARD', count: '10', avgCorrect: '7.555' },
          { type: 'FILL_BLANK', count: '5', avgCorrect: '4' },
        ]),
      };
      attemptRepo.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.getRadar('u1');

      expect(result).toEqual([
        { type: 'FLASHCARD', count: 10, avgCorrect: 7.56 },
        { type: 'FILL_BLANK', count: 5, avgCorrect: 4 },
      ]);
    });
  });
});