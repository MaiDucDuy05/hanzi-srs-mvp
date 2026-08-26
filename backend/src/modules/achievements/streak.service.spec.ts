import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { StreakService } from './streak.service';
import { ExpService } from './exp.service';
import { ActivityService } from './activity.service';
import {
  ExpTransactionType,
  ActivityType,
  ExpRefType,
} from '../../common/enums/achievements.enums';

describe('StreakService', () => {
  let service: StreakService;
  let expService: { award: jest.Mock };
  let activityService: { log: jest.Mock };
  let em: { query: jest.Mock };

  beforeEach(async () => {
    expService = { award: jest.fn().mockResolvedValue(50) };
    activityService = { log: jest.fn().mockResolvedValue(undefined) };
    em = { query: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreakService,
        { provide: ExpService, useValue: expService },
        { provide: ActivityService, useValue: activityService },
        { provide: EntityManager, useValue: em },
      ],
    }).compile();

    service = module.get<StreakService>(StreakService);
  });

  afterEach(() => jest.clearAllMocks());

  it('returns streak=0 when user does not exist', async () => {
    em.query.mockResolvedValueOnce([]);

    const result = await service.recordActivityAndCheckMilestones(em as any, 'u-x');

    expect(result).toEqual({ streak: 0, milestoneAwarded: 0 });
    expect(expService.award).not.toHaveBeenCalled();
  });

  it('returns current streak when activity already recorded today', async () => {
    const today = new Date().toISOString().slice(0, 10);
    em.query.mockResolvedValueOnce([{ current_streak: 4, last_activity_date: today }]);

    const result = await service.recordActivityAndCheckMilestones(em as any, 'u1');

    expect(result).toEqual({ streak: 4, milestoneAwarded: 0 });
    expect(expService.award).not.toHaveBeenCalled();
  });

  it('starts new streak at 1 when last activity was before yesterday', async () => {
    em.query.mockResolvedValueOnce([{ current_streak: 0, last_activity_date: null }]);
    em.query.mockResolvedValueOnce(undefined); // UPDATE

    const result = await service.recordActivityAndCheckMilestones(em as any, 'u1');

    expect(result.streak).toBe(1);
    expect(result.milestoneAwarded).toBe(0);
    expect(em.query).toHaveBeenCalledTimes(2);
  });

  it('increments streak when last activity was yesterday', async () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    em.query.mockResolvedValueOnce([{ current_streak: 6, last_activity_date: yesterday }]);
    em.query.mockResolvedValueOnce(undefined);

    const result = await service.recordActivityAndCheckMilestones(em as any, 'u1');

    expect(result.streak).toBe(7);
    expect(result.milestoneAwarded).toBe(50); // milestone at 7
    expect(expService.award).toHaveBeenCalledWith(
      em, 'u1', 50,
      ExpTransactionType.EARN_STREAK,
      ExpRefType.STREAK,
      null,
      expect.stringContaining('streak:u1:'),
    );
    expect(activityService.log).toHaveBeenCalledWith(
      em, 'u1', ActivityType.STREAK_MILESTONE,
      expect.objectContaining({ streak: 7 }),
      50,
    );
  });

  it('awards 100 EXP for 14-day milestone', async () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    em.query.mockResolvedValueOnce([{ current_streak: 13, last_activity_date: yesterday }]);
    em.query.mockResolvedValueOnce(undefined);

    const result = await service.recordActivityAndCheckMilestones(em as any, 'u1');

    expect(result.streak).toBe(14);
    expect(result.milestoneAwarded).toBe(100);
  });

  it('awards 200 EXP for 30-day milestone', async () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    em.query.mockResolvedValueOnce([{ current_streak: 29, last_activity_date: yesterday }]);
    em.query.mockResolvedValueOnce(undefined);

    const result = await service.recordActivityAndCheckMilestones(em as any, 'u1');

    expect(result.streak).toBe(30);
    expect(result.milestoneAwarded).toBe(200);
  });

  it('does not award EXP for non-milestone day', async () => {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    em.query.mockResolvedValueOnce([{ current_streak: 9, last_activity_date: yesterday }]);
    em.query.mockResolvedValueOnce(undefined);

    const result = await service.recordActivityAndCheckMilestones(em as any, 'u1');

    expect(result.streak).toBe(10);
    expect(result.milestoneAwarded).toBe(0);
    expect(expService.award).not.toHaveBeenCalled();
  });
});