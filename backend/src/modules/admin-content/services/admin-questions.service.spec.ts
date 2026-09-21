import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminQuestionsService } from './admin-questions.service';
import { PracticeQuestion } from '../../practice/entities/practice-question.entity';
import { AuditLogService } from '../../admin/audit-log.service';

describe('AdminQuestionsService', () => {
  let service: AdminQuestionsService;
  let questionRepo: { createQueryBuilder: jest.Mock; create: jest.Mock; save: jest.Mock; findOne: jest.Mock; find: jest.Mock };
  let auditLog: { logAction: jest.Mock };

  beforeEach(async () => {
    questionRepo = {
      createQueryBuilder: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn().mockImplementation((x: any) => {
        x.id = x.id ?? 'q-new';
        return Promise.resolve(x);
      }),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    auditLog = { logAction: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminQuestionsService,
        { provide: getRepositoryToken(PracticeQuestion), useValue: questionRepo },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get<AdminQuestionsService>(AdminQuestionsService);
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

    it('returns paginated questions with isActive filter', async () => {
      questionRepo.createQueryBuilder.mockReturnValue(buildQb([{ id: 'q1' }], 1));

      const result = await service.findAll({});

      expect(result.items).toHaveLength(1);
    });

    it('filters by status, search, and levelId', async () => {
      const qb = buildQb();
      questionRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ status: 'PUBLISHED', search: '你好', levelId: 'l1' });

      expect(qb.andWhere).toHaveBeenCalledWith('question.status = :status', { status: 'PUBLISHED' });
      expect(qb.andWhere).toHaveBeenCalledWith('question.prompt ILIKE :search', { search: '%你好%' });
      expect(qb.andWhere).toHaveBeenCalledWith('question.levelId = :levelId', { levelId: 'l1' });
    });
  });

  describe('create', () => {
    it('creates question with default DRAFT status', async () => {
      await service.create({ prompt: 'Q1', levelId: 'l1' }, 'admin-1', '127.0.0.1');

      expect(questionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        status: 'DRAFT',
      }));
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'CREATE_QUESTION', 'QUESTION', expect.anything(), '127.0.0.1',
        expect.objectContaining({ newValue: expect.any(Object) }),
      );
    });
  });

  describe('bulkCreate', () => {
    it('returns empty array when dtos is empty', async () => {
      const res = await service.bulkCreate([], 'admin-1', '127.0.0.1');
      expect(res).toEqual([]);
      expect(questionRepo.save).not.toHaveBeenCalled();
    });

    it('creates multiple questions in batch and logs audit action', async () => {
      questionRepo.save.mockResolvedValue([
        { id: 'q-1', prompt: 'Q1' },
        { id: 'q-2', prompt: 'Q2' },
      ]);

      const res = await service.bulkCreate(
        [
          { prompt: 'Q1', levelId: 'l1' },
          { prompt: 'Q2', levelId: 'l2' },
        ],
        'admin-1',
        '127.0.0.1',
      );

      expect(res).toHaveLength(2);
      expect(questionRepo.create).toHaveBeenCalledTimes(2);
      expect(questionRepo.save).toHaveBeenCalled();
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1',
        'BULK_CREATE_QUESTION',
        'QUESTION',
        'q-1',
        '127.0.0.1',
        expect.objectContaining({ newValue: { count: 2 } }),
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException when not found', async () => {
      questionRepo.findOne.mockResolvedValue(null);

      await expect(service.update('q-x', {}, 'admin-1', '127.0.0.1')).rejects.toThrow(NotFoundException);
    });

    it('updates and writes audit log', async () => {
      const existing = { id: 'q1', prompt: 'old' } as PracticeQuestion;
      questionRepo.findOne.mockResolvedValue(existing);

      await service.update('q1', { prompt: 'new' }, 'admin-1', '127.0.0.1');

      expect(existing.prompt).toBe('new');
      expect(auditLog.logAction).toHaveBeenCalled();
    });
  });

  describe('softDelete', () => {
    it('marks isActive=false and writes audit log', async () => {
      const question = { id: 'q1', isActive: true } as PracticeQuestion;
      questionRepo.findOne.mockResolvedValue(question);

      const result = await service.softDelete('q1', 'admin-1', '127.0.0.1');

      expect(question.isActive).toBe(false);
      expect(question.deletedAt).toBeDefined();
      expect(result).toEqual({ success: true });
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'DELETE_QUESTION', 'QUESTION', 'q1', '127.0.0.1', {},
      );
    });

    it('throws when not found', async () => {
      questionRepo.findOne.mockResolvedValue(null);

      await expect(service.softDelete('q-x', 'admin-1', '127.0.0.1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportCsv', () => {
    it('generates valid CSV string for practice questions', async () => {
      questionRepo.find.mockResolvedValue([
        {
          id: 'q1',
          prompt: 'Ta là ai?',
          questionType: 'FILL_BLANK',
          answerType: 'TEXT',
          questionData: { choices: ['A', 'B'] },
          answerData: { answer: 'A' },
          level: { name: 'HSK 1' },
          translation: 'Who am I?',
          explanation: 'Sample',
        },
        {
          id: 'q2',
          prompt: 'Sắp xếp câu',
          questionType: 'SENTENCE_ORDERING',
          answerType: 'TEXT',
          questionData: { tokens: [{ id: 't1', text: 'Tôi' }, { id: 't2', text: 'học' }] },
          answerData: { orderedTokenIds: ['t1', 't2'] },
          level: { name: 'HSK 2' },
          translation: 'I study',
          explanation: '',
        },
      ]);

      const csv = await service.exportCsv();
      expect(csv).toContain('prompt,question_type,answer_type,choices,answer,hsk_level,translation,explanation');
      expect(csv).toContain('"Ta là ai?","FILL_BLANK","TEXT","A;B","A","HSK 1","Who am I?","Sample"');
      expect(csv).toContain('"Sắp xếp câu","SENTENCE_ORDERING","TEXT","","Tôi,học","HSK 2","I study",""');
    });
  });
});