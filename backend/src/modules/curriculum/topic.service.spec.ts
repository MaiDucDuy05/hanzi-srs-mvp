import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TopicService } from './topic.service';
import { Topic } from './entities/topic.entity';
import { TopicVocabulary } from './entities/topic-vocabulary.entity';

describe('TopicService', () => {
  let service: TopicService;
  let repo: { findAndCount: jest.Mock; findOne: jest.Mock };
  let tvRepo: { count: jest.Mock; createQueryBuilder: jest.Mock };

  const mockTopic: Topic = {
    id: 'topic-1',
    levelId: 'level-1',
    code: 'TOPIC_GREETING',
    name: 'Chào hỏi',
    displayOrder: 1,
    isActive: true,
    status: 'PUBLISHED' as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repo = { findAndCount: jest.fn(), findOne: jest.fn() };
    tvRepo = { count: jest.fn(), createQueryBuilder: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicService,
        { provide: getRepositoryToken(Topic), useValue: repo },
        { provide: getRepositoryToken(TopicVocabulary), useValue: tvRepo },
      ],
    }).compile();

    service = module.get<TopicService>(TopicService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns empty paginated result when no topics found', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({});

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('returns topics with vocabulary count joined', async () => {
      repo.findAndCount.mockResolvedValue([[mockTopic], 1]);

      const mockQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ topicId: 'topic-1', count: '5' }]),
      };
      tvRepo.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.findAll({});

      expect((result.data[0] as any).vocabularyCount).toBe(5);
    });

    it('defaults vocabularyCount to 0 when topic has none', async () => {
      repo.findAndCount.mockResolvedValue([[mockTopic], 1]);
      const mockQb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      tvRepo.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.findAll({});
      expect((result.data[0] as any).vocabularyCount).toBe(0);
    });

    it('filters by status when provided', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ status: 'DRAFT' as any });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'DRAFT' }) }),
      );
    });

    it('applies pagination and sort options', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 2, limit: 5, sortBy: 'name', sortOrder: 'DESC' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          order: { name: 'DESC' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('throws when topic not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('t-x')).rejects.toThrow();
    });

    it('returns topic with vocabulary count', async () => {
      repo.findOne.mockResolvedValue(mockTopic);
      tvRepo.count.mockResolvedValue(7);

      const result = await service.findById('topic-1');
      expect((result as any).vocabularyCount).toBe(7);
    });
  });
});