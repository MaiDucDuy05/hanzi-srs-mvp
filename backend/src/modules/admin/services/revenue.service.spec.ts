import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { RevenueService } from './revenue.service';
import { Subscription } from '../../subscription/entities/subscription.entity';

describe('RevenueService', () => {
  let service: RevenueService;
  let subRepo: { count: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    subRepo = { count: jest.fn() };
    configService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevenueService,
        { provide: getRepositoryToken(Subscription), useValue: subRepo },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<RevenueService>(RevenueService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSummaryRevenue', () => {
    it('computes revenue from this month and last month VIP subscriptions', async () => {
      configService.get.mockReturnValue('9.99');
      subRepo.count
        .mockResolvedValueOnce(10) // this month
        .mockResolvedValueOnce(5); // last month

      const result = await service.getSummaryRevenue();

      expect(result.value).toBe(99.9);
      expect(result.lastMonth).toBe(49.95);
    });

    it('defaults VIP_PRICE_MONTHLY to 9.99 when not set', async () => {
      configService.get.mockReturnValue(undefined);
      subRepo.count.mockResolvedValue(0);

      const result = await service.getSummaryRevenue();

      expect(result.value).toBe(0);
      expect(result.lastMonth).toBe(0);
    });

    it('rounds to 2 decimals', async () => {
      configService.get.mockReturnValue('3.333');
      subRepo.count.mockResolvedValue(3);

      const result = await service.getSummaryRevenue();

      expect(result.value).toBe(10); // 3.333 * 3 = 9.999 → 10.00
    });
  });
});