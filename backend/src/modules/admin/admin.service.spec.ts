import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../subscription/entities/subscription.entity';
import { VipUpgradeRequest } from '../resources/entities/vip-upgrade-request.entity';
import { User } from '../auth/entities/user.entity';
import { AdminService } from './admin.service';
import { UserStatsService } from './services/user-stats.service';
import { RevenueService } from './services/revenue.service';
import { HealthService } from './services/health.service';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../common/enums/subscription.enums';
import { UpgradeRequestStatus } from '../../common/enums/resources.enums';
import { Role } from '../../common/enums/user.enums';

describe('AdminService', () => {
  let service: AdminService;
  let subRepo: jest.Mocked<Repository<Subscription>>;
  let vipReqRepo: jest.Mocked<Repository<VipUpgradeRequest>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let userStatsSvc: jest.Mocked<UserStatsService>;
  let revenueSvc: jest.Mocked<RevenueService>;
  let healthSvc: jest.Mocked<HealthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Subscription),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(VipUpgradeRequest),
          useValue: { count: jest.fn() },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { find: jest.fn() },
        },
        {
          provide: UserStatsService,
          useValue: {
            getStats: jest.fn(),
            countActiveVip: jest.fn(),
          },
        },
        {
          provide: RevenueService,
          useValue: { getMetrics: jest.fn() },
        },
        {
          provide: HealthService,
          useValue: { getHealth: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    subRepo = module.get(getRepositoryToken(Subscription));
    vipReqRepo = module.get(getRepositoryToken(VipUpgradeRequest));
    userRepo = module.get(getRepositoryToken(User));
    userStatsSvc = module.get(UserStatsService);
    revenueSvc = module.get(RevenueService);
    healthSvc = module.get(HealthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getOverview', () => {
    it('aggregates all sub-services + pending counts into one payload', async () => {
      userStatsSvc.getStats.mockResolvedValue({
        total: 100,
        byRole: { [Role.FREE]: 80, [Role.TEACHER]: 15, [Role.ADMIN]: 5 },
        vipCount: 20,
      });
      revenueSvc.getMetrics.mockResolvedValue({
        monthlyRevenue: 199.8,
        revenueTarget: 45000,
        currency: 'USD',
      });
      healthSvc.getHealth.mockResolvedValue({
        healthPercent: 100,
        statusLabel: 'Optimal',
        statusMessage: 'OK',
        lastCheckedAt: '2026-01-01T00:00:00.000Z',
      });
      vipReqRepo.count.mockResolvedValue(7);
      subRepo.find.mockResolvedValue([]); // no pending subs

      const result = await service.getOverview();

      expect(result.userStats.total).toBe(100);
      expect(result.userStats.vipCount).toBe(20);
      expect(result.pendingVipCount).toBe(7);
      expect(result.revenue.monthlyRevenue).toBe(199.8);
      expect(result.health.statusLabel).toBe('Optimal');
      expect(result.pendingSubscriptions).toEqual([]);
    });

    it('maps pending subscriptions with user full names', async () => {
      userStatsSvc.getStats.mockResolvedValue({
        total: 0,
        byRole: { [Role.FREE]: 0, [Role.TEACHER]: 0, [Role.ADMIN]: 0 },
        vipCount: 0,
      });
      revenueSvc.getMetrics.mockResolvedValue({
        monthlyRevenue: 0,
        revenueTarget: 45000,
        currency: 'USD',
      });
      healthSvc.getHealth.mockResolvedValue({
        healthPercent: 100,
        statusLabel: 'Optimal',
        statusMessage: 'OK',
        lastCheckedAt: '2026-01-01T00:00:00.000Z',
      });
      vipReqRepo.count.mockResolvedValue(0);

      const mockSubs = [
        {
          id: 'sub-1',
          userId: 'user-1',
          plan: SubscriptionPlan.VIP,
          status: SubscriptionStatus.ACTIVE,
        },
        {
          id: 'sub-2',
          userId: 'user-2',
          plan: SubscriptionPlan.VIP,
          status: SubscriptionStatus.ACTIVE,
        },
      ] as Subscription[];
      subRepo.find.mockResolvedValue(mockSubs);
      userRepo.find.mockResolvedValue([
        { id: 'user-1', fullName: 'Mei Lin' },
        { id: 'user-2', fullName: 'James Wu' },
      ] as User[]);

      const result = await service.getOverview();

      expect(result.pendingSubscriptions).toEqual([
        {
          id: 'sub-1',
          userId: 'user-1',
          userFullName: 'Mei Lin',
          plan: SubscriptionPlan.VIP,
        },
        {
          id: 'sub-2',
          userId: 'user-2',
          userFullName: 'James Wu',
          plan: SubscriptionPlan.VIP,
        },
      ]);
    });

    it('uses "Unknown" when user not found', async () => {
      userStatsSvc.getStats.mockResolvedValue({
        total: 0,
        byRole: { [Role.FREE]: 0, [Role.TEACHER]: 0, [Role.ADMIN]: 0 },
        vipCount: 0,
      });
      revenueSvc.getMetrics.mockResolvedValue({
        monthlyRevenue: 0,
        revenueTarget: 45000,
        currency: 'USD',
      });
      healthSvc.getHealth.mockResolvedValue({
        healthPercent: 100,
        statusLabel: 'Optimal',
        statusMessage: 'OK',
        lastCheckedAt: '2026-01-01T00:00:00.000Z',
      });
      vipReqRepo.count.mockResolvedValue(0);
      subRepo.find.mockResolvedValue([
        {
          id: 'sub-1',
          userId: 'ghost',
          plan: SubscriptionPlan.VIP,
          status: SubscriptionStatus.ACTIVE,
        },
      ] as Subscription[]);
      userRepo.find.mockResolvedValue([]); // user deleted/not found

      const result = await service.getOverview();

      expect(result.pendingSubscriptions[0].userFullName).toBe('Unknown');
    });

    it('counts only PENDING vip upgrade requests', async () => {
      userStatsSvc.getStats.mockResolvedValue({
        total: 0,
        byRole: { [Role.FREE]: 0, [Role.TEACHER]: 0, [Role.ADMIN]: 0 },
        vipCount: 0,
      });
      revenueSvc.getMetrics.mockResolvedValue({
        monthlyRevenue: 0,
        revenueTarget: 45000,
        currency: 'USD',
      });
      healthSvc.getHealth.mockResolvedValue({
        healthPercent: 100,
        statusLabel: 'Optimal',
        statusMessage: 'OK',
        lastCheckedAt: '2026-01-01T00:00:00.000Z',
      });
      subRepo.find.mockResolvedValue([]);

      await service.getOverview();

      expect(vipReqRepo.count).toHaveBeenCalledWith({
        where: { status: UpgradeRequestStatus.PENDING },
      });
    });
  });
});
