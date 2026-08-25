import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminGrammarsService } from './admin-grammars.service';
import { GrammarPoint } from '../../curriculum/entities/grammar-point.entity';
import { AuditLogService } from '../../admin/audit-log.service';

describe('AdminGrammarsService', () => {
  let service: AdminGrammarsService;
  let grammarRepo: {
    createQueryBuilder: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let auditLog: { logAction: jest.Mock };

  beforeEach(async () => {
    grammarRepo = {
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn().mockImplementation((x: any) => {
        x.id = x.id ?? 'g-new';
        return Promise.resolve(x);
      }),
    };
    auditLog = { logAction: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGrammarsService,
        { provide: getRepositoryToken(GrammarPoint), useValue: grammarRepo },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get<AdminGrammarsService>(AdminGrammarsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    function buildQb(data: any[] = [], total = 0) {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([data, total]),
      };
      return qb;
    }

    it('returns paginated grammars with isActive filter', async () => {
      grammarRepo.createQueryBuilder.mockReturnValue(buildQb([{ id: 'g1' }], 1));

      await service.findAll({});

      const qb = grammarRepo.createQueryBuilder.mock.results[0].value;
      expect(qb.where).toHaveBeenCalledWith('grammar.isActive = :isActive', { isActive: true });
    });

    it('filters by levelId, status and search', async () => {
      const qb = buildQb();
      grammarRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ status: 'PUBLISHED', search: '了', levelId: 'l1' });

      expect(qb.andWhere).toHaveBeenCalledWith('grammar.status = :status', { status: 'PUBLISHED' });
      expect(qb.andWhere).toHaveBeenCalledWith('grammar.title ILIKE :search', { search: '%了%' });
      expect(qb.andWhere).toHaveBeenCalledWith('grammar.levelId = :levelId', { levelId: 'l1' });
    });
  });

  describe('create', () => {
    it('creates a grammar with default status DRAFT', async () => {
      await service.create({ title: '了', structure: 'V+了', levelId: 'l1' }, 'admin-1', '127.0.0.1');

      expect(grammarRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        title: '了',
        structure: 'V+了',
        status: 'DRAFT',
      }));
      expect(grammarRepo.save).toHaveBeenCalled();
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'CREATE_GRAMMAR', 'GRAMMAR', expect.anything(), '127.0.0.1',
        expect.objectContaining({ newValue: expect.any(Object) }),
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException when not found', async () => {
      grammarRepo.findOne.mockResolvedValue(null);

      await expect(service.update('g-x', {}, 'admin-1', '127.0.0.1')).rejects.toThrow(NotFoundException);
    });

    it('updates grammar with audit log', async () => {
      grammarRepo.findOne.mockResolvedValue({ id: 'g1', title: 'old', structure: 's' });

      await service.update('g1', { title: 'new' }, 'admin-1', '127.0.0.1');

      expect(grammarRepo.save).toHaveBeenCalled();
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'UPDATE_GRAMMAR', 'GRAMMAR', 'g1', '127.0.0.1',
        expect.any(Object),
      );
    });
  });

  describe('remove', () => {
    it('soft deletes (isActive=false)', async () => {
      const grammar = { id: 'g1', isActive: true } as GrammarPoint;
      grammarRepo.findOne.mockResolvedValue(grammar);

      await service.remove('g1', 'admin-1', '127.0.0.1');

      expect(grammar.isActive).toBe(false);
      expect(grammar.deletedAt).toBeDefined();
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'DELETE_GRAMMAR', 'GRAMMAR', 'g1', '127.0.0.1',
        expect.any(Object),
      );
    });

    it('throws when not found', async () => {
      grammarRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('g-x', 'admin-1', '127.0.0.1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportCsv', () => {
    it('returns CSV with title, structure, explanation, hsk_level', async () => {
      grammarRepo.find.mockResolvedValue([
        {
          title: '了',
          structure: 'V+了',
          explanation: 'Completed action',
          level: { name: 'HSK 1' },
        },
      ]);

      const csv = await service.exportCsv();
      expect(csv).toContain('title,structure,explanation,hsk_level');
      expect(csv).toContain('"了","V+了","Completed action","HSK 1"');
    });

    it('escapes double quotes in explanation', async () => {
      grammarRepo.find.mockResolvedValue([
        {
          title: '啊',
          structure: 'a',
          explanation: 'He said "hello"',
          level: { name: 'HSK 1' },
        },
      ]);

      const csv = await service.exportCsv();
      expect(csv).toContain('He said ""hello""');
    });
  });
});