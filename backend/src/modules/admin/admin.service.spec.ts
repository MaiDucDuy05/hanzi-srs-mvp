import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../subscription/entities/subscription.entity';
import { VipUpgradeRequest } from '../subscription/entities/vip-upgrade-request.entity';
import { User } from '../auth/entities/user.entity';
import { ContactRequest } from '../resources/entities/contact-request.entity';
import { AdminService } from './admin.service';
import { UserStatsService } from './services/user-stats.service';
import { RevenueService } from './services/revenue.service';
import { HealthService } from './services/health.service';
import { SystemJobLog } from './entities/system-job-log.entity';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  UpgradeRequestStatus,
} from '../../common/enums/subscription.enums';
import { ContactStatus } from '../../common/enums/resources.enums';
import { Role } from '../../common/enums/user.enums';

describe('AdminService', () => {
  let service: AdminService;
  let subRepo: jest.Mocked<Repository<Subscription>>;
  let vipReqRepo: jest.Mocked<Repository<VipUpgradeRequest>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let contactRepo: jest.Mocked<Repository<ContactRequest>>;
  let systemJobRepo: jest.Mocked<Repository<SystemJobLog>>;
  let userStatsSvc: jest.Mocked<UserStatsService>;
  let revenueSvc: jest.Mocked<RevenueService>;
  let healthSvc: jest.Mocked<HealthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Subscription),
          useValue: { find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(VipUpgradeRequest),
          useValue: { find: jest.fn(), count: jest.fn() },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { find: jest.fn(), count: jest.fn() },
        },
        {
          provide: getRepositoryToken(ContactRequest),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(SystemJobLog),
          useValue: { find: jest.fn(), createQueryBuilder: jest.fn(() => ({
            distinctOn: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            addOrderBy: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([]),
          })) },
        },
        {
          provide: UserStatsService,
          useValue: {
            getSummaryStats: jest.fn(),
            getAttemptsStats: jest.fn(),
            getRegistrationsChart: jest.fn(),
            getAttemptsChart: jest.fn(),
          },
        },
        {
          provide: RevenueService,
          useValue: { getSummaryRevenue: jest.fn() },
        },
        {
          provide: HealthService,
          useValue: { getSystemHealth: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    subRepo = module.get(getRepositoryToken(Subscription));
    vipReqRepo = module.get(getRepositoryToken(VipUpgradeRequest));
    userRepo = module.get(getRepositoryToken(User));
    contactRepo = module.get(getRepositoryToken(ContactRequest));
    systemJobRepo = module.get(getRepositoryToken(SystemJobLog));
    userStatsSvc = module.get(UserStatsService);
    revenueSvc = module.get(RevenueService);
    healthSvc = module.get(HealthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSummary', () => {
    it('should return summary with user stats and revenue', async () => {
      userStatsSvc.getSummaryStats.mockResolvedValue([
        { value: 100 },
        { value: 20 },
      ]);
      userStatsSvc.getAttemptsStats.mockResolvedValue({ value: 50, yesterday: 30 });
      revenueSvc.getSummaryRevenue.mockResolvedValue({ value: 199.8, lastMonth: 150.0 });

      const result = await service.getSummary();

      expect(result.totalUsers).toEqual({ value: 100 });
      expect(result.activeVip).toEqual({ value: 20 });
      expect(result.todayAttempts).toEqual({ value: 50, yesterday: 30 });
      expect(result.monthlyRevenue).toEqual({ value: 199.8, lastMonth: 150.0 });
    });
  });

  describe('getCharts', () => {
    it('should return registrations and attempts charts', async () => {
      userStatsSvc.getRegistrationsChart.mockResolvedValue([
        { date: '2026-01-01', count: 10 },
      ]);
      userStatsSvc.getAttemptsChart.mockResolvedValue([
        { date: '2026-01-01', count: 50 },
      ]);

      const result = await service.getCharts();

      expect(result.registrations).toHaveLength(1);
      expect(result.attempts).toHaveLength(1);
    });
  });

  describe('getPendingItems', () => {
    it('should return pending VIP requests with user full names', async () => {
      vipReqRepo.find.mockResolvedValue([
        { id: 'req-1', userId: 'user-1', plan: SubscriptionPlan.VIP, createdAt: new Date() },
      ] as VipUpgradeRequest[]);
      userRepo.find.mockResolvedValue([
        { id: 'user-1', fullName: 'Mei Lin' },
      ] as User[]);
      subRepo.find.mockResolvedValue([]);
      contactRepo.find.mockResolvedValue([]);
      systemJobRepo.find.mockResolvedValue([]);

      const result = await service.getPendingItems();

      expect(result.pendingVip).toHaveLength(1);
      expect(result.pendingVip[0].userFullName).toBe('Mei Lin');
    });

    it('should use "Unknown" when user not found for pending VIP', async () => {
      vipReqRepo.find.mockResolvedValue([
        { id: 'req-1', userId: 'ghost', plan: SubscriptionPlan.VIP, createdAt: new Date() },
      ] as VipUpgradeRequest[]);
      userRepo.find.mockResolvedValue([]);
      subRepo.find.mockResolvedValue([]);
      contactRepo.find.mockResolvedValue([]);
      systemJobRepo.find.mockResolvedValue([]);

      const result = await service.getPendingItems();

      expect(result.pendingVip[0].userFullName).toBe('Unknown');
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health status', async () => {
      healthSvc.getSystemHealth.mockResolvedValue({
        healthPercent: 100,
        statusLabel: 'Optimal',
        statusMessage: 'OK',
        lastCheckedAt: '2026-01-01T00:00:00.000Z',
        aiCallsToday: 10,
        storageUsedMb: 100,
        cronJobs: [],
      });

      const result = await service.getSystemHealth();

      expect(result.healthPercent).toBe(100);
      expect(result.statusLabel).toBe('Optimal');
    });
  });
});
