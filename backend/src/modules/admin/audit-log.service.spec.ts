import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLogService } from './audit-log.service';
import { AdminAuditLog } from './entities/admin-audit-log.entity';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repo: { create: jest.Mock; save: jest.Mock; createQueryBuilder: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn((x) => x),
      save: jest.fn().mockResolvedValue({}),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: getRepositoryToken(AdminAuditLog), useValue: repo },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('logAction', () => {
    it('persists an audit log row', async () => {
      await service.logAction('admin-1', 'CREATE_USER', 'USER', 'u1', '127.0.0.1', {
        newValue: { email: 'test@example.com' },
      });

      expect(repo.create).toHaveBeenCalledWith({
        adminId: 'admin-1',
        action: 'CREATE_USER',
        targetType: 'USER',
        targetId: 'u1',
        ipAddress: '127.0.0.1',
        oldValue: undefined,
        newValue: { email: 'test@example.com' },
        reason: undefined,
      });
      expect(repo.save).toHaveBeenCalled();
    });

    it('does not throw when save fails (graceful degradation)', async () => {
      repo.save.mockRejectedValue(new Error('DB down'));

      await expect(
        service.logAction('admin-1', 'X', 'Y', 'z', '127.0.0.1'),
      ).resolves.not.toThrow();
    });
  });

  describe('getLogs', () => {
    it('returns paginated logs with admin email/name joined', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([
          [
            { id: 'log1', admin: { email: 'admin@x.com', fullName: 'Admin X' } },
          ],
          1,
        ]),
      };
      repo.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.getLogs({ page: 1, limit: 20 });

      expect(result.data[0].adminEmail).toBe('admin@x.com');
      expect(result.data[0].adminName).toBe('Admin X');
      expect(result.meta.total).toBe(1);
    });

    it('filters by adminId', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      repo.createQueryBuilder.mockReturnValue(mockQb);

      await service.getLogs({ adminId: 'admin-1' });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'log.adminId = :adminId',
        { adminId: 'admin-1' },
      );
    });

    it('filters by action', async () => {
      const mockQb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      repo.createQueryBuilder.mockReturnValue(mockQb);

      await service.getLogs({ action: 'BAN_USER' });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'log.action = :action',
        { action: 'BAN_USER' },
      );
    });
  });
});