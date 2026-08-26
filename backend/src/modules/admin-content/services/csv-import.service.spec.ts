import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { CsvImportService } from './csv-import.service';
import { Vocabulary } from '../../curriculum/entities/vocabulary.entity';

describe('CsvImportService', () => {
  let service: CsvImportService;
  let vocabRepo: { create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    vocabRepo = {
      create: jest.fn((x) => x),
      save: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvImportService,
        { provide: getRepositoryToken(Vocabulary), useValue: vocabRepo },
      ],
    }).compile();

    service = module.get<CsvImportService>(CsvImportService);
  });

  afterEach(() => jest.clearAllMocks());

  it('throws BadRequestException when file is missing', async () => {
    await expect(service.importVocabularies(null as any, 'admin-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('parses CSV with Hanzi/Pinyin/Meaning and persists rows', async () => {
    const csv = 'Hanzi,Pinyin,Meaning\n你好,nǐ hǎo,xin chào\n好,hǎo,tốt\n';
    const file = {
      buffer: Buffer.from(csv),
      mimetype: 'text/csv',
      originalname: 'vocab.csv',
    } as any;

    const result = await service.importVocabularies(file, 'admin-1');

    expect(result.count).toBe(2);
    expect(vocabRepo.save).toHaveBeenCalled();
  });

  it('rejects CSV with no valid data rows', async () => {
    // Empty CSV (only header)
    const csv = 'Hanzi,Pinyin,Meaning\n';
    const file = { buffer: Buffer.from(csv) } as any;

    await expect(service.importVocabularies(file, 'admin-1'))
      .rejects.toThrow(/Không tìm thấy dữ liệu hợp lệ/);
  });

  it('skips rows missing required fields (hanzi/pinyin/meaning)', async () => {
    const csv = 'Hanzi,Pinyin,Meaning\n你好,nǐ hǎo,xin chào\n,nǐ hǎo,xin chào\n';
    const file = { buffer: Buffer.from(csv) } as any;

    const result = await service.importVocabularies(file, 'admin-1');
    expect(result.count).toBe(1);
  });
});