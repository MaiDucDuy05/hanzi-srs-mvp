import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessonService } from './lesson.service';
import { Lesson } from './entities/lesson.entity';
import { LessonContent } from './entities/lesson-content.entity';
import { Vocabulary } from './entities/vocabulary.entity';
import { GrammarPoint } from './entities/grammar-point.entity';
import { ContentType } from '../../common/enums/curriculum.enums';

describe('LessonService', () => {
  let service: LessonService;
  let repo: { findAndCount: jest.Mock; findOne: jest.Mock };
  let contentRepo: { find: jest.Mock };
  let vocabRepo: { find: jest.Mock };
  let grammarRepo: { find: jest.Mock };

  const mockLesson: Lesson = {
    id: 'lesson-1',
    levelId: 'level-1',
    title: 'Bài 1',
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repo = { findAndCount: jest.fn(), findOne: jest.fn() };
    contentRepo = { find: jest.fn() };
    vocabRepo = { find: jest.fn() };
    grammarRepo = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        { provide: getRepositoryToken(Lesson), useValue: repo },
        { provide: getRepositoryToken(LessonContent), useValue: contentRepo },
        { provide: getRepositoryToken(Vocabulary), useValue: vocabRepo },
        { provide: getRepositoryToken(GrammarPoint), useValue: grammarRepo },
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('returns paginated lessons', async () => {
      repo.findAndCount.mockResolvedValue([[mockLesson], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockLesson]);
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
  });

  describe('findById', () => {
    it('returns lesson when found', async () => {
      repo.findOne.mockResolvedValue(mockLesson);

      const result = await service.findById('lesson-1');
      expect(result).toEqual(mockLesson);
    });

    it('throws when not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toThrow();
    });
  });

  describe('getContents', () => {
    it('returns aggregated vocabularies and grammar points', async () => {
      repo.findOne.mockResolvedValue(mockLesson);
      contentRepo.find.mockResolvedValue([
        { lessonId: 'lesson-1', contentType: ContentType.VOCABULARY, contentId: 'v1', displayOrder: 1 } as LessonContent,
        { lessonId: 'lesson-1', contentType: ContentType.VOCABULARY, contentId: 'v2', displayOrder: 2 } as LessonContent,
        { lessonId: 'lesson-1', contentType: ContentType.GRAMMAR, contentId: 'g1', displayOrder: 3 } as LessonContent,
      ]);
      vocabRepo.find.mockResolvedValue([{ id: 'v1' }, { id: 'v2' }] as Vocabulary[]);
      grammarRepo.find.mockResolvedValue([{ id: 'g1' }] as GrammarPoint[]);

      const result = await service.getContents('lesson-1');

      expect(result.vocabularies).toHaveLength(2);
      expect(result.grammarPoints).toHaveLength(1);
      expect(contentRepo.find).toHaveBeenCalledWith({
        where: { lessonId: 'lesson-1' },
        order: { displayOrder: 'ASC' },
      });
    });

    it('returns empty arrays when lesson has no content', async () => {
      repo.findOne.mockResolvedValue(mockLesson);
      contentRepo.find.mockResolvedValue([]);

      const result = await service.getContents('lesson-1');

      expect(result.vocabularies).toEqual([]);
      expect(result.grammarPoints).toEqual([]);
      expect(vocabRepo.find).not.toHaveBeenCalled();
      expect(grammarRepo.find).not.toHaveBeenCalled();
    });

    it('throws when lesson not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.getContents('missing')).rejects.toThrow();
    });
  });
});