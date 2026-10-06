import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SentenceOrderingService } from './sentence-ordering.service';
import { PracticeQuestion } from './entities/practice-question.entity';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { SourceType } from '../../common/enums/practice.enums';

describe('SentenceOrderingService', () => {
  let service: SentenceOrderingService;
  let qRepo: { find: jest.Mock };
  let attemptRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    qRepo = { find: jest.fn() };
    attemptRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SentenceOrderingService,
        { provide: getRepositoryToken(PracticeQuestion), useValue: qRepo },
        { provide: getRepositoryToken(PracticeAttempt), useValue: attemptRepo },
        { provide: getRepositoryToken(TopicVocabulary), useValue: {} },
      ],
    }).compile();

    service = module.get<SentenceOrderingService>(SentenceOrderingService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('startSentenceOrdering', () => {
    const mockAttempt: Partial<PracticeAttempt> = { id: 'att-1' };

    it('throws NotFoundException when attempt not found', async () => {
      attemptRepo.findOne.mockResolvedValue(null);

      await expect(
        service.startSentenceOrdering('att-x', 'src-1', SourceType.LESSON),
      ).rejects.toThrow(NotFoundException);
    });

    it('returns empty questions when DB has no questions', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      qRepo.find.mockResolvedValue([]);

      const result = await service.startSentenceOrdering('att-1', 'lesson-1', SourceType.LESSON);

      expect(result.questions).toEqual([]);
      expect(result.snapshot.correctAnswers).toEqual({});
    });

    it('queries by topicId when topicId is provided', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      qRepo.find.mockResolvedValue([]);

      await service.startSentenceOrdering('att-1', 'src', SourceType.LESSON, 'topic-1');

      expect(qRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ topicId: 'topic-1' }),
        }),
      );
    });

    it('queries by lessonId when sourceType LESSON', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      qRepo.find.mockResolvedValue([]);

      await service.startSentenceOrdering('att-1', 'lesson-1', SourceType.LESSON);

      expect(qRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ lessonId: 'lesson-1' }),
        }),
      );
    });

    it('queries by levelId when sourceType LEVEL', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      qRepo.find.mockResolvedValue([]);

      await service.startSentenceOrdering('att-1', 'level-1', SourceType.LEVEL);

      expect(qRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ levelId: 'level-1' }),
        }),
      );
    });

    it('skips questions with no tokens or no correctOrder', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      qRepo.find.mockResolvedValue([
        {
          id: 'q1',
          prompt: 'no tokens',
          questionData: {},
          answerData: { orderedTokenIds: ['t1'] },
        },
        {
          id: 'q2',
          prompt: 'no correct',
          questionData: { tokens: [{ id: 't1', text: '你' }] },
          answerData: {},
        },
        {
          id: 'q3',
          prompt: 'ok',
          questionData: { tokens: [{ id: 't1', text: '你' }, { id: 't2', text: '好' }] },
          answerData: { orderedTokenIds: ['t1', 't2'] },
        },
      ] as any);

      const result = await service.startSentenceOrdering('att-1', 'lesson-1', SourceType.LESSON);

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].questionId).toBe('q3');
      expect(result.snapshot.correctAnswers['q3']).toEqual(['t1', 't2']);
    });

    it('captures prompt, translation, explanation on question', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      qRepo.find.mockResolvedValue([
        {
          id: 'q1',
          prompt: 'Translate: Hello',
          translation: 'Xin chào',
          explanation: 'Common greeting',
          questionData: { tokens: [{ id: 't1', text: '你' }, { id: 't2', text: '好' }] },
          answerData: { orderedTokenIds: ['t1', 't2'] },
        } as any,
      ]);

      const result = await service.startSentenceOrdering('att-1', 'l1', SourceType.LESSON);

      expect(result.questions[0]).toEqual(
        expect.objectContaining({
          prompt: 'Translate: Hello',
          translation: 'Xin chào',
          explanation: 'Common greeting',
        }),
      );
    });

    it('caps question count to 10', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);
      qRepo.find.mockResolvedValue([]);

      await service.startSentenceOrdering('att-1', 'l1', SourceType.LESSON, undefined, 50);

      expect(qRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });

    it('falls back to correctOrder when orderedTokenIds missing', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      qRepo.find.mockResolvedValue([
        {
          id: 'q1',
          prompt: 'p',
          questionData: { tokens: [{ id: 't1', text: 'a' }, { id: 't2', text: 'b' }] },
          answerData: { correctOrder: ['t1', 't2'] },
        } as any,
      ]);

      const result = await service.startSentenceOrdering('att-1', 'l1', SourceType.LESSON);
      expect(result.snapshot.correctAnswers['q1']).toEqual(['t1', 't2']);
    });

    it('produces deterministic shuffle for same attempt+question seed', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      qRepo.find.mockResolvedValue([
        {
          id: 'q1',
          prompt: 'p',
          questionData: {
            tokens: [
              { id: 't1', text: 'a' },
              { id: 't2', text: 'b' },
              { id: 't3', text: 'c' },
              { id: 't4', text: 'd' },
            ],
          },
          answerData: { orderedTokenIds: ['t1', 't2', 't3', 't4'] },
        } as any,
      ]);

      const r1 = await service.startSentenceOrdering('att-1', 'l1', SourceType.LESSON);
      const r2 = await service.startSentenceOrdering('att-1', 'l1', SourceType.LESSON);

      // Same seed => same shuffled order
      const ids1 = r1.questions[0].tokens.map((t) => t.id);
      const ids2 = r2.questions[0].tokens.map((t) => t.id);
      expect(ids1).toEqual(ids2);
    });
  });
});