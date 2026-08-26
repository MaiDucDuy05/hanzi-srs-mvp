import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminVocabulariesService } from './admin-vocabularies.service';
import { Vocabulary } from '../../curriculum/entities/vocabulary.entity';
import { AuditLogService } from '../../admin/audit-log.service';
import { S3UploadService } from './s3-upload.service';

describe('AdminVocabulariesService', () => {
  let service: AdminVocabulariesService;
  let vocabRepo: { createQueryBuilder: jest.Mock; create: jest.Mock; save: jest.Mock; findOne: jest.Mock; find: jest.Mock };
  let auditLog: { logAction: jest.Mock };
  let s3: { uploadFile: jest.Mock };

  beforeEach(async () => {
    vocabRepo = {
      createQueryBuilder: jest.fn(),
      create: jest.fn((x) => x),
      save: jest.fn().mockImplementation((x: any) => {
        x.id = x.id ?? 'v-new';
        return Promise.resolve(x);
      }),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    auditLog = { logAction: jest.fn().mockResolvedValue(undefined) };
    s3 = { uploadFile: jest.fn().mockResolvedValue('https://s3/audio.mp3') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminVocabulariesService,
        { provide: getRepositoryToken(Vocabulary), useValue: vocabRepo },
        { provide: AuditLogService, useValue: auditLog },
        { provide: S3UploadService, useValue: s3 },
      ],
    }).compile();

    service = module.get<AdminVocabulariesService>(AdminVocabulariesService);
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

    it('returns paginated vocabularies', async () => {
      vocabRepo.createQueryBuilder.mockReturnValue(buildQb([{ id: 'v1' }], 1));

      const result = await service.findAll({});

      expect(result.items).toHaveLength(1);
    });

    it('search across hanzi/pinyin/meaningVi', async () => {
      const qb = buildQb();
      vocabRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll({ search: '你好' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(vocab.hanzi ILIKE :search OR vocab.pinyin ILIKE :search OR vocab.meaningVi ILIKE :search)',
        { search: '%你好%' },
      );
    });
  });

  describe('create', () => {
    it('creates vocab with DRAFT default status', async () => {
      await service.create({ hanzi: '好', pinyin: 'hǎo', meaningVi: 'tốt' }, 'admin-1', '127.0.0.1');

      expect(vocabRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        status: 'DRAFT',
      }));
      expect(auditLog.logAction).toHaveBeenCalledWith(
        'admin-1', 'CREATE_VOCAB', 'VOCABULARY', expect.anything(), '127.0.0.1',
        expect.objectContaining({ newValue: expect.any(Object) }),
      );
    });
  });

  describe('update', () => {
    it('updates and logs old/new values', async () => {
      const existing = { id: 'v1', hanzi: 'Old' } as Vocabulary;
      vocabRepo.findOne.mockResolvedValue(existing);

      await service.update('v1', { hanzi: 'New' }, 'admin-1', '127.0.0.1');

      expect(existing.hanzi).toBe('New');
      expect(auditLog.logAction).toHaveBeenCalled();
    });

    it('throws NotFoundException when not found', async () => {
      vocabRepo.findOne.mockResolvedValue(null);
      await expect(service.update('v-x', {}, 'admin-1', '127.0.0.1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('marks isActive=false', async () => {
      const vocab = { id: 'v1', isActive: true } as Vocabulary;
      vocabRepo.findOne.mockResolvedValue(vocab);

      const result = await service.softDelete('v1', 'admin-1', '127.0.0.1');

      expect(vocab.isActive).toBe(false);
      expect(result).toEqual({ success: true });
    });

    it('throws when not found', async () => {
      vocabRepo.findOne.mockResolvedValue(null);
      await expect(service.softDelete('v-x', 'admin-1', '127.0.0.1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('exportCsv', () => {
    it('returns CSV header + rows', async () => {
      vocabRepo.find.mockResolvedValue([
        {
          hanzi: '好', pinyin: 'hǎo',
          meaningVi: 'tốt', partOfSpeech: 'adj',
          example: '他好学生',
          level: { name: 'HSK 1' },
        },
      ]);

      const csv = await service.exportCsv();
      expect(csv).toContain('hanzi,pinyin,meaning_vi');
      expect(csv).toContain('"好","hǎo"');
    });
  });

  describe('uploadAudio', () => {
    it('uploads file to S3, updates audioKey, logs audit', async () => {
      const vocab = { id: 'v1', audioKey: null } as Vocabulary;
      vocabRepo.findOne.mockResolvedValue(vocab);

      const file = { buffer: Buffer.from('audio') } as any;
      await service.uploadAudio('v1', file, 'admin-1', '127.0.0.1');

      expect(s3.uploadFile).toHaveBeenCalledWith(file, 'audio');
      expect(vocab.audioKey).toBe('https://s3/audio.mp3');
      expect(auditLog.logAction).toHaveBeenCalled();
    });

    it('throws NotFoundException when vocab not found', async () => {
      vocabRepo.findOne.mockResolvedValue(null);
      const file = { buffer: Buffer.from('') } as any;
      await expect(service.uploadAudio('v-x', file, 'admin-1', '127.0.0.1'))
        .rejects.toThrow(NotFoundException);
    });
  });
});