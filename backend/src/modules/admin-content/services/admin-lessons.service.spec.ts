import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminLessonsService } from './admin-lessons.service';
import { Lesson } from '../../curriculum/entities/lesson.entity';
import { LessonContent } from '../../curriculum/entities/lesson-content.entity';
import { AuditLogService } from '../../admin/audit-log.service';
import { ContentStatus } from '../../../common/enums/curriculum.enums';

describe('AdminLessonsService', () => {
  let service: AdminLessonsService;
  let lessonRepo: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
  };
  let auditLog: { logAction: jest.Mock };

  beforeEach(async () => {
    lessonRepo = {
      createQueryBuilder: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn().mockImplementation((x: any) => {
        x.id = x.id ?? 'l-new';
        return Promise.resolve(x);
      }),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };
    auditLog = { logAction: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminLessonsService,
        { provide: getRepositoryToken(Lesson), useValue: lessonRepo },
        { provide: getRepositoryToken(LessonContent), useValue: {} },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get<AdminLessonsService>(AdminLessonsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAllByCourse', () => {
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

    it('returns lessons for a specific course (levelId)', async () => {
      lessonRepo.createQueryBuilder.mockReturnValue(buildQb([{ id: 'l1' }], 1));

      const result = await service.findAllByCourse('course-1', {});

      expect(result.items).toHaveLength(1);
    });

    it('filters by status and search term', async () => {
      const qb = buildQb();
      lessonRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAllByCourse('c1', { status: 'PUBLISHED', search: '你好' });

      expect(qb.andWhere).toHaveBeenCalledWith('lesson.status = :status', { status: 'PUBLISHED' });
      expect(qb.andWhere).toHaveBeenCalledWith('lesson.title ILIKE :search', { search: '%你好%' });
    });
  });

  describe('findAll', () => {
    function buildQb(data: any[] = [], total = 0) {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([data, total]),
      };
      return qb;
    }

    it('returns all lessons with course data joined', async () => {
      lessonRepo.createQueryBuilder.mockReturnValue(buildQb([{ id: 'l1' }], 1));

      const result = await service.findAll({});

      expect(result.items).toHaveLength(1);
      expect(lessonRepo.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('creates a lesson with courseId and audit log', async () => {
      await service.create(
        'course-1',
        { title: 'Bài 1', displayOrder: 1 },
        'admin-1', '127.0.0.1',
      );

      expect(lessonRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Bài 1',
        levelId: 'course-1',
        status: ContentStatus.DRAFT,
      }));
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'CREATE_LESSON', 'LESSON', expect.anything(), '127.0.0.1',
        expect.any(Object),
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException when not found', async () => {
      lessonRepo.findOne.mockResolvedValue(null);

      await expect(service.update('l-x', {}, 'admin-1', '127.0.0.1'))
        .rejects.toThrow(NotFoundException);
    });

    it('updates and writes audit log', async () => {
      const existing = { id: 'l1', title: 'Old' } as Lesson;
      lessonRepo.findOne.mockResolvedValue(existing);

      await service.update('l1', { title: 'New' }, 'admin-1', '127.0.0.1');

      expect(existing.title).toBe('New');
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'UPDATE_LESSON', 'LESSON', 'l1', '127.0.0.1',
        expect.any(Object),
      );
    });
  });

  describe('reorder', () => {
    it('updates displayOrder for each item', async () => {
      const items = [
        { id: 'l1', order: 1 },
        { id: 'l2', order: 2 },
      ];

      await service.reorder(items, 'admin-1', '127.0.0.1');

      expect(lessonRepo.update).toHaveBeenCalledTimes(2);
      expect(lessonRepo.update).toHaveBeenCalledWith({ id: 'l1' }, { displayOrder: 1 });
      expect(lessonRepo.update).toHaveBeenCalledWith({ id: 'l2' }, { displayOrder: 2 });
      expect(auditLog.logAction).toHaveBeenCalled();
    });
  });

  describe('changeStatus', () => {
    it('sets status and publishedAt on first publish', async () => {
      const lesson = { id: 'l1', status: 'DRAFT', publishedAt: null } as any;
      lessonRepo.findOne.mockResolvedValue(lesson);

      await service.changeStatus('l1', ContentStatus.PUBLISHED, 'admin-1', '127.0.0.1');

      expect(lesson.status).toBe(ContentStatus.PUBLISHED);
      expect(lesson.publishedAt).toBeDefined();
      expect(auditLog.logAction).toHaveBeenCalled();
    });

    it('does not overwrite existing publishedAt on re-publish', async () => {
      const originalDate = new Date('2025-01-01');
      const lesson = { id: 'l1', status: 'DRAFT', publishedAt: originalDate } as any;
      lessonRepo.findOne.mockResolvedValue(lesson);

      await service.changeStatus('l1', ContentStatus.PUBLISHED, 'admin-1', '127.0.0.1');

      expect(lesson.publishedAt).toEqual(originalDate);
    });

    it('throws when lesson not found', async () => {
      lessonRepo.findOne.mockResolvedValue(null);

      await expect(service.changeStatus('l-x', ContentStatus.PUBLISHED, 'admin-1', '127.0.0.1'))
        .rejects.toThrow(NotFoundException);
    });
  });
});