import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { PracticeAttempt } from '../practice/entities/practice-attempt.entity';
import { Lesson } from '../curriculum/entities/lesson.entity';
import { LessonContent } from '../curriculum/entities/lesson-content.entity';
import { UserVocabularyProgress } from '../srs/entities/user-vocabulary-progress.entity';
import { UserLessonProgress } from './entities/user-lesson-progress.entity';
import { PracticeAttemptStatus } from '../../common/enums/practice.enums';
import { ContentType } from '../../common/enums/curriculum.enums';

export interface StudentProgress {
  dailyXp: number;
  dailyGoal: number;
  progressPercent: number;
  currentStreak: number;
}

export interface LessonProgressItem {
  id: string;
  title: string;
  progress: number; // 0-100
}

@Injectable()
export class StudentProgressService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(PracticeAttempt)
    private attemptRepo: Repository<PracticeAttempt>,
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonContent)
    private contentRepo: Repository<LessonContent>,
    @InjectRepository(UserVocabularyProgress)
    private progressRepo: Repository<UserVocabularyProgress>,
    @InjectRepository(UserLessonProgress)
    private lessonProgressRepo: Repository<UserLessonProgress>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getLessonProgress(userId: string, lessonId: string) {
    let progress = await this.lessonProgressRepo.findOneBy({ userId, lessonId });
    if (!progress) {
      progress = this.lessonProgressRepo.create({
        userId,
        lessonId,
      });
      await this.lessonProgressRepo.save(progress);
    }
    return progress;
  }

  async markVocabCompleted(userId: string, lessonId: string) {
    const progress = await this.getLessonProgress(userId, lessonId);
    progress.vocabCompleted = true;
    if (progress.grammarCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }
    return this.lessonProgressRepo.save(progress);
  }

  async markGrammarCompleted(userId: string, lessonId: string) {
    const progress = await this.getLessonProgress(userId, lessonId);
    progress.grammarCompleted = true;
    if (progress.vocabCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }
    return this.lessonProgressRepo.save(progress);
  }

  async getProgress(userId: string): Promise<StudentProgress> {
    // Check cache TRƯỚC khi query bất kỳ DB nào — tránh user lookup thừa khi cache warm.
    const cacheKey = `student_progress:${userId}`;
    const cached = await this.cacheManager.get<StudentProgress>(cacheKey);
    if (cached) return cached;

    // Cache miss: fetch user và aggregate song song để giảm latency.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [user, result] = await Promise.all([
      this.userRepo.findOneBy({ id: userId }),
      this.attemptRepo
        .createQueryBuilder('pa')
        .select('COALESCE(SUM(pa.score), 0)', 'totalXp')
        .where('pa.user_id = :userId', { userId })
        .andWhere('pa.status = :status', {
          status: PracticeAttemptStatus.COMPLETED,
        })
        .andWhere('pa.created_at >= :today', { today })
        .getRawOne<{ totalXp: string }>(),
    ]);

    if (!user) {
      throw new Error('User not found');
    }

    const dailyXp = parseInt(result?.totalXp ?? '0', 10);
    const dailyGoal = user.dailyGoal || 50;
    const progressPercent = Math.min(
      Math.round((dailyXp / dailyGoal) * 100),
      100,
    );

    // Dùng currentStreak đã lưu trên user — không gọi lại DB.
    // recordActivity() cập nhật field này mỗi khi user hoạt động.
    const streak = user.currentStreak ?? 0;

    const progress: StudentProgress = { dailyXp, dailyGoal, progressPercent, currentStreak: streak };
    await this.cacheManager.set(cacheKey, progress, 120_000); // cache 2 phút — giảm stampede tần suất
    return progress;
  }

  async getLevelProgress(userId: string, levelId: string) {
    const lessons = await this.lessonRepo.find({
      where: { levelId, status: 'PUBLISHED' as any },
      select: ['id'],
    });
    const lessonIds = lessons.map(l => l.id);
    if (!lessonIds.length) return [];
    
    return this.lessonProgressRepo
      .createQueryBuilder('lp')
      .where('lp.user_id = :userId', { userId })
      .andWhere('lp.lesson_id IN (:...lessonIds)', { lessonIds })
      .getMany();
  }

  private async getGlobalLessonsAndVocabs(): Promise<{
    lessons: Lesson[];
    vocabMap: Map<string, string[]>;
    allVocabIds: string[];
  }> {
    const CACHE_KEY = 'global_lessons_vocab_map';
    const cached = await this.cacheManager.get<{
      lessons: Lesson[];
      vocabMapData: [string, string[]][];
      allVocabIds: string[];
    }>(CACHE_KEY);

    if (cached) {
      return {
        lessons: cached.lessons,
        vocabMap: new Map(cached.vocabMapData),
        allVocabIds: cached.allVocabIds,
      };
    }

    const lessons = await this.lessonRepo.find({
      where: { status: 'PUBLISHED' as Lesson['status'] },
      order: { displayOrder: 'ASC' as const },
      take: 20,
    });

    const vocabMap = new Map<string, string[]>();
    let allVocabIds: string[] = [];

    if (lessons.length > 0) {
      const lessonIds = lessons.map((l) => l.id);
      const contents = await this.contentRepo
        .createQueryBuilder('lc')
        .select('lc.lesson_id', 'lessonId')
        .addSelect('lc.content_id', 'vocabularyId')
        .where('lc.lesson_id IN (:...ids)', { ids: lessonIds })
        .andWhere('lc.content_type = :type', { type: ContentType.VOCABULARY })
        .getRawMany<{ lessonId: string; vocabularyId: string }>();

      for (const c of contents) {
        if (!vocabMap.has(c.lessonId)) vocabMap.set(c.lessonId, []);
        vocabMap.get(c.lessonId)!.push(c.vocabularyId);
      }
      allVocabIds = [...new Set(contents.map((c) => c.vocabularyId))];
    }

    await this.cacheManager.set(
      CACHE_KEY,
      {
        lessons,
        vocabMapData: Array.from(vocabMap.entries()),
        allVocabIds,
      },
      3600_000,
    );

    return { lessons, vocabMap, allVocabIds };
  }

  /**
   * Trả về các bài học được recommend cho user, sắp xếp theo tiến độ tăng dần.
   * Tiến độ = tỷ lệ từ vựng đã đạt mastery_level >= 2 / tổng số từ vựng trong bài.
   */
  async getRecommendedLessons(
    userId: string,
    limit = 3,
  ): Promise<LessonProgressItem[]> {
    const cacheKey = `recommended_lessons:${userId}`;
    const cached = await this.cacheManager.get<LessonProgressItem[]>(cacheKey);
    if (cached) return cached;

    // Tối ưu: Load danh sách bài học và từ vựng từ Global Cache, tránh 500 VUs query cùng 1 dữ liệu tĩnh
    const { lessons, vocabMap, allVocabIds } = await this.getGlobalLessonsAndVocabs();

    if (lessons.length === 0) return [];

    // Lấy tiến độ của RIÊNG user đó (Personalized query)
    const progressMap = new Map<string, number>();
    if (allVocabIds.length > 0) {
      const progressRows = await this.progressRepo
        .createQueryBuilder('vp')
        .select('vp.vocabulary_id', 'vocabularyId')
        .addSelect('vp.mastery_level', 'masteryLevel')
        .where('vp.user_id = :userId', { userId })
        .andWhere('vp.vocabulary_id IN (:...ids)', { ids: allVocabIds })
        .getRawMany<{ vocabularyId: string; masteryLevel: number }>();

      for (const row of progressRows) {
        progressMap.set(row.vocabularyId, Number(row.masteryLevel));
      }
    }

    // Calculate progress per lesson
    const lessonProgress: LessonProgressItem[] = lessons
      .map((lesson) => {
        const vocabIds = vocabMap.get(lesson.id) ?? [];
        if (vocabIds.length === 0) return null;
        const masteredCount = vocabIds.filter(
          (vid) => (progressMap.get(vid) ?? 0) >= 2,
        ).length;
        return {
          id: lesson.id,
          title: lesson.title,
          progress: Math.round((masteredCount / vocabIds.length) * 100),
        };
      })
      .filter((l): l is LessonProgressItem => l !== null);

    // Sort by progress ascending, so user focuses on uncompleted lessons
    const recommended = lessonProgress.sort((a, b) => a.progress - b.progress).slice(0, limit);
    await this.cacheManager.set(cacheKey, recommended, 300_000); // cache 5 phút
    return recommended;
  }


  async recordActivity(userId: string): Promise<void> {
    const today = this.toDateStr(new Date());
    const yesterday = this.toDateStr(new Date(Date.now() - 86_400_000));
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) return;

    const lastDate = user.lastActivityDate;

    if (lastDate === today) {
      return;
    }

    if (lastDate === yesterday) {
      user.currentStreak += 1;
    } else if (!lastDate || lastDate < yesterday) {
      user.currentStreak = 1;
    }

    user.lastActivityDate = today;
    await this.userRepo.save(user);
  }

  private toDateStr(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
