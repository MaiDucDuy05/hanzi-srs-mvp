import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { SubscriptionService, DailyUsageService, LimitSettingsService } from './subscription.service';
import { Subscription } from './entities/subscription.entity';
import { DailyPracticeUsage } from './entities/daily-practice-usage.entity';
import { PracticeLimitSettings } from './entities/practice-limit-settings.entity';
import { SubscriptionPlan, SubscriptionStatus } from '../../common/enums/subscription.enums';
import { Role } from '../../common/enums/user.enums';
import { ConfigCacheService } from '../config/config-cache.service';

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repo: jest.Mocked<Repository<Subscription>>;

  const mockSubscription: Subscription = {
    id: 'sub-1',
    userId: 'user-1',
    plan: SubscriptionPlan.VIP,
    status: SubscriptionStatus.ACTIVE,
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: getRepositoryToken(Subscription), useValue: mockRepo },
        { provide: ConfigCacheService, useValue: { get: jest.fn().mockResolvedValue(7) } },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    repo = module.get(getRepositoryToken(Subscription));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated subscriptions', async () => {
      repo.findAndCount.mockResolvedValue([[mockSubscription], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockSubscription]);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by userId', async () => {
      repo.findAndCount.mockResolvedValue([[mockSubscription], 1]);

      await service.findAll({ userId: 'user-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }),
      );
    });

    it('should filter by plan', async () => {
      repo.findAndCount.mockResolvedValue([[mockSubscription], 1]);

      await service.findAll({ plan: SubscriptionPlan.VIP });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ plan: SubscriptionPlan.VIP }),
        }),
      );
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockSubscription], 1]);

      await service.findAll({ status: SubscriptionStatus.ACTIVE });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: SubscriptionStatus.ACTIVE }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return subscription when found', async () => {
      repo.findOne.mockResolvedValue(mockSubscription);

      const result = await service.findById('sub-1');

      expect(result).toEqual(mockSubscription);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow();
    });
  });

  describe('findByUser', () => {
    it('should return active subscription for user', async () => {
      repo.findOne.mockResolvedValue(mockSubscription);

      const result = await service.findByUser('user-1');

      expect(result).toEqual(mockSubscription);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1', status: SubscriptionStatus.ACTIVE },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return null when no active subscription', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.findByUser('user-1');

      expect(result).toBeNull();
    });
  });

  describe('findByIdScoped', () => {
    it('should return subscription for owner', async () => {
      repo.findOne.mockResolvedValue(mockSubscription);

      const result = await service.findByIdScoped('sub-1', 'user-1', Role.FREE);

      expect(result).toEqual(mockSubscription);
    });

    it('should return subscription for admin', async () => {
      repo.findOne.mockResolvedValue(mockSubscription);

      const result = await service.findByIdScoped('sub-1', 'admin-1', Role.ADMIN);

      expect(result).toEqual(mockSubscription);
    });

    it('should throw NotFoundException for non-owner non-admin', async () => {
      repo.findOne.mockResolvedValue(mockSubscription);

      await expect(service.findByIdScoped('sub-1', 'other-user', Role.FREE)).rejects.toThrow();
    });
  });

  describe('checkVipEntitlement', () => {
    it('should return true for active VIP subscription with future expiry', async () => {
      repo.findOne.mockResolvedValue(mockSubscription);

      const result = await service.checkVipEntitlement('user-1');

      expect(result).toBe(true);
    });

    it('should return false when no VIP subscription', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.checkVipEntitlement('user-1');

      expect(result).toBe(false);
    });

    it('should return true for expired VIP subscription within grace period', async () => {
      // Sub expired 1 second ago, but default 7-day grace keeps it valid.
      const expiredSub = { ...mockSubscription, expiresAt: new Date(Date.now() - 1000) };
      repo.findOne.mockResolvedValue(expiredSub);

      const result = await service.checkVipEntitlement('user-1');

      expect(result).toBe(true);
    });

    it('should return false for VIP subscription expired beyond grace period', async () => {
      const longExpiredSub = { ...mockSubscription, expiresAt: new Date(Date.now() - 30 * 86_400_000) };
      repo.findOne.mockResolvedValue(longExpiredSub);

      const result = await service.checkVipEntitlement('user-1');

      expect(result).toBe(false);
    });
  });

  describe('create', () => {
    it('should create new subscription', async () => {
      const createDto = { userId: 'user-1', plan: SubscriptionPlan.VIP, status: SubscriptionStatus.ACTIVE, startsAt: new Date().toISOString() };
      repo.create.mockReturnValue(mockSubscription);
      repo.save.mockResolvedValue(mockSubscription);

      const result = await service.create(createDto);

      expect(result).toEqual(mockSubscription);
    });
  });

  describe('update', () => {
    it('should update subscription', async () => {
      const updateDto = { status: SubscriptionStatus.EXPIRED };
      const updated = { ...mockSubscription, ...updateDto };
      repo.findOne.mockResolvedValue(mockSubscription);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('sub-1', updateDto);

      expect(result.status).toBe(SubscriptionStatus.EXPIRED);
    });
  });
});

describe('DailyUsageService', () => {
  let service: DailyUsageService;
  let usageRepo: jest.Mocked<Repository<DailyPracticeUsage>>;
  let settingsRepo: jest.Mocked<Repository<PracticeLimitSettings>>;
  let subscriptionSvc: jest.Mocked<SubscriptionService>;
  let dataSource: jest.Mocked<DataSource>;

  const mockUsage: DailyPracticeUsage = {
    id: 'usage-1',
    userId: 'user-1',
    activityKey: 'FLASHCARD:LEVEL:level-1',
    usageDate: new Date().toISOString().slice(0, 10),
    usedCount: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsageRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockSettingsRepo = {
      findOne: jest.fn(),
    };

    const mockSubscriptionSvc = {
      checkVipEntitlement: jest.fn(),
    };

    const mockDataSource = {
      transaction: jest.fn(),
    };

    const mockConfigCache = {
      get: jest.fn((key: string, defaultVal: number) => defaultVal),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyUsageService,
        { provide: getRepositoryToken(DailyPracticeUsage), useValue: mockUsageRepo },
        { provide: getRepositoryToken(PracticeLimitSettings), useValue: mockSettingsRepo },
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: SubscriptionService, useValue: mockSubscriptionSvc },
        { provide: ConfigCacheService, useValue: mockConfigCache },
      ],
    }).compile();

    service = module.get<DailyUsageService>(DailyUsageService);
    usageRepo = module.get(getRepositoryToken(DailyPracticeUsage));
    settingsRepo = module.get(getRepositoryToken(PracticeLimitSettings));
    subscriptionSvc = module.get(SubscriptionService);
    dataSource = module.get(getDataSourceToken());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated usage records', async () => {
      usageRepo.findAndCount.mockResolvedValue([[mockUsage], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockUsage]);
    });

    it('should filter by userId', async () => {
      usageRepo.findAndCount.mockResolvedValue([[mockUsage], 1]);

      await service.findAll({ userId: 'user-1' });

      expect(usageRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }),
      );
    });

    it('should filter by usageDate', async () => {
      usageRepo.findAndCount.mockResolvedValue([[mockUsage], 1]);
      const testDate = '2024-01-15';

      await service.findAll({ usageDate: testDate });

      expect(usageRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usageDate: testDate },
        }),
      );
    });
  });

  describe('peek', () => {
    it('should return allowed=true for teacher', async () => {
      const result = await service.peek('teacher-1', 'FLASHCARD:LEVEL:level-1', Role.TEACHER);

      expect(result).toEqual({ allowed: true, usedCount: 0, limit: 0 });
    });

    it('should return allowed=true for admin', async () => {
      const result = await service.peek('admin-1', 'FLASHCARD:LEVEL:level-1', Role.ADMIN);

      expect(result).toEqual({ allowed: true, usedCount: 0, limit: 0 });
    });

    it('should return allowed=true for VIP user', async () => {
      subscriptionSvc.checkVipEntitlement.mockResolvedValue(true);

      const result = await service.peek('vip-user', 'FLASHCARD:LEVEL:level-1', Role.FREE);

      expect(result).toEqual({ allowed: true, usedCount: 0, limit: 0 });
    });

    it('should return allowed=true when under limit', async () => {
      subscriptionSvc.checkVipEntitlement.mockResolvedValue(false);
      settingsRepo.findOne.mockResolvedValue({ freeLimit: 3, enabled: true } as PracticeLimitSettings);
      usageRepo.findOne.mockResolvedValue({ ...mockUsage, usedCount: 2 } as DailyPracticeUsage);

      const result = await service.peek('user-1', 'FLASHCARD:LEVEL:level-1', Role.FREE);

      expect(result).toEqual({ allowed: true, usedCount: 2, limit: 3 });
    });

    it('should return allowed=false when at limit', async () => {
      subscriptionSvc.checkVipEntitlement.mockResolvedValue(false);
      settingsRepo.findOne.mockResolvedValue({ freeLimit: 3, enabled: true } as PracticeLimitSettings);
      usageRepo.findOne.mockResolvedValue({ ...mockUsage, usedCount: 3 } as DailyPracticeUsage);

      const result = await service.peek('user-1', 'FLASHCARD:LEVEL:level-1', Role.FREE);

      expect(result).toEqual({ allowed: false, usedCount: 3, limit: 3 });
    });

    it('should return allowed=true when no usage record exists', async () => {
      subscriptionSvc.checkVipEntitlement.mockResolvedValue(false);
      settingsRepo.findOne.mockResolvedValue({ freeLimit: 3, enabled: true } as PracticeLimitSettings);
      usageRepo.findOne.mockResolvedValue(null);

      const result = await service.peek('user-1', 'FLASHCARD:LEVEL:level-1', Role.FREE);

      expect(result).toEqual({ allowed: true, usedCount: 0, limit: 3 });
    });

    it('should use default limit when no settings exist', async () => {
      subscriptionSvc.checkVipEntitlement.mockResolvedValue(false);
      settingsRepo.findOne.mockResolvedValue(null);
      usageRepo.findOne.mockResolvedValue(null);

      const result = await service.peek('user-1', 'FLASHCARD:LEVEL:level-1', Role.FREE);

      expect(result.limit).toBe(3); // default
    });
  });
});

describe('LimitSettingsService', () => {
  let service: LimitSettingsService;
  let repo: jest.Mocked<Repository<PracticeLimitSettings>>;

  const mockSettings: PracticeLimitSettings = {
    id: 'settings-1',
    freeLimit: 3,
    resetTimezone: 'Asia/Ho_Chi_Minh',
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LimitSettingsService,
        { provide: getRepositoryToken(PracticeLimitSettings), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<LimitSettingsService>(LimitSettingsService);
    repo = module.get(getRepositoryToken(PracticeLimitSettings));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return settings when found', async () => {
      repo.findOne.mockResolvedValue(mockSettings);

      const result = await service.get();

      expect(result).toEqual(mockSettings);
    });

    it('should return null when no settings', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.get();

      expect(result).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should create settings when none exist', async () => {
      const createDto = { freeLimit: 5 };
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({ ...mockSettings, ...createDto } as PracticeLimitSettings);
      repo.save.mockResolvedValue({ ...mockSettings, ...createDto } as PracticeLimitSettings);

      const result = await service.upsert(createDto);

      expect(result.freeLimit).toBe(5);
    });

    it('should update existing settings', async () => {
      const updateDto = { freeLimit: 10 };
      repo.findOne.mockResolvedValue(mockSettings);
      repo.save.mockResolvedValue({ ...mockSettings, ...updateDto } as PracticeLimitSettings);

      const result = await service.upsert(updateDto);

      expect(result.freeLimit).toBe(10);
    });

    it('should use default values for missing fields', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(mockSettings);
      repo.save.mockResolvedValue(mockSettings);

      await service.upsert({});

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          freeLimit: 3,
          resetTimezone: 'Asia/Ho_Chi_Minh',
          enabled: true,
        }),
      );
    });
  });
});
