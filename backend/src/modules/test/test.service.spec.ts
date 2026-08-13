import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  TestService,
  TestQuestionService,
  TestAttemptService,
  TestAnswerService,
  gradeQuestion,
} from './test.service';
import { Test as TestEntity } from './entities/test.entity';
import { TestQuestion } from './entities/test-question.entity';
import { TestAttempt } from './entities/test-attempt.entity';
import { TestAnswer } from './entities/test-answer.entity';
import { TestStatus, TestQuestionType, TestAttemptStatus } from '../../common/enums/test.enums';
import { Role } from '../../common/enums/user.enums';

function question(partial: Partial<TestQuestion>): TestQuestion {
  return {
    id: 'q1',
    testId: 't1',
    questionType: TestQuestionType.SINGLE_CHOICE,
    content: 'x',
    options: null,
    correctAnswer: null,
    points: 2,
    displayOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  } as TestQuestion;
}

describe('gradeQuestion (PR-05 chấm điểm phía server)', () => {
  it('SINGLE_CHOICE: khớp chính xác → đúng, lệch → sai', () => {
    const q = question({
      questionType: TestQuestionType.SINGLE_CHOICE,
      correctAnswer: { answer: 'B' },
      points: 2,
    });
    expect(gradeQuestion(q, 'B')).toEqual({ isCorrect: true, pointsAwarded: 2 });
    expect(gradeQuestion(q, 'A')).toEqual({ isCorrect: false, pointsAwarded: 0 });
  });

  it('TRUE_FALSE: true/false so khớp chính xác', () => {
    const q = question({
      questionType: TestQuestionType.TRUE_FALSE,
      correctAnswer: { answer: 'TRUE' },
    });
    expect(gradeQuestion(q, 'TRUE').isCorrect).toBe(true);
    expect(gradeQuestion(q, 'FALSE').isCorrect).toBe(false);
  });

  it('SHORT_ANSWER: khớp đáp án chuẩn hoá hoa/thường và khoảng trắng thừa', () => {
    const q = question({
      questionType: TestQuestionType.SHORT_ANSWER,
      correctAnswer: { answer: 'nước  Hoa', accepted: ['Bắc  Kinh'] },
    });
    // accepted: ["Bắc  Kinh"] sau chuẩn hoá khớp với "bắc kinh" (hoa/thường + space)
    expect(gradeQuestion(q, 'bắc kinh').isCorrect).toBe(true);
    // đáp án đơn: "nước hoa" (chuẩn hoá) khớp "nước  Hoa"
    expect(gradeQuestion(q, 'Nước hoa').isCorrect).toBe(true);
    expect(gradeQuestion(q, 'Hà Nội').isCorrect).toBe(false);
  });

  it('SHORT_ANSWER: bỏ trống (undefined) → sai', () => {
    const q = question({
      questionType: TestQuestionType.SHORT_ANSWER,
      correctAnswer: { answer: 'a' },
    });
    expect(gradeQuestion(q, undefined).isCorrect).toBe(false);
  });

  it('pointsAwarded = points khi đúng, 0 khi sai', () => {
    const q = question({
      questionType: TestQuestionType.SINGLE_CHOICE,
      correctAnswer: { answer: 'C' },
      points: 5,
    });
    expect(gradeQuestion(q, 'C').pointsAwarded).toBe(5);
    expect(gradeQuestion(q, 'D').pointsAwarded).toBe(0);
  });

  it('SHORT_ANSWER: null accepted array handled gracefully', () => {
    const q = question({
      questionType: TestQuestionType.SHORT_ANSWER,
      correctAnswer: { answer: 'hello', accepted: null },
    });
    expect(gradeQuestion(q, 'hello').isCorrect).toBe(true);
    expect(gradeQuestion(q, 'world').isCorrect).toBe(false);
  });

  it('SHORT_ANSWER: empty string should not match', () => {
    const q = question({
      questionType: TestQuestionType.SHORT_ANSWER,
      correctAnswer: { answer: 'test' },
    });
    expect(gradeQuestion(q, '').isCorrect).toBe(false);
  });

  it('SHORT_ANSWER: whitespace-only should not match', () => {
    const q = question({
      questionType: TestQuestionType.SHORT_ANSWER,
      correctAnswer: { answer: 'test' },
    });
    expect(gradeQuestion(q, '   ').isCorrect).toBe(false);
  });
});

describe('TestService', () => {
  let service: TestService;
  let repo: jest.Mocked<Repository<TestEntity>>;

  const mockTest: TestEntity = {
    id: 'test-1',
    teacherId: 'teacher-1',
    title: 'HSK 1 Quiz',
    description: 'Test for beginners',
    status: TestStatus.PUBLISHED,
    attemptLimit: 3,
    timeLimit: 1800,
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
        TestService,
        { provide: getRepositoryToken(TestEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<TestService>(TestService);
    repo = module.get(getRepositoryToken(TestEntity));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return paginated tests sorted by createdAt DESC', async () => {
      repo.findAndCount.mockResolvedValue([[mockTest], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockTest]);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by teacherId', async () => {
      repo.findAndCount.mockResolvedValue([[mockTest], 1]);

      await service.findAll({ teacherId: 'teacher-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { teacherId: 'teacher-1' } }),
      );
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockTest], 1]);

      await service.findAll({ status: TestStatus.PUBLISHED });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: TestStatus.PUBLISHED } }),
      );
    });

    it('should handle custom pagination', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 2, limit: 10 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('findById', () => {
    it('should return test when found', async () => {
      repo.findOne.mockResolvedValue(mockTest);

      const result = await service.findById('test-1');

      expect(result).toEqual(mockTest);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('Test not found');
    });
  });

  describe('create', () => {
    it('should create new test', async () => {
      const createDto = { teacherId: 'teacher-1', title: 'New Test', status: TestStatus.DRAFT };
      repo.create.mockReturnValue({ ...mockTest, ...createDto } as TestEntity);
      repo.save.mockResolvedValue({ ...mockTest, ...createDto } as TestEntity);

      const result = await service.create(createDto);

      expect(result.title).toBe('New Test');
    });
  });

  describe('update', () => {
    it('should update test', async () => {
      repo.findOne.mockResolvedValue(mockTest);
      repo.save.mockImplementation((e) => Promise.resolve(e as TestEntity));

      const result = await service.update('test-1', { title: 'Updated Test', status: TestStatus.CLOSED });

      expect(result.title).toBe('Updated Test');
      expect(result.status).toBe(TestStatus.CLOSED);
    });
  });

  describe('softDelete', () => {
    it('should soft delete test', async () => {
      repo.findOne.mockResolvedValue(mockTest);
      repo.softRemove.mockResolvedValue(mockTest);

      await service.softDelete('test-1');

      expect(repo.softRemove).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.softDelete('non-existent')).rejects.toThrow('Test not found');
    });
  });
});

describe('TestQuestionService', () => {
  let service: TestQuestionService;
  let repo: jest.Mocked<Repository<TestQuestion>>;

  const mockQuestion: TestQuestion = {
    id: 'q-1',
    testId: 'test-1',
    questionType: TestQuestionType.SINGLE_CHOICE,
    content: { question: 'What is 2+2?' },
    correctAnswer: { answer: '4' },
    options: ['2', '3', '4', '5'],
    points: 10,
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
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestQuestionService,
        { provide: getRepositoryToken(TestQuestion), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<TestQuestionService>(TestQuestionService);
    repo = module.get(getRepositoryToken(TestQuestion));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should strip correctAnswer by default', async () => {
      repo.findAndCount.mockResolvedValue([[mockQuestion], 1]);

      const result = await service.findAll({});

      expect(result.data[0]).not.toHaveProperty('correctAnswer');
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('content');
    });

    it('should include correctAnswer when includeAnswer=true', async () => {
      repo.findAndCount.mockResolvedValue([[mockQuestion], 1]);

      const result = await service.findAll({}, true);

      expect(result.data[0]).toHaveProperty('correctAnswer');
    });

    it('should filter by testId', async () => {
      repo.findAndCount.mockResolvedValue([[mockQuestion], 1]);

      await service.findAll({ testId: 'test-1' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { testId: 'test-1' } }),
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
    it('should strip correctAnswer by default', async () => {
      repo.findOne.mockResolvedValue(mockQuestion);

      const result = await service.findById('q-1');

      expect(result).not.toHaveProperty('correctAnswer');
    });

    it('should include correctAnswer when includeAnswer=true', async () => {
      repo.findOne.mockResolvedValue(mockQuestion);

      const result = await service.findById('q-1', true);

      expect(result).toHaveProperty('correctAnswer');
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow('Test question not found');
    });
  });

  describe('create', () => {
    it('should create new question', async () => {
      const createDto = { testId: 'test-1', questionType: TestQuestionType.SHORT_ANSWER, content: {}, points: 5, displayOrder: 2 };
      repo.create.mockReturnValue({ ...mockQuestion, ...createDto } as TestQuestion);
      repo.save.mockResolvedValue({ ...mockQuestion, ...createDto } as TestQuestion);

      const result = await service.create(createDto);

      expect(result.points).toBe(5);
    });
  });

  describe('update', () => {
    it('should update question', async () => {
      repo.findOne.mockResolvedValue(mockQuestion);
      repo.save.mockImplementation((e) => Promise.resolve(e as TestQuestion));

      const result = await service.update('q-1', { points: 15 });

      expect(result.points).toBe(15);
    });
  });

  describe('delete', () => {
    it('should permanently delete question', async () => {
      repo.findOne.mockResolvedValue(mockQuestion);
      repo.remove.mockResolvedValue(mockQuestion);

      await service.delete('q-1');

      expect(repo.remove).toHaveBeenCalled();
    });
  });
});

describe('TestAttemptService', () => {
  let service: TestAttemptService;
  let attemptRepo: jest.Mocked<Repository<TestAttempt>>;
  let testRepo: jest.Mocked<Repository<TestEntity>>;
  let answerRepo: jest.Mocked<Repository<TestAnswer>>;
  let questionRepo: jest.Mocked<Repository<TestQuestion>>;

  const mockTest: TestEntity = {
    id: 'test-1',
    teacherId: 'teacher-1',
    title: 'Test',
    status: TestStatus.PUBLISHED,
    attemptLimit: 3,
    timeLimit: 1800,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockAttempt: TestAttempt = {
    id: 'attempt-1',
    testId: 'test-1',
    userId: 'user-1',
    status: TestAttemptStatus.IN_PROGRESS,
    startedAt: new Date(),
    submittedAt: null,
    durationSeconds: null,
    score: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockAttemptRepo = { findAndCount: jest.fn(), findOne: jest.fn(), count: jest.fn(), create: jest.fn(), save: jest.fn() };
    const mockTestRepo = { findOne: jest.fn() };
    const mockAnswerRepo = { find: jest.fn() };
    const mockQuestionRepo = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestAttemptService,
        { provide: getRepositoryToken(TestAttempt), useValue: mockAttemptRepo },
        { provide: getRepositoryToken(TestEntity), useValue: mockTestRepo },
        { provide: getRepositoryToken(TestAnswer), useValue: mockAnswerRepo },
        { provide: getRepositoryToken(TestQuestion), useValue: mockQuestionRepo },
      ],
    }).compile();

    service = module.get<TestAttemptService>(TestAttemptService);
    attemptRepo = module.get(getRepositoryToken(TestAttempt));
    testRepo = module.get(getRepositoryToken(TestEntity));
    answerRepo = module.get(getRepositoryToken(TestAnswer));
    questionRepo = module.get(getRepositoryToken(TestQuestion));
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return own attempts for regular user', async () => {
      attemptRepo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      const result = await service.findAll({}, 'user-1', Role.FREE);

      expect(result.data).toEqual([mockAttempt]);
      expect(attemptRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });

    it('should allow teacher to view any user attempts', async () => {
      attemptRepo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      await service.findAll({ userId: 'user-2' }, 'teacher-1', Role.TEACHER);

      expect(attemptRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-2' } }),
      );
    });

    it('should allow admin to view any user attempts', async () => {
      attemptRepo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      await service.findAll({ userId: 'user-3' }, 'admin-1', Role.ADMIN);

      expect(attemptRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-3' } }),
      );
    });

    it('should filter by testId', async () => {
      attemptRepo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      await service.findAll({ testId: 'test-1' }, 'user-1', Role.FREE);

      expect(attemptRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ testId: 'test-1' }) }),
      );
    });

    it('should filter by status', async () => {
      attemptRepo.findAndCount.mockResolvedValue([[mockAttempt], 1]);

      await service.findAll({ status: TestAttemptStatus.IN_PROGRESS }, 'user-1', Role.FREE);

      expect(attemptRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: TestAttemptStatus.IN_PROGRESS }) }),
      );
    });
  });

  describe('findById', () => {
    it('should return attempt for owner', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);

      const result = await service.findById('attempt-1', 'user-1', Role.FREE);

      expect(result).toEqual(mockAttempt);
    });

    it('should allow teacher to view any attempt', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);

      const result = await service.findById('attempt-1', 'teacher-1', Role.TEACHER);

      expect(result).toEqual(mockAttempt);
    });

    it('should allow admin to view any attempt', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);

      const result = await service.findById('attempt-1', 'admin-1', Role.ADMIN);

      expect(result).toEqual(mockAttempt);
    });

    it('should throw ForbiddenException for non-owner non-privileged', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);

      await expect(service.findById('attempt-1', 'other-user', Role.FREE)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when not found', async () => {
      attemptRepo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent', 'user-1', Role.FREE)).rejects.toThrow();
    });
  });

  describe('start', () => {
    it('should create new attempt for published test', async () => {
      testRepo.findOne.mockResolvedValue(mockTest);
      attemptRepo.count.mockResolvedValue(0);
      attemptRepo.create.mockReturnValue(mockAttempt);
      attemptRepo.save.mockResolvedValue(mockAttempt);

      const result = await service.start({ testId: 'test-1' }, 'user-1');

      expect(result.status).toBe(TestAttemptStatus.IN_PROGRESS);
      expect(result.userId).toBe('user-1');
      expect(result.testId).toBe('test-1');
    });

    it('should throw BadRequestException for unpublished test (DRAFT)', async () => {
      const draftTest = { ...mockTest, status: TestStatus.DRAFT };
      testRepo.findOne.mockResolvedValue(draftTest);

      await expect(service.start({ testId: 'test-1' }, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for closed test', async () => {
      const closedTest = { ...mockTest, status: TestStatus.CLOSED };
      testRepo.findOne.mockResolvedValue(closedTest);

      await expect(service.start({ testId: 'test-1' }, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when attempt limit reached', async () => {
      testRepo.findOne.mockResolvedValue(mockTest);
      attemptRepo.count.mockResolvedValue(3); // attemptLimit is 3

      await expect(service.start({ testId: 'test-1' }, 'user-1')).rejects.toThrow(BadRequestException);
      await expect(service.start({ testId: 'test-1' }, 'user-1')).rejects.toThrow('Attempt limit reached');
    });

    it('should throw NotFoundException for non-existent test', async () => {
      testRepo.findOne.mockResolvedValue(null);

      await expect(service.start({ testId: 'non-existent' }, 'user-1')).rejects.toThrow();
    });
  });

  describe('submit', () => {
    it('should submit and calculate score correctly', async () => {
      const inProgressAttempt = { ...mockAttempt, status: TestAttemptStatus.IN_PROGRESS };
      attemptRepo.findOne.mockResolvedValue(inProgressAttempt);
      testRepo.findOne.mockResolvedValue(mockTest);
      answerRepo.find.mockResolvedValue([
        { questionId: 'q-1', pointsAwarded: 10 },
        { questionId: 'q-2', pointsAwarded: 5 },
      ]);
      questionRepo.find.mockResolvedValue([
        { id: 'q-1', points: 10 },
        { id: 'q-2', points: 10 },
      ]);
      attemptRepo.save.mockImplementation((e) => Promise.resolve(e as TestAttempt));

      const result = await service.submit('attempt-1', { durationSeconds: 600 }, 'user-1');

      expect(result.status).toBe(TestAttemptStatus.SUBMITTED);
      expect(result.score).toBe(75); // (10+5)/(10+10)*100 = 75
      expect(result.durationSeconds).toBe(600);
      expect(result.submittedAt).toBeDefined();
    });

    it('should handle zero total points', async () => {
      const inProgressAttempt = { ...mockAttempt, status: TestAttemptStatus.IN_PROGRESS };
      attemptRepo.findOne.mockResolvedValue(inProgressAttempt);
      testRepo.findOne.mockResolvedValue(mockTest);
      answerRepo.find.mockResolvedValue([]);
      questionRepo.find.mockResolvedValue([]);
      attemptRepo.save.mockImplementation((e) => Promise.resolve(e as TestAttempt));

      const result = await service.submit('attempt-1', { durationSeconds: 600 }, 'user-1');

      expect(result.score).toBe(0);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);

      await expect(service.submit('attempt-1', { durationSeconds: 600 }, 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for already submitted', async () => {
      const submittedAttempt = { ...mockAttempt, status: TestAttemptStatus.SUBMITTED };
      attemptRepo.findOne.mockResolvedValue(submittedAttempt);

      await expect(service.submit('attempt-1', { durationSeconds: 600 }, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });
});

describe('TestAnswerService', () => {
  let service: TestAnswerService;
  let answerRepo: jest.Mocked<Repository<TestAnswer>>;
  let attemptRepo: jest.Mocked<Repository<TestAttempt>>;
  let questionRepo: jest.Mocked<Repository<TestQuestion>>;

  const mockAttempt: TestAttempt = {
    id: 'attempt-1',
    testId: 'test-1',
    userId: 'user-1',
    status: TestAttemptStatus.IN_PROGRESS,
    startedAt: new Date(),
    submittedAt: null,
    durationSeconds: null,
    score: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQuestion: TestQuestion = {
    id: 'q-1',
    testId: 'test-1',
    questionType: TestQuestionType.SINGLE_CHOICE,
    content: { question: 'What is 2+2?' },
    correctAnswer: { answer: '4' },
    options: ['2', '3', '4', '5'],
    points: 10,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockAnswerRepo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn() };
    const mockAttemptRepo = { findOne: jest.fn() };
    const mockQuestionRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestAnswerService,
        { provide: getRepositoryToken(TestAnswer), useValue: mockAnswerRepo },
        { provide: getRepositoryToken(TestAttempt), useValue: mockAttemptRepo },
        { provide: getRepositoryToken(TestQuestion), useValue: mockQuestionRepo },
      ],
    }).compile();

    service = module.get<TestAnswerService>(TestAnswerService);
    answerRepo = module.get(getRepositoryToken(TestAnswer));
    attemptRepo = module.get(getRepositoryToken(TestAttempt));
    questionRepo = module.get(getRepositoryToken(TestQuestion));
  });

  afterEach(() => jest.clearAllMocks());

  describe('submitAnswer', () => {
    it('should grade and save correct answer', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);
      questionRepo.findOne.mockResolvedValue(mockQuestion);
      answerRepo.findOne.mockResolvedValue(null);
      answerRepo.create.mockReturnValue({ isCorrect: true, pointsAwarded: 10 } as TestAnswer);
      answerRepo.save.mockImplementation((e) => Promise.resolve(e as TestAnswer));

      const result = await service.submitAnswer('attempt-1', { questionId: 'q-1', answer: { answer: '4' } }, 'user-1');

      expect(result.isCorrect).toBe(true);
      expect(result.pointsAwarded).toBe(10);
    });

    it('should grade and save incorrect answer', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);
      questionRepo.findOne.mockResolvedValue(mockQuestion);
      answerRepo.findOne.mockResolvedValue(null);
      answerRepo.create.mockReturnValue({ isCorrect: false, pointsAwarded: 0 } as TestAnswer);
      answerRepo.save.mockImplementation((e) => Promise.resolve(e as TestAnswer));

      const result = await service.submitAnswer('attempt-1', { questionId: 'q-1', answer: { answer: '3' } }, 'user-1');

      expect(result.isCorrect).toBe(false);
      expect(result.pointsAwarded).toBe(0);
    });

    it('should update existing answer (upsert)', async () => {
      const existingAnswer = { id: 'a-1', isCorrect: false, pointsAwarded: 0, answer: null };
      attemptRepo.findOne.mockResolvedValue(mockAttempt);
      questionRepo.findOne.mockResolvedValue(mockQuestion);
      answerRepo.findOne.mockResolvedValue(existingAnswer as TestAnswer);
      answerRepo.save.mockImplementation((e) => Promise.resolve({ ...existingAnswer, ...e } as TestAnswer));

      const result = await service.submitAnswer('attempt-1', { questionId: 'q-1', answer: { answer: '4' } }, 'user-1');

      expect(result.isCorrect).toBe(true);
    });

    it('should throw ForbiddenException for non-owner attempt', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);

      await expect(service.submitAnswer('attempt-1', { questionId: 'q-1', answer: { answer: '4' } }, 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for already submitted attempt', async () => {
      const submittedAttempt = { ...mockAttempt, status: TestAttemptStatus.SUBMITTED };
      attemptRepo.findOne.mockResolvedValue(submittedAttempt);

      await expect(service.submitAnswer('attempt-1', { questionId: 'q-1', answer: { answer: '4' } }, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for question from different test', async () => {
      const otherQuestion = { ...mockQuestion, testId: 'other-test' };
      attemptRepo.findOne.mockResolvedValue(mockAttempt);
      questionRepo.findOne.mockResolvedValue(otherQuestion as TestQuestion);

      await expect(service.submitAnswer('attempt-1', { questionId: 'q-1', answer: { answer: '4' } }, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent attempt', async () => {
      attemptRepo.findOne.mockResolvedValue(null);

      await expect(service.submitAnswer('non-existent', { questionId: 'q-1', answer: { answer: '4' } }, 'user-1')).rejects.toThrow();
    });
  });

  describe('findByAttempt', () => {
    it('should return answers for owner', async () => {
      const answers = [{ id: 'a-1' }, { id: 'a-2' }];
      attemptRepo.findOne.mockResolvedValue(mockAttempt);
      answerRepo.find.mockResolvedValue(answers as TestAnswer[]);

      const result = await service.findByAttempt('attempt-1', 'user-1', Role.FREE);

      expect(result).toHaveLength(2);
    });

    it('should allow teacher to view any attempt answers', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);
      answerRepo.find.mockResolvedValue([]);

      await service.findByAttempt('attempt-1', 'teacher-1', Role.TEACHER);

      expect(answerRepo.find).toHaveBeenCalled();
    });

    it('should allow admin to view any attempt answers', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);
      answerRepo.find.mockResolvedValue([]);

      await service.findByAttempt('attempt-1', 'admin-1', Role.ADMIN);

      expect(answerRepo.find).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for non-owner non-privileged', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);

      await expect(service.findByAttempt('attempt-1', 'other-user', Role.FREE)).rejects.toThrow(ForbiddenException);
    });

    it('should order answers by createdAt ASC', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt);
      answerRepo.find.mockResolvedValue([]);

      await service.findByAttempt('attempt-1', 'user-1', Role.FREE);

      expect(answerRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ order: { createdAt: 'ASC' } }),
      );
    });
  });
});
