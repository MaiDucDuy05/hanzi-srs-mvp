import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PracticeQuestionService, PracticeAttemptService } from './practice.service';
import { PracticeQuestion } from './entities/practice-question.entity';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { DailyUsageService } from '../subscription/subscription.service';
import { PracticeAttemptStatus, PracticeType, SourceType } from '../../common/enums/practice.enums';
import { Role } from '../../common/enums/user.enums';

describe('PracticeQuestionService', () => {
  let service: PracticeQuestionService;
  let repo: jest.Mocked<Repository<PracticeQuestion>>;

  const mockQuestion: PracticeQuestion = {
    id: 'question-1',
    levelId: 'level-1',
    questionType: 'FILL_BLANK',
    content: { sentence: '我___好。', answerType: 'HANZI' },
    correctAnswer: '你',
    options: ['你', '他', '她', '它'],
    difficulty: 'EASY',
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
        PracticeQuestionService,
        { provide: getRepositoryToken(PracticeQuestion), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PracticeQuestionService>(PracticeQuestionService);
    repo = module.get(getRepositoryToken(PracticeQuestion));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated questions with default options', async () => {
      repo.findAndCount.mockResolvedValue([[mockQuestion], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockQuestion]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by questionType', async () => {
      repo.findAndCount.mockResolvedValue([[mockQuestion], 1]);

      await service.findAll({ questionType: 'FILL_BLANK' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ questionType: 'FILL_BLANK' }),
        }),
      );
    });

    it('should filter by levelId', async () => {
      repo.findAndCount.mockResolvedValue([[mockQuestion], 1]);

      await service.findAll({ levelId: 'level-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ levelId: 'level-1' }),
        }),
      );
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockQuestion], 1]);

      await service.findAll({ status: 'ACTIVE' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return question when found', async () => {
      repo.findOne.mockResolvedValue(mockQuestion);

      const result = await service.findById('question-1');

      expect(result).toEqual(mockQuestion);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create and return new question', async () => {
      const createDto = {
        levelId: 'level-1',
        questionType: 'FILL_BLANK' as const,
        content: { sentence: '___叫什么？', answerType: 'HANZI' },
        correctAnswer: '你',
        options: ['你', '我', '他'],
        difficulty: 'MEDIUM' as const,
        status: 'ACTIVE' as const,
      };
      repo.create.mockReturnValue({ ...mockQuestion, ...createDto } as PracticeQuestion);
      repo.save.mockResolvedValue({ ...mockQuestion, ...createDto } as PracticeQuestion);

      const result = await service.create(createDto);

      expect(result.questionType).toBe(createDto.questionType);
    });
  });

  describe('update', () => {
    it('should update question', async () => {
      const updateDto = { correctAnswer: '她' };
      const updated = { ...mockQuestion, ...updateDto };
      repo.findOne.mockResolvedValue(mockQuestion);
      repo.save.mockResolvedValue(updated as PracticeQuestion);

      const result = await service.update('question-1', updateDto);

      expect(result.correctAnswer).toBe(updateDto.correctAnswer);
    });
  });

  describe('softDelete', () => {
    it('should soft delete question', async () => {
      repo.findOne.mockResolvedValue(mockQuestion);
      repo.softRemove.mockResolvedValue(mockQuestion);

      await service.softDelete('question-1');

      expect(repo.softRemove).toHaveBeenCalled();
    });
  });
});

describe('PracticeAttemptService', () => {
  let service: PracticeAttemptService;
  let repo: jest.Mocked<Repository<PracticeAttempt>>;
  let dataSource: jest.Mocked<DataSource>;
  let limitSvc: jest.Mocked<DailyUsageService>;

  const mockAttempt: PracticeAttempt = {
    id: 'attempt-1',
    userId: 'user-1',
    practiceType: PracticeType.FLASHCARD,
    sourceType: SourceType.LEVEL,
    sourceId: 'level-1',
    idempotencyKey: null,
    status: PracticeAttemptStatus.IN_PROGRESS,
    score: null,
    totalQuestions: 10,
    correctAnswers: null,
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransaction = jest.fn().mockImplementation(async (callback: (em: EntityManager) => Promise<any>) => {
    const mockEm = {
      getRepository: jest.fn().mockReturnValue({
        save: jest.fn().mockResolvedValue(mockAttempt),
        create: jest.fn().mockReturnValue(mockAttempt),
      }),
    };
    return callback(mockEm as unknown as EntityManager);
  });

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const mockDataSource = {
      transaction: mockTransaction,
    };

    const mockLimitSvc = {
      consumeInTransaction: jest.fn().mockResolvedValue({ allowed: true, usedCount: 1, limit: 3 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PracticeAttemptService,
        { provide: getRepositoryToken(PracticeAttempt), useValue: mockRepo },
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: DailyUsageService, useValue: mockLimitSvc },
      ],
    }).compile();

    service = module.get<PracticeAttemptService>(PracticeAttemptService);
    repo = module.get(getRepositoryToken(PracticeAttempt));
    dataSource = module.get(getDataSourceToken());
    limitSvc = module.get(DailyUsageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return own attempts for regular user', async () => {
      repo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      const result = await service.findAll({}, 'user-1', Role.FREE);

      expect(result.data).toEqual([mockAttempt]);
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }),
      );
    });

    it('should allow teacher to view any user attempts', async () => {
      repo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      await service.findAll({ userId: 'user-2' }, 'teacher-1', Role.TEACHER);

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-2' }),
        }),
      );
    });

    it('should allow admin to view any user attempts', async () => {
      repo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      await service.findAll({ userId: 'user-3' }, 'admin-1', Role.ADMIN);

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-3' }),
        }),
      );
    });

    it('should filter by practiceType', async () => {
      repo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      await service.findAll({ practiceType: PracticeType.FLASHCARD }, 'user-1', Role.FREE);

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ practiceType: PracticeType.FLASHCARD }),
        }),
      );
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      await service.findAll({ status: PracticeAttemptStatus.IN_PROGRESS }, 'user-1', Role.FREE);

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: PracticeAttemptStatus.IN_PROGRESS }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return attempt when user is owner', async () => {
      repo.findOne.mockResolvedValue(mockAttempt);

      const result = await service.findById('attempt-1', 'user-1', Role.FREE);

      expect(result).toEqual(mockAttempt);
    });

    it('should allow teacher to view any attempt', async () => {
      repo.findOne.mockResolvedValue(mockAttempt);

      const result = await service.findById('attempt-1', 'teacher-1', Role.TEACHER);

      expect(result).toEqual(mockAttempt);
    });

    it('should allow admin to view any attempt', async () => {
      repo.findOne.mockResolvedValue(mockAttempt);

      const result = await service.findById('attempt-1', 'admin-1', Role.ADMIN);

      expect(result).toEqual(mockAttempt);
    });

    it('should throw ForbiddenException when non-owner non-privileged user tries to view', async () => {
      repo.findOne.mockResolvedValue(mockAttempt);

      await expect(service.findById('attempt-1', 'other-user', Role.FREE)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when attempt not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent', 'user-1', Role.FREE)).rejects.toThrow();
    });
  });

  describe('start', () => {
    const startDto = {
      practiceType: PracticeType.FLASHCARD,
      sourceType: SourceType.LEVEL,
      sourceId: 'level-1',
    };

    it('should return existing attempt with same idempotencyKey', async () => {
      repo.findOne.mockResolvedValue(mockAttempt);

      const result = await service.start({ ...startDto, idempotencyKey: 'key-1' }, 'user-1', Role.FREE);

      expect(result).toEqual(mockAttempt);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should create new attempt when no idempotencyKey provided', async () => {
      repo.findOne.mockResolvedValue(null);

      const result = await service.start(startDto, 'user-1', Role.FREE);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(limitSvc.consumeInTransaction).toHaveBeenCalled();
    });

    it('should skip limit check for teacher', async () => {
      repo.findOne.mockResolvedValue(null);

      await service.start(startDto, 'teacher-1', Role.TEACHER);

      expect(limitSvc.consumeInTransaction).toHaveBeenCalledWith(
        expect.anything(),
        'teacher-1',
        'FLASHCARD:LEVEL:level-1',
        Role.TEACHER,
      );
    });

    it('should skip limit check for admin', async () => {
      repo.findOne.mockResolvedValue(null);

      await service.start(startDto, 'admin-1', Role.ADMIN);

      expect(limitSvc.consumeInTransaction).toHaveBeenCalledWith(
        expect.anything(),
        'admin-1',
        'FLASHCARD:LEVEL:level-1',
        Role.ADMIN,
      );
    });
  });

  describe('submit', () => {
    it('should submit attempt successfully', async () => {
      const inProgressAttempt = { ...mockAttempt, status: PracticeAttemptStatus.IN_PROGRESS, score: null };
      repo.findOne.mockResolvedValue(inProgressAttempt as PracticeAttempt);
      repo.save.mockImplementation((entity) => Promise.resolve(entity as PracticeAttempt));

      const result = await service.submit('attempt-1', { score: 80 }, 'user-1');

      expect(result.status).toBe(PracticeAttemptStatus.COMPLETED);
      expect(result.score).toBe(80);
      expect(result.completedAt).toBeDefined();
    });

    it('should throw ForbiddenException when user does not own attempt', async () => {
      repo.findOne.mockResolvedValue(mockAttempt);

      await expect(service.submit('attempt-1', { score: 80 }, 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when attempt is not in progress', async () => {
      const completedAttempt = { ...mockAttempt, status: PracticeAttemptStatus.COMPLETED };
      repo.findOne.mockResolvedValue(completedAttempt as PracticeAttempt);

      await expect(service.submit('attempt-1', { score: 80 }, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });
});
