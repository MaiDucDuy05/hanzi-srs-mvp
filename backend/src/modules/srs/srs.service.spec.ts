import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SrsService } from './srs.service';
import { UserVocabularyProgress } from './entities/user-vocabulary-progress.entity';
import { LessonContent } from '../curriculum/entities/lesson-content.entity';
import { Vocabulary } from '../curriculum/entities/vocabulary.entity';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { SrsRating } from './dto/srs.dto';

describe('SrsService', () => {
  let service: SrsService;
  let progressRepo: jest.Mocked<Repository<UserVocabularyProgress>>;
  let contentRepo: jest.Mocked<Repository<LessonContent>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SrsService,
        {
          provide: getRepositoryToken(UserVocabularyProgress),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LessonContent),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Vocabulary),
          useValue: {},
        },
        {
          provide: getRepositoryToken(TopicVocabulary),
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SrsService>(SrsService);
    progressRepo = module.get(getRepositoryToken(UserVocabularyProgress));
    contentRepo = module.get(getRepositoryToken(LessonContent));
  });

  afterEach(() => jest.clearAllMocks());

  describe('submitReview — AGAIN rating', () => {
    it('decreases mastery by 1 when mastered (mastery > 0)', async () => {
      const existing: Partial<UserVocabularyProgress> = {
        id: 'p1', userId: 'u1', vocabularyId: 'v1',
        masteryLevel: 3, reviewCount: 5, easinessFactor: 2.5,
        intervalDays: 10, nextReviewAt: new Date(), lastReviewedAt: new Date(),
        createdAt: new Date(), updatedAt: new Date(),
      };
      progressRepo.findOne.mockResolvedValue(existing as UserVocabularyProgress);
      progressRepo.save.mockImplementation((e) => Promise.resolve(e as UserVocabularyProgress));

      await service.submitReview('u1', { vocabularyId: 'v1', rating: SrsRating.AGAIN });

      expect(progressRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ masteryLevel: 2, intervalDays: 0 }),
      );
    });

    it('keeps mastery at 0 when already 0', async () => {
      const existing: Partial<UserVocabularyProgress> = {
        id: 'p1', userId: 'u1', vocabularyId: 'v1',
        masteryLevel: 0, reviewCount: 1, easinessFactor: 2.5,
        intervalDays: 0, nextReviewAt: new Date(), lastReviewedAt: null,
        createdAt: new Date(), updatedAt: new Date(),
      };
      progressRepo.findOne.mockResolvedValue(existing as UserVocabularyProgress);
      progressRepo.save.mockImplementation((e) => Promise.resolve(e as UserVocabularyProgress));

      await service.submitReview('u1', { vocabularyId: 'v1', rating: SrsRating.AGAIN });

      expect(progressRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ masteryLevel: 0, intervalDays: 0 }),
      );
    });
  });

  describe('submitReview — GOOD rating', () => {
    it('increases mastery and grows interval', async () => {
      // interval > 1 → interval updated with EF
      const existing: Partial<UserVocabularyProgress> = {
        id: 'p1', userId: 'u1', vocabularyId: 'v1',
        masteryLevel: 1, reviewCount: 2, easinessFactor: 2.5,
        intervalDays: 6, nextReviewAt: new Date(), lastReviewedAt: new Date(),
        createdAt: new Date(), updatedAt: new Date(),
      };
      progressRepo.findOne.mockResolvedValue(existing as UserVocabularyProgress);
      progressRepo.save.mockImplementation((e) => Promise.resolve(e as UserVocabularyProgress));

      await service.submitReview('u1', { vocabularyId: 'v1', rating: SrsRating.GOOD });

      const saved = (progressRepo.save as jest.Mock).mock.calls[0][0] as UserVocabularyProgress;
      expect(saved.masteryLevel).toBe(2);
      expect(saved.intervalDays).toBeGreaterThan(6); // interval grows with EF
      expect(saved.easinessFactor).toBeGreaterThanOrEqual(2.5); // EF does not decrease for GOOD
    });

    it('caps mastery at 4', async () => {
      const existing: Partial<UserVocabularyProgress> = {
        id: 'p1', userId: 'u1', vocabularyId: 'v1',
        masteryLevel: 4, reviewCount: 10, easinessFactor: 2.6,
        intervalDays: 30, nextReviewAt: new Date(), lastReviewedAt: new Date(),
        createdAt: new Date(), updatedAt: new Date(),
      };
      progressRepo.findOne.mockResolvedValue(existing as UserVocabularyProgress);
      progressRepo.save.mockImplementation((e) => Promise.resolve(e as UserVocabularyProgress));

      await service.submitReview('u1', { vocabularyId: 'v1', rating: SrsRating.GOOD });

      const saved = (progressRepo.save as jest.Mock).mock.calls[0][0] as UserVocabularyProgress;
      expect(saved.masteryLevel).toBe(4); // capped
    });
  });

  describe('submitReview — EASY rating', () => {
    it('increases mastery by 2 and grows interval more than GOOD', async () => {
      const existing: Partial<UserVocabularyProgress> = {
        id: 'p1', userId: 'u1', vocabularyId: 'v1',
        masteryLevel: 1, reviewCount: 2, easinessFactor: 2.5,
        intervalDays: 6, nextReviewAt: new Date(), lastReviewedAt: new Date(),
        createdAt: new Date(), updatedAt: new Date(),
      };
      progressRepo.findOne.mockResolvedValue(existing as UserVocabularyProgress);
      progressRepo.save.mockImplementation((e) => Promise.resolve(e as UserVocabularyProgress));

      await service.submitReview('u1', { vocabularyId: 'v1', rating: SrsRating.EASY });

      const saved = (progressRepo.save as jest.Mock).mock.calls[0][0] as UserVocabularyProgress;
      expect(saved.masteryLevel).toBe(3); // +2
      expect(saved.intervalDays).toBeGreaterThan(6); // EF * 1.3 multiplier
    });
  });

  describe('submitReview — HARD rating', () => {
    it('decreases interval compared to previous GOOD review', async () => {
      // After a GOOD review: interval = round(10 * 2.5) = 25
      // HARD multiplies by 0.8: round(25 * 0.8) = 20 — still > 10
      // So use a shorter interval to clearly show HARD reduction.
      // Previous GOOD: interval = round(3 * 2.5) = 7; HARD: round(7 * 0.8) = 6
      const existing: Partial<UserVocabularyProgress> = {
        id: 'p1', userId: 'u1', vocabularyId: 'v1',
        masteryLevel: 2, reviewCount: 3, easinessFactor: 2.5,
        intervalDays: 3, nextReviewAt: new Date(), lastReviewedAt: new Date(),
        createdAt: new Date(), updatedAt: new Date(),
      };
      progressRepo.findOne.mockResolvedValue(existing as UserVocabularyProgress);
      progressRepo.save.mockImplementation((e) => Promise.resolve(e as UserVocabularyProgress));

      await service.submitReview('u1', { vocabularyId: 'v1', rating: SrsRating.HARD });

      const saved = (progressRepo.save as jest.Mock).mock.calls[0][0] as UserVocabularyProgress;
      expect(saved.intervalDays).toBeLessThan(7); // HARD reduces interval vs a GOOD would give
      expect(saved.easinessFactor).toBeLessThan(2.5); // EF decreases
    });
  });

  describe('submitReview — new vocab (no existing progress)', () => {
    it('creates new progress row and saves updated SM-2 values', async () => {
      progressRepo.findOne.mockResolvedValue(null);
      // Return a fresh object (not the dto reference) so applySm2 mutates a copy.
      progressRepo.create.mockImplementation((dto: any) => ({ ...dto } as UserVocabularyProgress));
      progressRepo.save.mockImplementation((e) => Promise.resolve(e as UserVocabularyProgress));

      await service.submitReview('u1', { vocabularyId: 'v1', rating: SrsRating.GOOD });

      // First call to create has original defaults (mastery=0)
      expect(progressRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u1', vocabularyId: 'v1', masteryLevel: 0 }),
      );
      // Saved object has SM-2 applied (mastery=1, interval=1 for first GOOD)
      const saved = (progressRepo.save as jest.Mock).mock.calls[0][0];
      expect(saved.reviewCount).toBe(1);
      expect(saved.masteryLevel).toBe(1); // new vocab first GOOD → mastery=1
      expect(saved.intervalDays).toBe(1); // new vocab first GOOD → interval=1
    });
  });

  describe('getProgressByLesson', () => {
    it('returns progress map for vocabularies in lesson', async () => {
      contentRepo.find.mockResolvedValue([
        { lessonId: 'l1', contentType: 'VOCABULARY', contentId: 'v1' } as LessonContent,
        { lessonId: 'l1', contentType: 'VOCABULARY', contentId: 'v2' } as LessonContent,
      ]);
      progressRepo.find.mockResolvedValue([
        {
          userId: 'u1', vocabularyId: 'v1', masteryLevel: 2, reviewCount: 5,
          easinessFactor: 2.5, intervalDays: 7,
          nextReviewAt: new Date('2026-01-01'), lastReviewedAt: new Date('2025-12-25'),
          createdAt: new Date(), updatedAt: new Date(),
        },
      ] as UserVocabularyProgress[]);

      const result = await service.getProgressByLesson('u1', 'l1');

      expect(contentRepo.find).toHaveBeenCalledWith({
        where: { lessonId: 'l1' },
      });
      expect(result.get('v1')?.masteryLevel).toBe(2);
      expect(result.get('v2')).toBeUndefined(); // v2 has no progress
    });

    it('returns empty map for lesson with no vocabulary', async () => {
      contentRepo.find.mockResolvedValue([]);

      const result = await service.getProgressByLesson('u1', 'l-empty');

      expect(result.size).toBe(0);
    });
  });
});
