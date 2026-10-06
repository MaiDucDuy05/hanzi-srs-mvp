import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FillBlankService } from './fill-blank.service';
import { PracticeQuestion } from './entities/practice-question.entity';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { SourceType } from '../../common/enums/practice.enums';

describe('FillBlankService', () => {
  let service: FillBlankService;
  let qRepo: { find: jest.Mock };
  let attemptRepo: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    qRepo = { find: jest.fn() };
    attemptRepo = { findOne: jest.fn(), save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FillBlankService,
        { provide: getRepositoryToken(PracticeQuestion), useValue: qRepo },
        { provide: getRepositoryToken(PracticeAttempt), useValue: attemptRepo },
        { provide: getRepositoryToken(TopicVocabulary), useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<FillBlankService>(FillBlankService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('startFillBlank', () => {
    const mockAttempt: Partial<PracticeAttempt> = { id: 'att-1', userId: 'u1' };

    it('throws NotFoundException when attempt not found', async () => {
      attemptRepo.findOne.mockResolvedValue(null);

      await expect(
        service.startFillBlank('att-x', 'src-1', SourceType.LESSON),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when no questions found', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      qRepo.find.mockResolvedValue([]);

      await expect(
        service.startFillBlank('att-1', 'src-1', SourceType.LESSON),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.startFillBlank('att-1', 'src-1', SourceType.LESSON),
      ).rejects.toThrow('Không tìm thấy câu hỏi');
    });

    it('returns shuffled questions for LESSON source', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      attemptRepo.save.mockImplementation((a) => Promise.resolve(a as PracticeAttempt));

      const questions = [
        {
          id: 'q1',
          prompt: 'Hello ___',
          translation: 'Xin chào',
          explanation: null,
          questionData: { choices: ['world', 'there', 'everyone'] },
          acceptedAnswers: { list: ['world'] },
        },
      ] as any;

      qRepo.find.mockResolvedValue(questions);

      const result = await service.startFillBlank('att-1', 'lesson-1', SourceType.LESSON);

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].questionId).toBe('q1');
      expect(result.questions[0].options).toHaveLength(3);
      expect(result.snapshot.correctAnswers['q1']).toBe('world');
    });

    it('queries with topicId when provided', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      attemptRepo.save.mockImplementation((a) => Promise.resolve(a as PracticeAttempt));
      qRepo.find.mockResolvedValue([
        {
          id: 'q1',
          prompt: 'P ___',
          questionData: { choices: ['a', 'b'] },
          acceptedAnswers: { list: ['a'] },
        } as any,
      ]);

      await service.startFillBlank('att-1', 'lesson-1', SourceType.LESSON, 'topic-1');

      expect(qRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ topicId: 'topic-1' }),
        }),
      );
    });

    it('caps question count to 10 maximum', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      attemptRepo.save.mockImplementation((a) => Promise.resolve(a as PracticeAttempt));
      qRepo.find.mockResolvedValue([]);

      await expect(
        service.startFillBlank('att-1', 'lesson-1', SourceType.LESSON, undefined, 50),
      ).rejects.toThrow(NotFoundException);

      expect(qRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });

    it('persists snapshot to attempt.questionData', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      attemptRepo.save.mockImplementation((a) => Promise.resolve(a as PracticeAttempt));

      qRepo.find.mockResolvedValue([
        {
          id: 'q1',
          prompt: 'Q1',
          questionData: { choices: ['x', 'y'] },
          acceptedAnswers: { list: ['x'] },
        } as any,
      ]);

      await service.startFillBlank('att-1', 'level-1', SourceType.LEVEL);

      expect(attemptRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'att-1',
          questionData: expect.objectContaining({
            snapshot: expect.any(Object),
            correctAnswers: expect.any(Object),
          }),
        }),
      );
    });

    it('handles missing choices gracefully (empty array)', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      attemptRepo.save.mockImplementation((a) => Promise.resolve(a as PracticeAttempt));

      qRepo.find.mockResolvedValue([
        {
          id: 'q1',
          prompt: 'Q',
          questionData: null,
          acceptedAnswers: { list: ['x'] },
        } as any,
      ]);

      const result = await service.startFillBlank('att-1', 'l1', SourceType.LEVEL);
      expect(result.questions[0].options).toEqual([]);
    });

    it('falls back to empty string when acceptedAnswers is missing', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      attemptRepo.save.mockImplementation((a) => Promise.resolve(a as PracticeAttempt));

      qRepo.find.mockResolvedValue([
        {
          id: 'q1',
          prompt: 'Q',
          questionData: { choices: ['a', 'b'] },
          acceptedAnswers: null,
        } as any,
      ]);

      const result = await service.startFillBlank('att-1', 'l1', SourceType.LEVEL);
      expect(result.snapshot.correctAnswers['q1']).toBe('');
    });
  });
});