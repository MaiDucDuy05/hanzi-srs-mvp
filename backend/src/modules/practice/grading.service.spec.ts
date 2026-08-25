import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GradingService } from './grading.service';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { MistakeBookService } from '../resources/mistake-book.service';

describe('GradingService', () => {
  let service: GradingService;
  let attemptRepo: { findOne: jest.Mock };
  let mistakeBookSvc: { addToMistakeBook: jest.Mock };

  const mockAttempt: Partial<PracticeAttempt> = {
    id: 'att-1',
    userId: 'u1',
    practiceType: 'SENTENCE_ORDERING',
    questionData: {
      correctAnswers: {
        q1: ['t1', 't2', 't3'],
      },
    },
  };

  beforeEach(async () => {
    attemptRepo = { findOne: jest.fn() };
    mistakeBookSvc = { addToMistakeBook: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradingService,
        { provide: getRepositoryToken(PracticeAttempt), useValue: attemptRepo },
        { provide: MistakeBookService, useValue: mistakeBookSvc },
      ],
    }).compile();

    service = module.get<GradingService>(GradingService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('grade', () => {
    it('throws BadRequestException when attempt not found', async () => {
      attemptRepo.findOne.mockResolvedValue(null);

      await expect(service.grade('att-x', [], 10)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when questionData is missing', async () => {
      attemptRepo.findOne.mockResolvedValue({ ...mockAttempt, questionData: null });

      await expect(service.grade('att-1', [], 10)).rejects.toThrow(BadRequestException);
    });

    it('marks a correct ordering as correct', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      const result = await service.grade('att-1', [{ questionId: 'q1', tokenIds: ['t1', 't2', 't3'] }], 10);

      expect(result.totalQuestions).toBe(1);
      expect(result.totalCorrect).toBe(1);
      expect(result.score).toBe(1);
      expect(result.results[0].isCorrect).toBe(true);
    });

    it('flags wrong ordering (reversed)', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      const result = await service.grade('att-1', [{ questionId: 'q1', tokenIds: ['t3', 't2', 't1'] }], 10);

      expect(result.totalCorrect).toBe(0);
      expect(result.results[0].isCorrect).toBe(false);
      // Only positions where submitted ≠ correct AND both defined get marked
      // (t3,t1 at pos 0/2; t2 matches at pos 1 so it's correct).
      expect(result.results[0].wrongPositionIds).toEqual(expect.arrayContaining(['t3', 't1']));
    });

    it('flags missing tokens', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      const result = await service.grade('att-1', [{ questionId: 'q1', tokenIds: ['t1'] }], 10);

      expect(result.results[0].missingTokenIds).toEqual(['t2', 't3']);
    });

    it('flags extra tokens', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      const result = await service.grade('att-1', [{ questionId: 'q1', tokenIds: ['t1', 't2', 't3', 'extra'] }], 10);

      expect(result.results[0].extraTokenIds).toEqual(['extra']);
    });

    it('records mistakes to MistakeBookService when wrong', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      await service.grade('att-1', [{ questionId: 'q1', tokenIds: ['t3', 't2', 't1'] }], 10);

      expect(mistakeBookSvc.addToMistakeBook).toHaveBeenCalledTimes(1);
      expect(mistakeBookSvc.addToMistakeBook).toHaveBeenCalledWith(
        'u1',
        'SENTENCE_ORDERING',
        'att-1',
        'question',
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'q1',
        undefined,
      );
    });

    it('does not record to MistakeBookService when correct', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      await service.grade('att-1', [{ questionId: 'q1', tokenIds: ['t1', 't2', 't3'] }], 10);

      expect(mistakeBookSvc.addToMistakeBook).not.toHaveBeenCalled();
    });

    it('returns score=totalCorrect (MVP simple scoring)', async () => {
      attemptRepo.findOne.mockResolvedValue({
        ...mockAttempt,
        questionData: {
          correctAnswers: { q1: ['a'], q2: ['x', 'y'] },
        },
      } as PracticeAttempt);

      const result = await service.grade(
        'att-1',
        [
          { questionId: 'q1', tokenIds: ['a'] },
          { questionId: 'q2', tokenIds: ['y', 'x'] },
        ],
        20,
      );

      expect(result.totalQuestions).toBe(2);
      expect(result.totalCorrect).toBe(1);
      expect(result.totalWrong).toBe(1);
      expect(result.score).toBe(1);
    });
  });

  describe('validateSubmission', () => {
    it('returns valid:true when question is known and answer tokens are unique within combined set', () => {
      // Validator checks union size vs sum, so answer must use tokens not in correctOrder.
      const result = service.validateSubmission(
        [{ questionId: 'q1', tokenIds: ['x1', 'x2'] }],
        { q1: ['t1', 't2'] },
      );
      expect(result.valid).toBe(true);
    });

    it('returns valid:false when question is unknown', () => {
      const result = service.validateSubmission(
        [{ questionId: 'unknown', tokenIds: ['t1'] }],
        { q1: ['t1'] },
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Unknown question');
    });

    it('returns valid:false when token is duplicated within answer', () => {
      const result = service.validateSubmission(
        [{ questionId: 'q1', tokenIds: ['t1', 't1', 't2'] }],
        { q1: ['t1', 't2', 't3'] },
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Duplicate');
    });
  });

  describe('gradeFillBlank', () => {
    it('throws BadRequestException when attempt not found', async () => {
      const em = {
        getRepository: () => ({ findOne: jest.fn().mockResolvedValue(null) }),
      } as any;
      await expect(
        service.gradeFillBlank(em, 'att-x', [], 'u1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('marks correct answer and wrong answer distinctly', async () => {
      const attempt = {
        id: 'att-1',
        userId: 'u1',
        practiceType: 'FILL_BLANK',
        questionData: { correctAnswers: { q1: 'a', q2: 'b' } },
      };
      const em = {
        getRepository: () => ({ findOne: jest.fn().mockResolvedValue(attempt) }),
      } as any;

      const result = await service.gradeFillBlank(
        em,
        'att-1',
        [
          { questionId: 'q1', tokenId: 'a' },
          { questionId: 'q2', tokenId: 'wrong' },
        ],
        'u1',
      );

      expect(result.totalCorrect).toBe(1);
      expect(result.results[0].isCorrect).toBe(true);
      expect(result.results[1].isCorrect).toBe(false);
      expect(result.results[1].correctTokenId).toBe('b');
    });

    it('logs mistakes for wrong fill-blank answers', async () => {
      const attempt = {
        id: 'att-1',
        userId: 'u1',
        practiceType: 'FILL_BLANK',
        questionData: { correctAnswers: { q1: 'a' } },
      };
      const em = {
        getRepository: () => ({ findOne: jest.fn().mockResolvedValue(attempt) }),
      } as any;

      await service.gradeFillBlank(em, 'att-1', [{ questionId: 'q1', tokenId: 'wrong' }], 'u1');

      expect(mistakeBookSvc.addToMistakeBook).toHaveBeenCalledWith(
        'u1',
        'FILL_BLANK',
        'att-1',
        'question',
        expect.anything(),
        { submittedTokenId: 'wrong' },
        { correctTokenId: 'a' },
        'q1',
      );
    });
  });
});