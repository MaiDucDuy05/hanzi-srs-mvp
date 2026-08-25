import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminCoursesService } from './admin-courses.service';
import { HskLevel } from '../../curriculum/entities/hsk-level.entity';
import { AuditLogService } from '../../admin/audit-log.service';

describe('AdminCoursesService', () => {
  let service: AdminCoursesService;
  let courseRepo: { createQueryBuilder: jest.Mock; create: jest.Mock; save: jest.Mock; findOne: jest.Mock };
  let auditLog: { logAction: jest.Mock };

  beforeEach(async () => {
    courseRepo = {
      createQueryBuilder: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn().mockImplementation((x: any) => {
        x.id = x.id ?? 'c-new';
        return Promise.resolve(x);
      }),
      findOne: jest.fn(),
    };
    auditLog = { logAction: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminCoursesService,
        { provide: getRepositoryToken(HskLevel), useValue: courseRepo },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get<AdminCoursesService>(AdminCoursesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    function buildQb(data: any[] = [], total = 0) {
      const qb: any = {
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([data, total]),
      };
      return qb;
    }

    it('returns paginated courses', async () => {
      courseRepo.createQueryBuilder.mockReturnValue(buildQb([{ id: 'c1' }], 1));

      const result = await service.findAll({});

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filters by status and search', async () => {
      const qb = buildQb();
      courseRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ status: 'PUBLISHED', search: 'hsk' });

      expect(qb.andWhere).toHaveBeenCalledWith('course.status = :status', { status: 'PUBLISHED' });
      expect(qb.andWhere).toHaveBeenCalledWith('course.name ILIKE :search', { search: '%hsk%' });
    });
  });

  describe('create', () => {
    it('creates course with default values and writes audit log', async () => {
      const result = await service.create(
        { code: 'HSK1', name: 'HSK 1', displayOrder: 1 },
        'admin-1', '127.0.0.1',
      );

      expect(courseRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        code: 'HSK1',
        name: 'HSK 1',
        displayOrder: 1,
        status: 'DRAFT',
      }));
      expect(courseRepo.save).toHaveBeenCalled();
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'CREATE_COURSE', 'COURSE', expect.anything(), '127.0.0.1',
        expect.objectContaining({ newValue: expect.any(Object) }),
      );
      expect(result.id).toBe('c-new');
    });
  });

  describe('update', () => {
    it('throws NotFoundException when course not found', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update('c-x', { name: 'New' }, 'admin-1', '127.0.0.1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates and writes audit log with old/new value', async () => {
      const existing = { id: 'c1', name: 'Old', displayOrder: 1 } as HskLevel;
      courseRepo.findOne.mockResolvedValue(existing);

      await service.update('c1', { name: 'New' }, 'admin-1', '127.0.0.1');

      expect(existing.name).toBe('New');
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'UPDATE_COURSE', 'COURSE', 'c1', '127.0.0.1',
        expect.objectContaining({ oldValue: expect.any(Object), newValue: expect.any(Object) }),
      );
    });
  });

  describe('changeStatus', () => {
    it('throws when course not found', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(
        service.changeStatus('c-x', 'PUBLISHED', 'admin-1', '127.0.0.1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('changes status and writes audit log', async () => {
      const course = { id: 'c1', status: 'DRAFT' } as HskLevel;
      courseRepo.findOne.mockResolvedValue(course);

      await service.changeStatus('c1', 'PUBLISHED', 'admin-1', '127.0.0.1');

      expect(course.status).toBe('PUBLISHED');
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'CHANGE_COURSE_STATUS', 'COURSE', 'c1', '127.0.0.1',
        expect.objectContaining({ oldValue: { status: 'DRAFT' }, newValue: { status: 'PUBLISHED' } }),
      );
    });
  });
});