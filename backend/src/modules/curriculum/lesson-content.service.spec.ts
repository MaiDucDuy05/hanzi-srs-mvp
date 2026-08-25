import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessonContentService } from './lesson-content.service';
import { LessonContent } from './entities/lesson-content.entity';

describe('LessonContentService', () => {
  let service: LessonContentService;
  let repo: {
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    manager: { query: jest.Mock };
  };

  const mockItem: LessonContent = {
    id: 'lc-1',
    lessonId: 'lesson-1',
    contentType: 'VOCABULARY',
    contentId: 'v1',
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      manager: { query: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonContentService,
        { provide: getRepositoryToken(LessonContent), useValue: repo },
      ],
    }).compile();

    service = module.get<LessonContentService>(LessonContentService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated lesson contents', async () => {
      repo.findAndCount.mockResolvedValue([[mockItem], 1]);
      repo.manager.query.mockResolvedValue([
        { id: 'v1', hanzi: '好', pinyin: 'hǎo', meaning_vi: 'tốt' },
      ]);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(1);
      expect((result.data[0] as any).vocabulary).toEqual({
        id: 'v1',
        hanzi: '好',
        pinyin: 'hǎo',
        meaning_vi: 'tốt',
      });
    });

    it('filters by lessonId', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ lessonId: 'lesson-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ lessonId: 'lesson-1' }) }),
      );
    });

    it('joins grammar content when contentType is GRAMMAR', async () => {
      const grammarItem = { ...mockItem, contentType: 'GRAMMAR', contentId: 'g1' };
      repo.findAndCount.mockResolvedValue([[grammarItem], 1]);
      repo.manager.query.mockResolvedValue([{ id: 'g1', title: '了', structure: 'V+了' }]);

      const result = await service.findAll({});

      expect((result.data[0] as any).grammar).toEqual({
        id: 'g1',
        title: '了',
        structure: 'V+了',
      });
    });

    it('does not join when content type is unknown', async () => {
      const otherItem: any = {
        id: 'lc-x',
        lessonId: 'lesson-1',
        contentType: 'UNKNOWN',
        contentId: 'x',
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repo.findAndCount.mockResolvedValue([[otherItem], 1]);

      const result = await service.findAll({});

      expect(result.data[0].vocabulary).toBeUndefined();
      expect(result.data[0].grammar).toBeUndefined();
      expect(repo.manager.query).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('returns lesson content when found', async () => {
      repo.findOne.mockResolvedValue(mockItem);

      const result = await service.findById('lc-1');
      expect(result).toEqual(mockItem);
    });

    it('throws when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow();
    });
  });
});