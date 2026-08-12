import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { HskLevelService } from './hsk-level.service';
import { TopicService } from './topic.service';
import { GrammarPointService } from './grammar-point.service';
import { LessonService } from './lesson.service';
import { LessonContentService } from './lesson-content.service';
import { TopicVocabularyService } from './topic-vocabulary.service';
import { HskLevel } from './entities/hsk-level.entity';
import { Topic } from './entities/topic.entity';
import { GrammarPoint } from './entities/grammar-point.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonContent } from './entities/lesson-content.entity';
import { TopicVocabulary } from './entities/topic-vocabulary.entity';

describe('HskLevelService', () => {
  let service: HskLevelService;
  let repo: jest.Mocked<Repository<HskLevel>>;

  const mockLevel: HskLevel = {
    id: 'level-1',
    level: 1,
    name: 'HSK 1',
    description: 'Beginner Chinese',
    displayOrder: 1,
    vocabularyCount: 150,
    grammarCount: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HskLevelService,
        { provide: getRepositoryToken(HskLevel), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<HskLevelService>(HskLevelService);
    repo = module.get(getRepositoryToken(HskLevel));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated levels sorted by displayOrder ASC', async () => {
      repo.findAndCount.mockResolvedValue([[mockLevel], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockLevel]);
      expect(result.meta.total).toBe(1);
    });

    it('should handle custom pagination', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 2, limit: 5 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5, order: { displayOrder: 'ASC' } }),
      );
    });

    it('should handle custom sort', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ sortBy: 'level', sortOrder: 'DESC' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { level: 'DESC' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return level when found', async () => {
      repo.findOne.mockResolvedValue(mockLevel);

      const result = await service.findById('level-1');

      expect(result).toEqual(mockLevel);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('HSK level not found');
    });
  });

  describe('create', () => {
    it('should create new level', async () => {
      const createDto = { level: 2, name: 'HSK 2', displayOrder: 2 };
      repo.create.mockReturnValue({ ...mockLevel, ...createDto } as HskLevel);
      repo.save.mockResolvedValue({ ...mockLevel, ...createDto } as HskLevel);

      const result = await service.create(createDto);

      expect(result.level).toBe(2);
    });
  });

  describe('update', () => {
    it('should update level', async () => {
      const updateDto = { name: 'Updated HSK 1' };
      repo.findOne.mockResolvedValue(mockLevel);
      repo.save.mockImplementation((e) => Promise.resolve(e as HskLevel));

      const result = await service.update('level-1', updateDto);

      expect(result.name).toBe('Updated HSK 1');
    });
  });

  describe('delete', () => {
    it('should permanently delete level', async () => {
      repo.findOne.mockResolvedValue(mockLevel);
      repo.remove.mockResolvedValue(mockLevel);

      await service.delete('level-1');

      expect(repo.remove).toHaveBeenCalledWith(mockLevel);
    });

    it('should throw NotFoundException when deleting non-existent', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow('HSK level not found');
    });
  });
});

describe('TopicService', () => {
  let service: TopicService;
  let repo: jest.Mocked<Repository<Topic>>;

  const mockTopic: Topic = {
    id: 'topic-1',
    levelId: 'level-1',
    name: 'Greetings',
    description: 'Basic greetings',
    displayOrder: 1,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicService,
        { provide: getRepositoryToken(Topic), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<TopicService>(TopicService);
    repo = module.get(getRepositoryToken(Topic));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated topics', async () => {
      repo.findAndCount.mockResolvedValue([[mockTopic], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockTopic]);
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockTopic], 1]);

      await service.findAll({ status: 'ACTIVE' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'ACTIVE' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return topic when found', async () => {
      repo.findOne.mockResolvedValue(mockTopic);

      const result = await service.findById('topic-1');

      expect(result).toEqual(mockTopic);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('Topic not found');
    });
  });

  describe('create', () => {
    it('should create new topic', async () => {
      const createDto = { levelId: 'level-1', name: 'Family', displayOrder: 2 };
      repo.create.mockReturnValue({ ...mockTopic, ...createDto } as Topic);
      repo.save.mockResolvedValue({ ...mockTopic, ...createDto } as Topic);

      const result = await service.create(createDto);

      expect(result.name).toBe('Family');
    });
  });

  describe('update', () => {
    it('should update topic', async () => {
      repo.findOne.mockResolvedValue(mockTopic);
      repo.save.mockImplementation((e) => Promise.resolve(e as Topic));

      const result = await service.update('topic-1', { name: 'Updated Topic' });

      expect(result.name).toBe('Updated Topic');
    });
  });

  describe('softDelete', () => {
    it('should soft delete topic', async () => {
      repo.findOne.mockResolvedValue(mockTopic);
      repo.softRemove.mockResolvedValue(mockTopic);

      await service.softDelete('topic-1');

      expect(repo.softRemove).toHaveBeenCalled();
    });
  });
});

describe('GrammarPointService', () => {
  let service: GrammarPointService;
  let repo: jest.Mocked<Repository<GrammarPoint>>;

  const mockGrammar: GrammarPoint = {
    id: 'grammar-1',
    levelId: 'level-1',
    pattern: 'Subj + 是 + Obj',
    meaning: 'to be (statement)',
    usage: 'Used for identity and description',
    examples: ['我是学生', '他是老师'],
    status: 'ACTIVE',
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrammarPointService,
        { provide: getRepositoryToken(GrammarPoint), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<GrammarPointService>(GrammarPointService);
    repo = module.get(getRepositoryToken(GrammarPoint));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated grammar points sorted by createdAt DESC', async () => {
      repo.findAndCount.mockResolvedValue([[mockGrammar], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockGrammar]);
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { createdAt: 'DESC' } }),
      );
    });

    it('should filter by levelId', async () => {
      repo.findAndCount.mockResolvedValue([[mockGrammar], 1]);

      await service.findAll({ levelId: 'level-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { levelId: 'level-1' } }),
      );
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockGrammar], 1]);

      await service.findAll({ status: 'ACTIVE' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'ACTIVE' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return grammar point when found', async () => {
      repo.findOne.mockResolvedValue(mockGrammar);

      const result = await service.findById('grammar-1');

      expect(result).toEqual(mockGrammar);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('Grammar point not found');
    });
  });

  describe('create', () => {
    it('should create new grammar point', async () => {
      const createDto = { levelId: 'level-1', pattern: 'Subj + 有 + Obj', meaning: 'to have', status: 'ACTIVE' as const };
      repo.create.mockReturnValue({ ...mockGrammar, ...createDto } as GrammarPoint);
      repo.save.mockResolvedValue({ ...mockGrammar, ...createDto } as GrammarPoint);

      const result = await service.create(createDto);

      expect(result.pattern).toBe('Subj + 有 + Obj');
    });
  });

  describe('update', () => {
    it('should update grammar point', async () => {
      repo.findOne.mockResolvedValue(mockGrammar);
      repo.save.mockImplementation((e) => Promise.resolve(e as GrammarPoint));

      const result = await service.update('grammar-1', { meaning: 'Updated meaning' });

      expect(result.meaning).toBe('Updated meaning');
    });
  });

  describe('softDelete', () => {
    it('should soft delete grammar point', async () => {
      repo.findOne.mockResolvedValue(mockGrammar);
      repo.softRemove.mockResolvedValue(mockGrammar);

      await service.softDelete('grammar-1');

      expect(repo.softRemove).toHaveBeenCalled();
    });
  });
});

describe('LessonService', () => {
  let service: LessonService;
  let repo: jest.Mocked<Repository<Lesson>>;

  const mockLesson: Lesson = {
    id: 'lesson-1',
    levelId: 'level-1',
    title: 'Lesson 1: Numbers',
    description: 'Learn numbers 1-10',
    displayOrder: 1,
    status: 'ACTIVE',
    vocabularyCount: 10,
    grammarCount: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        { provide: getRepositoryToken(Lesson), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);
    repo = module.get(getRepositoryToken(Lesson));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated lessons sorted by displayOrder ASC', async () => {
      repo.findAndCount.mockResolvedValue([[mockLesson], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockLesson]);
    });

    it('should filter by levelId', async () => {
      repo.findAndCount.mockResolvedValue([[mockLesson], 1]);

      await service.findAll({ levelId: 'level-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { levelId: 'level-1' } }),
      );
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockLesson], 1]);

      await service.findAll({ status: 'ACTIVE' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'ACTIVE' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return lesson when found', async () => {
      repo.findOne.mockResolvedValue(mockLesson);

      const result = await service.findById('lesson-1');

      expect(result).toEqual(mockLesson);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('Lesson not found');
    });
  });

  describe('create', () => {
    it('should create new lesson', async () => {
      const createDto = { levelId: 'level-1', title: 'Lesson 2', displayOrder: 2 };
      repo.create.mockReturnValue({ ...mockLesson, ...createDto } as Lesson);
      repo.save.mockResolvedValue({ ...mockLesson, ...createDto } as Lesson);

      const result = await service.create(createDto);

      expect(result.title).toBe('Lesson 2');
    });
  });

  describe('update', () => {
    it('should update lesson', async () => {
      repo.findOne.mockResolvedValue(mockLesson);
      repo.save.mockImplementation((e) => Promise.resolve(e as Lesson));

      const result = await service.update('lesson-1', { title: 'Updated Lesson' });

      expect(result.title).toBe('Updated Lesson');
    });
  });

  describe('softDelete', () => {
    it('should soft delete lesson', async () => {
      repo.findOne.mockResolvedValue(mockLesson);
      repo.softRemove.mockResolvedValue(mockLesson);

      await service.softDelete('lesson-1');

      expect(repo.softRemove).toHaveBeenCalled();
    });
  });
});

describe('LessonContentService', () => {
  let service: LessonContentService;
  let repo: jest.Mocked<Repository<LessonContent>>;

  const mockContent: LessonContent = {
    id: 'content-1',
    lessonId: 'lesson-1',
    title: 'Introduction',
    content: 'Welcome to this lesson',
    contentType: 'TEXT',
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonContentService,
        { provide: getRepositoryToken(LessonContent), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<LessonContentService>(LessonContentService);
    repo = module.get(getRepositoryToken(LessonContent));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated contents filtered by lessonId', async () => {
      repo.findAndCount.mockResolvedValue([[mockContent], 1]);

      const result = await service.findAll({ lessonId: 'lesson-1' });

      expect(result.data).toEqual([mockContent]);
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { lessonId: 'lesson-1' } }),
      );
    });

    it('should sort by displayOrder ASC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({});

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { displayOrder: 'ASC' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return content when found', async () => {
      repo.findOne.mockResolvedValue(mockContent);

      const result = await service.findById('content-1');

      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('Lesson content not found');
    });
  });

  describe('create', () => {
    it('should create new content', async () => {
      const createDto = { lessonId: 'lesson-1', title: 'New Content', displayOrder: 2 };
      repo.create.mockReturnValue({ ...mockContent, ...createDto } as LessonContent);
      repo.save.mockResolvedValue({ ...mockContent, ...createDto } as LessonContent);

      const result = await service.create(createDto);

      expect(result.title).toBe('New Content');
    });
  });

  describe('update', () => {
    it('should update content', async () => {
      repo.findOne.mockResolvedValue(mockContent);
      repo.save.mockImplementation((e) => Promise.resolve(e as LessonContent));

      const result = await service.update('content-1', { title: 'Updated Title' });

      expect(result.title).toBe('Updated Title');
    });
  });

  describe('delete', () => {
    it('should permanently delete content', async () => {
      repo.findOne.mockResolvedValue(mockContent);
      repo.remove.mockResolvedValue(mockContent);

      await service.delete('content-1');

      expect(repo.remove).toHaveBeenCalled();
    });
  });
});

describe('TopicVocabularyService', () => {
  let service: TopicVocabularyService;
  let repo: jest.Mocked<Repository<TopicVocabulary>>;

  const mockTopicVocab: TopicVocabulary = {
    id: 'tv-1',
    topicId: 'topic-1',
    vocabularyId: 'vocab-1',
    displayOrder: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicVocabularyService,
        { provide: getRepositoryToken(TopicVocabulary), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<TopicVocabularyService>(TopicVocabularyService);
    repo = module.get(getRepositoryToken(TopicVocabulary));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated topic vocabularies filtered by topicId', async () => {
      repo.findAndCount.mockResolvedValue([[mockTopicVocab], 1]);

      const result = await service.findAll({ topicId: 'topic-1' });

      expect(result.data).toEqual([mockTopicVocab]);
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { topicId: 'topic-1' } }),
      );
    });

    it('should sort by displayOrder ASC', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({});

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ order: { displayOrder: 'ASC' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return topic vocabulary when found', async () => {
      repo.findOne.mockResolvedValue(mockTopicVocab);

      const result = await service.findById('tv-1');

      expect(result).toEqual(mockTopicVocab);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('Topic vocabulary not found');
    });
  });

  describe('create', () => {
    it('should create new topic vocabulary', async () => {
      const createDto = { topicId: 'topic-1', vocabularyId: 'vocab-2', displayOrder: 2 };
      repo.create.mockReturnValue({ ...mockTopicVocab, ...createDto } as TopicVocabulary);
      repo.save.mockResolvedValue({ ...mockTopicVocab, ...createDto } as TopicVocabulary);

      const result = await service.create(createDto);

      expect(result.vocabularyId).toBe('vocab-2');
    });
  });

  describe('update', () => {
    it('should update topic vocabulary', async () => {
      repo.findOne.mockResolvedValue(mockTopicVocab);
      repo.save.mockImplementation((e) => Promise.resolve(e as TopicVocabulary));

      const result = await service.update('tv-1', { displayOrder: 5 });

      expect(result.displayOrder).toBe(5);
    });
  });

  describe('delete', () => {
    it('should permanently delete topic vocabulary', async () => {
      repo.findOne.mockResolvedValue(mockTopicVocab);
      repo.remove.mockResolvedValue(mockTopicVocab);

      await service.delete('tv-1');

      expect(repo.remove).toHaveBeenCalled();
    });
  });
});
