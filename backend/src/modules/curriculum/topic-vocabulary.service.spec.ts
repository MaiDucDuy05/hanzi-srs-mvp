import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TopicVocabularyService } from './topic-vocabulary.service';
import { TopicVocabulary } from './entities/topic-vocabulary.entity';

describe('TopicVocabularyService', () => {
  let service: TopicVocabularyService;
  let repo: { findAndCount: jest.Mock; findOne: jest.Mock };

  beforeEach(async () => {
    repo = { findAndCount: jest.fn(), findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicVocabularyService,
        { provide: getRepositoryToken(TopicVocabulary), useValue: repo },
      ],
    }).compile();

    service = module.get<TopicVocabularyService>(TopicVocabularyService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated topic-vocabulary links', async () => {
      repo.findAndCount.mockResolvedValue([[{ id: 'tv-1' }], 1]);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filters by topicId', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ topicId: 'topic-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ topicId: 'topic-1' }) }),
      );
    });
  });

  describe('findById', () => {
    it('returns link when found', async () => {
      repo.findOne.mockResolvedValue({ id: 'tv-1' });

      const result = await service.findById('tv-1');
      expect(result).toEqual({ id: 'tv-1' });
    });

    it('throws when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toThrow();
    });
  });
});