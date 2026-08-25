import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminTopicsService } from './admin-topics.service';
import { Topic } from '../../curriculum/entities/topic.entity';
import { TopicVocabulary } from '../../curriculum/entities/topic-vocabulary.entity';
import { AuditLogService } from '../../admin/audit-log.service';

describe('AdminTopicsService', () => {
  let service: AdminTopicsService;
  let topicRepo: { createQueryBuilder: jest.Mock; create: jest.Mock; save: jest.Mock; findOne: jest.Mock };
  let topicVocabRepo: { find: jest.Mock; save: jest.Mock; create: jest.Mock; delete: jest.Mock };
  let auditLog: { logAction: jest.Mock };

  beforeEach(async () => {
    topicRepo = {
      createQueryBuilder: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn().mockImplementation((x: any) => {
        x.id = x.id ?? 't-new';
        return Promise.resolve(x);
      }),
      findOne: jest.fn(),
    };
    topicVocabRepo = {
      find: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      create: jest.fn((x) => x),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    auditLog = { logAction: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminTopicsService,
        { provide: getRepositoryToken(Topic), useValue: topicRepo },
        { provide: getRepositoryToken(TopicVocabulary), useValue: topicVocabRepo },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get<AdminTopicsService>(AdminTopicsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    function buildQb(data: any[] = [], total = 0) {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([data, total]),
      };
      return qb;
    }

    it('returns paginated topics with isActive filter', async () => {
      topicRepo.createQueryBuilder.mockReturnValue(buildQb([{ id: 't1' }], 1));

      const result = await service.findAll({});

      expect(result.items).toHaveLength(1);
    });

    it('filters by status and search', async () => {
      const qb = buildQb();
      topicRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ status: 'PUBLISHED', search: '你好' });

      expect(qb.andWhere).toHaveBeenCalledWith('topic.status = :status', { status: 'PUBLISHED' });
      expect(qb.andWhere).toHaveBeenCalledWith('topic.name ILIKE :search', { search: '%你好%' });
    });
  });

  describe('create / update / updateStatus', () => {
    it('creates topic with default DRAFT', async () => {
      await service.create({ name: 'T1', levelId: 'l1' }, 'admin-1', '127.0.0.1');
      expect(topicRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'T1', status: 'DRAFT',
      }));
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'CREATE_TOPIC', 'TOPIC', expect.anything(), '127.0.0.1',
        expect.objectContaining({ newValue: expect.any(Object) }),
      );
    });

    it('updates topic and writes audit log', async () => {
      const existing = { id: 't1', name: 'Old' } as Topic;
      topicRepo.findOne.mockResolvedValue(existing);

      await service.update('t1', { name: 'New' }, 'admin-1', '127.0.0.1');

      expect(existing.name).toBe('New');
      expect(auditLog.logAction).toHaveBeenCalled();
    });

    it('throws on update when not found', async () => {
      topicRepo.findOne.mockResolvedValue(null);
      await expect(service.update('t-x', {}, 'admin-1', '127.0.0.1'))
        .rejects.toThrow(NotFoundException);
    });

    it('updates status', async () => {
      const existing = { id: 't1', status: 'DRAFT' } as Topic;
      topicRepo.findOne.mockResolvedValue(existing);

      await service.updateStatus('t1', 'PUBLISHED', 'admin-1', '127.0.0.1');

      expect(existing.status).toBe('PUBLISHED');
      expect(auditLog.logAction).toHaveBeenCalled();
    });
  });

  describe('getTopicVocabularies', () => {
    it('returns vocabularies flattened with topicVocabularyId', async () => {
      topicVocabRepo.find.mockResolvedValue([
        {
          id: 'tv-1', displayOrder: 1,
          vocabulary: { id: 'v1', hanzi: '你' },
        },
      ]);

      const result = await service.getTopicVocabularies('t1');
      expect(result).toEqual([
        { id: 'v1', hanzi: '你', topicVocabularyId: 'tv-1', displayOrder: 1 },
      ]);
    });
  });

  describe('assignVocabularies', () => {
    it('skips already-assigned vocabIds', async () => {
      topicVocabRepo.find.mockResolvedValue([
        { vocabularyId: 'v1' }, { vocabularyId: 'v2' },
      ] as any);

      const result = await service.assignVocabularies('t1', ['v1', 'v3'], 'admin-1', '127.0.0.1');

      // v1 already exists → skipped; only v3 added
      expect(result.addedCount).toBe(1);
      expect(topicVocabRepo.save).toHaveBeenCalledWith([
        expect.objectContaining({ vocabularyId: 'v3' }),
      ]);
    });

    it('increments displayOrder based on existing max', async () => {
      topicVocabRepo.find.mockResolvedValue([
        { vocabularyId: 'v1', displayOrder: 5 },
      ] as any);

      await service.assignVocabularies('t1', ['v2'], 'admin-1', '127.0.0.1');

      expect(topicVocabRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        displayOrder: 6,
      }));
    });

    it('does not write audit log when nothing added', async () => {
      topicVocabRepo.find.mockResolvedValue([
        { vocabularyId: 'v1' } as any,
      ]);

      const result = await service.assignVocabularies('t1', ['v1'], 'admin-1', '127.0.0.1');

      expect(result.addedCount).toBe(0);
      expect(auditLog.logAction).not.toHaveBeenCalled();
    });
  });

  describe('removeVocabulary', () => {
    it('deletes the link and writes audit log', async () => {
      await service.removeVocabulary('t1', 'v1', 'admin-1', '127.0.0.1');

      expect(topicVocabRepo.delete).toHaveBeenCalledWith({ topicId: 't1', vocabularyId: 'v1' });
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'REMOVE_TOPIC_VOCABULARY', 'TOPIC', 't1', '127.0.0.1',
        expect.objectContaining({ oldValue: { vocabularyId: 'v1' } }),
      );
    });
  });
});