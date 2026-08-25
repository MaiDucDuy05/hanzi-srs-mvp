import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HanziWritingService } from './hanzi-writing.service';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { Vocabulary } from '../curriculum/entities/vocabulary.entity';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { LessonContent } from '../curriculum/entities/lesson-content.entity';
import { MistakeBookService } from '../resources/mistake-book.service';
import { PracticeAttemptStatus, SourceType } from '../../common/enums/practice.enums';
import { ContentType } from '../../common/enums/curriculum.enums';

describe('HanziWritingService', () => {
  let service: HanziWritingService;
  let attemptRepo: { findOne: jest.Mock; update: jest.Mock };
  let vocabRepo: { find: jest.Mock };
  let tvRepo: { find: jest.Mock };
  let lcRepo: { find: jest.Mock };
  let mistakeBookSvc: { addToMistakeBook: jest.Mock };

  beforeEach(async () => {
    attemptRepo = { findOne: jest.fn(), update: jest.fn() };
    vocabRepo = { find: jest.fn() };
    tvRepo = { find: jest.fn() };
    lcRepo = { find: jest.fn() };
    mistakeBookSvc = { addToMistakeBook: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HanziWritingService,
        { provide: getRepositoryToken(PracticeAttempt), useValue: attemptRepo },
        { provide: getRepositoryToken(Vocabulary), useValue: vocabRepo },
        { provide: getRepositoryToken(TopicVocabulary), useValue: tvRepo },
        { provide: getRepositoryToken(LessonContent), useValue: lcRepo },
        { provide: MistakeBookService, useValue: mistakeBookSvc },
      ],
    }).compile();

    service = module.get<HanziWritingService>(HanziWritingService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('resolveChars', () => {
    it('throws BadRequestException when no source provided', async () => {
      await expect(service.resolveChars({} as any)).rejects.toThrow(BadRequestException);
    });

    it('returns empty array when topic has no vocabulary records', async () => {
      tvRepo.find.mockResolvedValue([]);

      const result = await service.resolveChars({ topicId: 't1' });
      expect(result).toEqual([]);
    });

    it('extracts unique chars from vocabularies by topicId', async () => {
      tvRepo.find.mockResolvedValue([
        { topicId: 't1', vocabularyId: 'v1' },
        { topicId: 't1', vocabularyId: 'v2' },
      ]);
      vocabRepo.find.mockResolvedValue([
        { id: 'v1', hanzi: '你好', pinyin: 'nǐ hǎo', meaningVi: 'xin chào', audioKey: 'a1' },
        { id: 'v2', hanzi: '学习', pinyin: 'xuéxí', meaningVi: 'học tập', audioKey: null },
      ] as any);

      const result = await service.resolveChars({ topicId: 't1' });

      expect(result).toHaveLength(4);
      const chars = result.map((c) => c.char);
      expect(chars).toEqual(expect.arrayContaining(['你', '好', '学', '习']));
    });

    it('extracts unique chars from vocabularies by lessonId', async () => {
      lcRepo.find.mockResolvedValue([
        { lessonId: 'l1', contentType: ContentType.VOCABULARY, contentId: 'v1' },
      ]);
      vocabRepo.find.mockResolvedValue([
        { id: 'v1', hanzi: '好', pinyin: 'hǎo', meaningVi: 'tốt', audioKey: null },
      ] as any);

      const result = await service.resolveChars({ lessonId: 'l1' });

      expect(result).toHaveLength(1);
      expect(result[0].char).toBe('好');
    });

    it('returns empty array when lesson has no vocabulary content', async () => {
      lcRepo.find.mockResolvedValue([]);

      const result = await service.resolveChars({ lessonId: 'l1' });
      expect(result).toEqual([]);
    });

    it('extracts chars from vocabularies by levelId', async () => {
      vocabRepo.find.mockResolvedValue([
        { id: 'v1', hanzi: '爱', pinyin: 'ài', meaningVi: 'yêu', audioKey: null },
      ] as any);

      const result = await service.resolveChars({ levelId: 'lvl-1' });
      expect(result).toHaveLength(1);
      expect(result[0].char).toBe('爱');
    });

    it('filters by allowed chars when dto.chars provided', async () => {
      vocabRepo.find.mockResolvedValue([
        { id: 'v1', hanzi: '你好', pinyin: 'nǐ hǎo', meaningVi: 'xin chào', audioKey: null },
      ] as any);

      const result = await service.resolveChars({ levelId: 'l1', chars: ['你'] });
      expect(result).toHaveLength(1);
      expect(result[0].char).toBe('你');
    });

    it('does not duplicate the same char across vocabularies', async () => {
      vocabRepo.find.mockResolvedValue([
        { id: 'v1', hanzi: '好', pinyin: 'hǎo', meaningVi: 'tốt', audioKey: null },
        { id: 'v2', hanzi: '好学生', pinyin: 'hǎo xuéshēng', meaningVi: 'học sinh giỏi', audioKey: null },
      ] as any);

      const result = await service.resolveChars({ levelId: 'l1' });
      const charCounts = result.reduce<Record<string, number>>((acc, c) => {
        acc[c.char] = (acc[c.char] || 0) + 1;
        return acc;
      }, {});
      expect(charCounts['好']).toBe(1);
    });
  });

  describe('saveSessionChars', () => {
    it('persists characters into attempt.questionData', async () => {
      await service.saveSessionChars('att-1', [
        { char: '你', pinyin: 'nǐ', meaning: 'bạn', audioKey: null, vocabularyId: 'v1' },
      ]);

      expect(attemptRepo.update).toHaveBeenCalledWith(
        { id: 'att-1' },
        expect.objectContaining({
          questionData: expect.objectContaining({
            characters: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('complete', () => {
    const mockAttempt: Partial<PracticeAttempt> = {
      id: 'att-1',
      userId: 'u1',
      practiceType: 'HANZI_WRITING',
      status: PracticeAttemptStatus.IN_PROGRESS,
      questionData: {
        characters: [
          { char: '你', pinyin: 'nǐ', meaning: 'bạn', audioKey: null, vocabularyId: 'v1' },
          { char: '好', pinyin: 'hǎo', meaning: 'tốt', audioKey: null, vocabularyId: 'v2' },
        ],
      },
    };

    it('throws NotFoundException when attempt not found', async () => {
      attemptRepo.findOne.mockResolvedValue(null);

      await expect(
        service.complete('att-x', 'u1', { characters: [], durationSeconds: 10 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when user does not own attempt', async () => {
      attemptRepo.findOne.mockResolvedValue({ ...mockAttempt, userId: 'someone-else' });

      await expect(
        service.complete('att-1', 'u1', { characters: [], durationSeconds: 10 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when attempt is not in progress', async () => {
      attemptRepo.findOne.mockResolvedValue({
        ...mockAttempt,
        status: PracticeAttemptStatus.COMPLETED,
      });

      await expect(
        service.complete('att-1', 'u1', { characters: [], durationSeconds: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for invalid chars', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      await expect(
        service.complete('att-1', 'u1', {
          characters: [{ char: 'INVALID', mistakes: 0, skipped: false }],
          durationSeconds: 10,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('records mistakes for chars with mistakes > 0', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      const result = await service.complete('att-1', 'u1', {
        characters: [
          { char: '你', mistakes: 2, skipped: false },
          { char: '好', mistakes: 0, skipped: false },
        ],
        durationSeconds: 60,
      });

      expect(result.completedChars).toBe(2);
      expect(result.totalMistakes).toBe(2);
      expect(mistakeBookSvc.addToMistakeBook).toHaveBeenCalledWith(
        'u1',
        'HANZI_WRITING',
        'att-1',
        'vocabulary',
        expect.anything(),
        { skipped: false, mistakes: 2 },
        null,
        undefined,
        'v1',
      );
    });

    it('records mistakes for skipped chars', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      const result = await service.complete('att-1', 'u1', {
        characters: [
          { char: '你', mistakes: 0, skipped: true },
          { char: '好', mistakes: 0, skipped: false },
        ],
        durationSeconds: 60,
      });

      expect(result.completedChars).toBe(1);
      expect(result.totalMistakes).toBe(0);
      expect(mistakeBookSvc.addToMistakeBook).toHaveBeenCalledWith(
        'u1',
        'HANZI_WRITING',
        'att-1',
        'vocabulary',
        expect.anything(),
        { skipped: true, mistakes: 0 },
        null,
        undefined,
        'v1',
      );
    });

    it('updates attempt with COMPLETED status', async () => {
      attemptRepo.findOne.mockResolvedValue(mockAttempt as PracticeAttempt);

      await service.complete('att-1', 'u1', {
        characters: [
          { char: '你', mistakes: 0, skipped: false },
          { char: '好', mistakes: 0, skipped: false },
        ],
        durationSeconds: 30,
      });

      expect(attemptRepo.update).toHaveBeenCalledWith(
        { id: 'att-1' },
        expect.objectContaining({
          status: PracticeAttemptStatus.COMPLETED,
          score: 2,
          correctCount: 2,
          wrongCount: 0,
          durationSeconds: 30,
        }),
      );
    });
  });
});