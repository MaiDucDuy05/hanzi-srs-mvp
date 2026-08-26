import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StudentProgressService } from './student-progress.service';
import { User } from '../auth/entities/user.entity';
import { PracticeAttempt } from '../practice/entities/practice-attempt.entity';
import { Lesson } from '../curriculum/entities/lesson.entity';
import { LessonContent } from '../curriculum/entities/lesson-content.entity';
import { UserVocabularyProgress } from '../srs/entities/user-vocabulary-progress.entity';
import { UserLessonProgress } from './entities/user-lesson-progress.entity';

describe('StudentProgressService', () => {
  let service: StudentProgressService;
  const userRepo = {
    findOneBy: jest.fn(),
    save: jest.fn((x: any) => Promise.resolve(x)),
  };
  const attemptRepo = { createQueryBuilder: jest.fn() };
  const lessonRepo = { find: jest.fn() };
  const contentRepo = { createQueryBuilder: jest.fn() };
  const progressRepo = { createQueryBuilder: jest.fn() };
  const lessonProgressRepo = {
    findOneBy: jest.fn(),
    create: jest.fn((x: any) => x),
    save: jest.fn((x: any) => Promise.resolve(x)),
  };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        StudentProgressService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(PracticeAttempt), useValue: attemptRepo },
        { provide: getRepositoryToken(Lesson), useValue: lessonRepo },
        { provide: getRepositoryToken(LessonContent), useValue: contentRepo },
        { provide: getRepositoryToken(UserVocabularyProgress), useValue: progressRepo },
        { provide: getRepositoryToken(UserLessonProgress), useValue: lessonProgressRepo },
      ],
    }).compile();
    service = mod.get(StudentProgressService);
    jest.resetAllMocks();
    userRepo.save.mockImplementation((x: any) => Promise.resolve(x));
    lessonProgressRepo.create.mockImplementation((x: any) => x);
    lessonProgressRepo.save.mockImplementation((x: any) => Promise.resolve(x));
  });

  describe('getLessonProgress', () => {
    it('returns existing record when found', async () => {
      const existing: any = { id: 'lp1', userId: 'u1', lessonId: 'l1' };
      lessonProgressRepo.findOneBy.mockResolvedValueOnce(existing);
      const out = await service.getLessonProgress('u1', 'l1');
      expect(out).toBe(existing);
    });

    it('creates and persists a new record when missing', async () => {
      lessonProgressRepo.findOneBy.mockResolvedValueOnce(null);
      const out = await service.getLessonProgress('u1', 'l1');
      expect(out.userId).toBe('u1');
      expect(lessonProgressRepo.save).toHaveBeenCalled();
    });
  });

  it('markVocabCompleted sets isCompleted only when grammar also done', async () => {
    const lp: any = { id: 'lp1', userId: 'u1', lessonId: 'l1', vocabCompleted: false, grammarCompleted: true };
    jest.spyOn(service, 'getLessonProgress').mockResolvedValue(lp);
    await service.markVocabCompleted('u1', 'l1');
    expect(lp.vocabCompleted).toBe(true);
    expect(lp.isCompleted).toBe(true);
    expect(lp.completedAt).toBeInstanceOf(Date);
  });

  it('markVocabCompleted leaves isCompleted false when grammar not done', async () => {
    const lp: any = { userId: 'u1', lessonId: 'l1', vocabCompleted: false, grammarCompleted: false };
    jest.spyOn(service, 'getLessonProgress').mockResolvedValue(lp);
    await service.markVocabCompleted('u1', 'l1');
    expect(lp.isCompleted).toBeFalsy();
  });

  describe('getProgress', () => {
    it('throws when user not found', async () => {
      userRepo.findOneBy.mockResolvedValueOnce(null);
      await expect(service.getProgress('missing')).rejects.toThrow(/User not found/);
    });

    it('caps progressPercent at 100', async () => {
      userRepo.findOneBy.mockResolvedValueOnce({ id: 'u1', dailyGoal: 50 });
      const xpQb: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ totalXp: '500' }),
      };
      const existsQb: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getExists: jest.fn().mockResolvedValue(false),
      };
      attemptRepo.createQueryBuilder.mockReturnValueOnce(xpQb);
      attemptRepo.createQueryBuilder.mockReturnValue(existsQb);
      const out = await service.getProgress('u1');
      expect(out.progressPercent).toBe(100);
      expect(out.dailyXp).toBe(500);
    });

    it('returns dailyXp 0 when no attempts', async () => {
      userRepo.findOneBy.mockResolvedValueOnce({ id: 'u1', dailyGoal: 50 });
      const xpQb: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ totalXp: '0' }),
      };
      const existsQb: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getExists: jest.fn().mockResolvedValue(false),
      };
      attemptRepo.createQueryBuilder.mockReturnValueOnce(xpQb);
      attemptRepo.createQueryBuilder.mockReturnValue(existsQb);
      const out = await service.getProgress('u1');
      expect(out.dailyXp).toBe(0);
      expect(out.currentStreak).toBe(0);
    });
  });

  describe('getLevelProgress', () => {
    it('returns empty when no lessons in level', async () => {
      lessonRepo.find.mockResolvedValueOnce([]);
      expect(await service.getLevelProgress('u1', 'lvl-1')).toEqual([]);
    });

    it('queries lessonProgress by lessonId IN list', async () => {
      lessonRepo.find.mockResolvedValueOnce([{ id: 'L1' }, { id: 'L2' }]);
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 'lp1' }]),
      };
      lessonProgressRepo.createQueryBuilder = jest.fn().mockReturnValueOnce(qb);
      const out = await service.getLevelProgress('u1', 'lvl-1');
      expect(out).toHaveLength(1);
      expect(qb.andWhere).toHaveBeenCalledWith(
        'lp.lesson_id IN (:...lessonIds)',
        { lessonIds: ['L1', 'L2'] },
      );
    });
  });

  describe('getRecommendedLessons', () => {
    it('returns empty when no lessons exist', async () => {
      lessonRepo.find.mockResolvedValueOnce([]);
      expect(await service.getRecommendedLessons('u1')).toEqual([]);
    });

    it('skips lessons with no vocabularies', async () => {
      lessonRepo.find.mockResolvedValueOnce([
        { id: 'L1', title: 'A' },
      ]);
      const contentQb: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      contentRepo.createQueryBuilder.mockReturnValueOnce(contentQb);
      expect(await service.getRecommendedLessons('u1')).toEqual([]);
    });

    it('computes percent per lesson and sorts lowest first', async () => {
      lessonRepo.find.mockResolvedValueOnce([
        { id: 'L1', title: 'A' },
        { id: 'L2', title: 'B' },
      ]);
      const contentQb: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { lessonId: 'L1', vocabularyId: 'v1' },
          { lessonId: 'L1', vocabularyId: 'v2' },
          { lessonId: 'L2', vocabularyId: 'v3' },
          { lessonId: 'L2', vocabularyId: 'v4' },
        ]),
      };
      const progressQb: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { vocabularyId: 'v1', masteryLevel: 3 },
          { vocabularyId: 'v3', masteryLevel: 4 },
          { vocabularyId: 'v4', masteryLevel: 2 },
        ]),
      };
      contentRepo.createQueryBuilder.mockReturnValueOnce(contentQb);
      progressRepo.createQueryBuilder.mockReturnValueOnce(progressQb);
      const out = await service.getRecommendedLessons('u1', 5);
      expect(out).toHaveLength(2);
      expect(out[0].id).toBe('L1');
      expect(out[0].progress).toBe(50);
      expect(out[1].id).toBe('L2');
      expect(out[1].progress).toBe(100);
    });
  });

  describe('recordActivity', () => {
    it('skips when lastActivityDate is today', async () => {
      const today = new Date().toISOString().split('T')[0];
      const user: any = { id: 'u1', lastActivityDate: today, currentStreak: 3 };
      userRepo.findOneBy.mockResolvedValueOnce(user);
      await service.recordActivity('u1');
      expect(userRepo.save).not.toHaveBeenCalled();
    });

    it('increments streak when lastActivityDate is yesterday', async () => {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
      const user: any = { id: 'u1', lastActivityDate: yesterday, currentStreak: 3 };
      userRepo.findOneBy.mockResolvedValueOnce(user);
      await service.recordActivity('u1');
      expect(user.currentStreak).toBe(4);
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('resets streak to 1 when lastActivityDate older than yesterday', async () => {
      const user: any = { id: 'u1', lastActivityDate: '2000-01-01', currentStreak: 99 };
      userRepo.findOneBy.mockResolvedValueOnce(user);
      await service.recordActivity('u1');
      expect(user.currentStreak).toBe(1);
    });

    it('silently returns when user is missing', async () => {
      userRepo.findOneBy.mockResolvedValueOnce(null);
      await expect(service.recordActivity('missing')).resolves.toBeUndefined();
    });
  });
});
