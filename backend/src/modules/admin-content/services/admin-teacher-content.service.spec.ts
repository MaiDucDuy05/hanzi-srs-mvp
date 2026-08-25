import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminTeacherContentService } from './admin-teacher-content.service';
import { AuditLogService } from '../../admin/audit-log.service';

describe('AdminTeacherContentService', () => {
  let service: AdminTeacherContentService;
  let dataSource: { query: jest.Mock };
  let auditLog: { logAction: jest.Mock };

  beforeEach(async () => {
    dataSource = { query: jest.fn() };
    auditLog = { logAction: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminTeacherContentService,
        { provide: getDataSourceToken(), useValue: dataSource },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get<AdminTeacherContentService>(AdminTeacherContentService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('queries combined test/resource/question items with filters', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ total: '2' }])
        .mockResolvedValueOnce([{ id: '1' }, { id: '2' }]);

      const result = await service.findAll({
        type: 'test', authorId: 'u1', status: 'ACTIVE',
        search: 'foo', limit: 10, offset: 0,
      });

      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('filters status HIDDEN → hiddenByAdmin = true', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ total: '0' }])
        .mockResolvedValueOnce([]);

      await service.findAll({ status: 'HIDDEN' });

      const wrapperQ = dataSource.query.mock.calls[0][0];
      expect(wrapperQ).toContain('"hiddenByAdmin" = true');
    });
  });

  describe('getTableName (via invalid type)', () => {
    it('throws NotFoundException for invalid type in hide', async () => {
      await expect(service.hideContent('invalid', 'id-1', 'reason', 'admin-1', '127.0.0.1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('hideContent', () => {
    it('throws when content not found', async () => {
      dataSource.query.mockResolvedValueOnce([]);

      await expect(service.hideContent('test', 'x', 'reason', 'admin-1', '127.0.0.1'))
        .rejects.toThrow(NotFoundException);
    });

    it('marks hidden=true, records reason, writes audit log', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ id: 't-1' }])  // exists check
        .mockResolvedValueOnce(undefined);         // UPDATE

      await service.hideContent('test', 't-1', 'spam', 'admin-1', '127.0.0.1');

      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'HIDE_TEACHER_CONTENT', 'TEST', 't-1', '127.0.0.1',
        { reason: 'spam' },
      );
    });
  });

  describe('unhideContent', () => {
    it('marks hidden=false and clears reason/at', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ id: 't-1' }])
        .mockResolvedValueOnce(undefined);

      await service.unhideContent('test', 't-1', 'admin-1', '127.0.0.1');

      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'UNHIDE_TEACHER_CONTENT', 'TEST', 't-1', '127.0.0.1',
      );
    });

    it('throws when not found', async () => {
      dataSource.query.mockResolvedValueOnce([]);

      await expect(service.unhideContent('test', 'x', 'admin-1', '127.0.0.1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('returns content with type field added', async () => {
      dataSource.query.mockResolvedValueOnce([{ id: 't-1', name: 'Test' }]);

      const result = await service.findOne('test', 't-1');
      expect(result).toEqual({ id: 't-1', name: 'Test', type: 'test' });
    });

    it('throws when not found', async () => {
      dataSource.query.mockResolvedValueOnce([]);

      await expect(service.findOne('test', 'x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('sets is_active=false for question type', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ id: 'q-1' }])   // exists
        .mockResolvedValueOnce(undefined);          // UPDATE

      await service.softDelete('question', 'q-1', 'admin-1', '127.0.0.1');

      const updateSql = dataSource.query.mock.calls[1][0];
      expect(updateSql).toContain('is_active = false');
    });

    it('sets deleted_at for non-question types', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ id: 't-1' }])
        .mockResolvedValueOnce(undefined);

      await service.softDelete('test', 't-1', 'admin-1', '127.0.0.1');

      const updateSql = dataSource.query.mock.calls[1][0];
      expect(updateSql).toContain('deleted_at =');
    });
  });
});