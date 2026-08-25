import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GrammarPointService } from './grammar-point.service';
import { GrammarPoint } from './entities/grammar-point.entity';

describe('GrammarPointService', () => {
  let service: GrammarPointService;
  let repo: { findAndCount: jest.Mock; findOne: jest.Mock };

  const mockGrammar: GrammarPoint = {
    id: 'gp-1',
    levelId: 'level-1',
    title: '了',
    structure: 'Subject + Verb + 了',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repo = { findAndCount: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrammarPointService,
        { provide: getRepositoryToken(GrammarPoint), useValue: repo },
      ],
    }).compile();

    service = module.get<GrammarPointService>(GrammarPointService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated grammar points', async () => {
      repo.findAndCount.mockResolvedValue([[mockGrammar], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockGrammar]);
      expect(result.meta.total).toBe(1);
    });

    it('filters by levelId', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ levelId: 'level-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ levelId: 'level-1' }) }),
      );
    });

    it('filters by status', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ status: 'PUBLISHED' as any });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'PUBLISHED' }) }),
      );
    });

    it('applies pagination', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 3, limit: 10 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  describe('findById', () => {
    it('returns grammar point when found', async () => {
      repo.findOne.mockResolvedValue(mockGrammar);

      const result = await service.findById('gp-1');
      expect(result).toEqual(mockGrammar);
    });

    it('throws when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow();
    });
  });
});