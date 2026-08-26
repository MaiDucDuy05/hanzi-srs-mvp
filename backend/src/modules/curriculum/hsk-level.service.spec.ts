import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HskLevelService } from './hsk-level.service';
import { HskLevel } from './entities/hsk-level.entity';
import { Vocabulary } from './entities/vocabulary.entity';

describe('HskLevelService', () => {
  let service: HskLevelService;
  const repo = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
  };
  const vocabRepo = {
    createQueryBuilder: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        HskLevelService,
        { provide: getRepositoryToken(HskLevel), useValue: repo },
        { provide: getRepositoryToken(Vocabulary), useValue: vocabRepo },
      ],
    }).compile();
    service = mod.get(HskLevelService);
    jest.clearAllMocks();
  });

  it('findAll returns levels with vocabularyCount', async () => {
    repo.findAndCount.mockResolvedValueOnce([
      [
        { id: 'L1', code: 'HSK1', displayOrder: 1 },
        { id: 'L2', code: 'HSK2', displayOrder: 2 },
      ],
      2,
    ]);
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { levelId: 'L1', count: '150' },
        { levelId: 'L2', count: '300' },
      ]),
    };
    vocabRepo.createQueryBuilder.mockReturnValueOnce(qb);

    const res = await service.findAll({ page: 1, limit: 20 } as any);
    expect(res.data).toHaveLength(2);
    expect((res.data[0] as any).vocabularyCount).toBe(150);
    expect((res.data[1] as any).vocabularyCount).toBe(300);
  });

  it('findAll short-circuits the count query when no data', async () => {
    repo.findAndCount.mockResolvedValueOnce([[], 0]);
    const res = await service.findAll({ page: 1, limit: 20 } as any);
    expect(res.data).toHaveLength(0);
    expect(vocabRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('findAll defaults vocabularyCount to 0 when level id is absent from batched counts', async () => {
    repo.findAndCount.mockResolvedValueOnce([
      [{ id: 'L1', code: 'HSK1' }],
      1,
    ]);
    const qb: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    vocabRepo.createQueryBuilder.mockReturnValueOnce(qb);
    const res = await service.findAll({ page: 1, limit: 20 } as any);
    expect((res.data[0] as any).vocabularyCount).toBe(0);
  });

  it('findById returns level with vocabularyCount', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'L1', code: 'HSK1' });
    vocabRepo.count.mockResolvedValueOnce(120);
    const out = await service.findById('L1');
    expect(out.id).toBe('L1');
    expect(out.vocabularyCount).toBe(120);
  });

  it('findById throws when level not found', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.findById('missing')).rejects.toThrow(/HSK level not found/);
  });
});
