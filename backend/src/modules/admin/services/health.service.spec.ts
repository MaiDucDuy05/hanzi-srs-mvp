import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';
import { SystemJobLog } from '../entities/system-job-log.entity';
import { Resource } from '../../resources/entities/resource.entity';
import { AiGenerationJob } from '../../resources/entities/ai-generation-job.entity';

describe('HealthService', () => {
  let service: HealthService;
  let dataSource: { query: jest.Mock };
  let jobLogRepo: { createQueryBuilder: jest.Mock };
  let resourceRepo: { createQueryBuilder: jest.Mock };
  let aiJobRepo: { count: jest.Mock };

  beforeEach(async () => {
    dataSource = { query: jest.fn() };
    jobLogRepo = { createQueryBuilder: jest.fn() };
    resourceRepo = { createQueryBuilder: jest.fn() };
    aiJobRepo = { count: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: getRepositoryToken(SystemJobLog), useValue: jobLogRepo },
        { provide: getRepositoryToken(Resource), useValue: resourceRepo },
        { provide: getRepositoryToken(AiGenerationJob), useValue: aiJobRepo },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSystemHealth', () => {
    it('returns "Optimal" status when DB is reachable', async () => {
      dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const resourceQb = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: '5242880' }), // 5 MB
      };
      resourceRepo.createQueryBuilder.mockReturnValue(resourceQb);
      aiJobRepo.count.mockResolvedValue(12);

      const jobQb = {
        distinctOn: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { jobName: 'purge', lastRun: new Date('2026-01-01'), status: 'OK' },
        ]),
      };
      jobLogRepo.createQueryBuilder.mockReturnValue(jobQb);

      const result = await service.getSystemHealth();

      expect(result.statusLabel).toBe('Optimal');
      expect(result.healthPercent).toBe(100);
      expect(result.aiCallsToday).toBe(12);
      expect(result.storageUsedMb).toBe(5);
      expect(result.cronJobs).toHaveLength(1);
      expect(result.cronJobs[0].name).toBe('purge');
    });

    it('returns "Critical" status when DB ping fails', async () => {
      dataSource.query.mockRejectedValue(new Error('DB down'));

      const resourceQb = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: null }),
      };
      resourceRepo.createQueryBuilder.mockReturnValue(resourceQb);
      aiJobRepo.count.mockResolvedValue(0);

      const jobQb = {
        distinctOn: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      jobLogRepo.createQueryBuilder.mockReturnValue(jobQb);

      const result = await service.getSystemHealth();

      expect(result.statusLabel).toBe('Critical');
      expect(result.healthPercent).toBe(0);
      expect(result.statusMessage).toContain('Không kết nối được');
    });

    it('handles storage sum being null (defaults to 0)', async () => {
      dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

      const resourceQb = {
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: null }),
      };
      resourceRepo.createQueryBuilder.mockReturnValue(resourceQb);
      aiJobRepo.count.mockResolvedValue(0);

      const jobQb = {
        distinctOn: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      jobLogRepo.createQueryBuilder.mockReturnValue(jobQb);

      const result = await service.getSystemHealth();
      expect(result.storageUsedMb).toBe(0);
    });
  });
});