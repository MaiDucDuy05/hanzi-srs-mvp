import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VocabularyService } from './vocabulary.service';
import { Vocabulary } from './entities/vocabulary.entity';

describe('VocabularyService', () => {
  let service: VocabularyService;
  const repo = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        VocabularyService,
        { provide: getRepositoryToken(Vocabulary), useValue: repo },
      ],
    }).compile();
    service = mod.get(VocabularyService);
    jest.resetAllMocks();
  });

  describe('findAll', () => {
    it('applies levelId and status filters via where()', async () => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'v1' }], 1]),
      };
      repo.createQueryBuilder.mockReturnValueOnce(qb);
      const out = await service.findAll({ levelId: 'l1', status: 'PUBLISHED' } as any);
      expect(qb.where).toHaveBeenCalledWith({ levelId: 'l1', status: 'PUBLISHED' });
      expect(out.data).toHaveLength(1);
    });

    it('joins topicVocabularies when topicId is provided', async () => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      repo.createQueryBuilder.mockReturnValueOnce(qb);
      await service.findAll({ topicId: 't1' } as any);
      expect(qb.innerJoin).toHaveBeenCalledWith(
        'v.topicVocabularies',
        'tv',
        'tv.topicId = :topicId',
        { topicId: 't1' },
      );
      expect(qb.addSelect).toHaveBeenCalledWith('tv.displayOrder');
    });

    it('uses ILIKE search across hanzi, pinyin, meaningVi when search is set', async () => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      repo.createQueryBuilder.mockReturnValueOnce(qb);
      await service.findAll({ search: '你好' } as any);
      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(v.hanzi) LIKE LOWER(:search)'),
        { search: '%你好%' },
      );
    });

    it('falls back to default sort when neither topicId nor search provided', async () => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      repo.createQueryBuilder.mockReturnValueOnce(qb);
      await service.findAll({ sortBy: 'hanzi', sortOrder: 'ASC' } as any);
      expect(qb.orderBy).toHaveBeenCalledWith('v.hanzi', 'ASC');
    });
  });

  describe('findById', () => {
    it('returns vocabulary when found', async () => {
      repo.findOne.mockResolvedValueOnce({ id: 'v1' });
      const out = await service.findById('v1');
      expect(out.id).toBe('v1');
    });

    it('throws NotFoundException when missing', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      await expect(service.findById('missing')).rejects.toThrow();
    });
  });
});
