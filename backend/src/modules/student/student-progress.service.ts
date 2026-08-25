import { Injectable } from '@nestjs/common';
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
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await this.attemptRepo
      .createQueryBuilder('pa')
      .select('COALESCE(SUM(pa.score), 0)', 'totalXp')
      .where('pa.user_id = :userId', { userId })
      .andWhere('pa.status = :status', {
        status: PracticeAttemptStatus.COMPLETED,
      })
      .andWhere('pa.created_at >= :today', { today })
      .getRawOne<{ totalXp: string }>();

    const dailyXp = parseInt(result?.totalXp ?? '0', 10);
    const dailyGoal = user.dailyGoal || 50;
    const progressPercent = Math.min(
      Math.round((dailyXp / dailyGoal) * 100),
      100,
    );

    const streak = await this.calculateStreak(userId);

    return { dailyXp, dailyGoal, progressPercent, currentStreak: streak };
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

  /**
   * Trả về các bài học được recommend cho user, sắp xếp theo tiến độ tăng dần.
   * Tiến độ = tỷ lệ từ vựng đã đạt mastery_level >= 2 / tổng số từ vựng trong bài.
   */
  async getRecommendedLessons(
    userId: string,
    limit = 3,
  ): Promise<LessonProgressItem[]> {
    // Get all published lessons
    const lessons = await this.lessonRepo.find({
      where: { status: 'PUBLISHED' as Lesson['status'] },
      order: { displayOrder: 'ASC' as const },
      take: 20,
    });

    if (lessons.length === 0) return [];

    const lessonIds = lessons.map((l) => l.id);

    // Get all lesson → vocab mappings (VOCABULARY only)
    const contents = await this.contentRepo
      .createQueryBuilder('lc')
      .select('lc.lesson_id', 'lessonId')
      .addSelect('lc.content_id', 'vocabularyId')
      .where('lc.lesson_id IN (:...ids)', { ids: lessonIds })
      .andWhere('lc.content_type = :type', { type: ContentType.VOCABULARY })
      .getRawMany<{ lessonId: string; vocabularyId: string }>();

    // Group vocabIds by lesson
    const vocabMap = new Map<string, string[]>();
    for (const c of contents) {
      if (!vocabMap.has(c.lessonId)) vocabMap.set(c.lessonId, []);
      vocabMap.get(c.lessonId)!.push(c.vocabularyId);
    }

    const allVocabIds = [...new Set(contents.map((c) => c.vocabularyId))];

    // Get user's progress for all those vocabularies
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
      .filter((l): l is LessonProgressItem => l !== null)
      .sort((a, b) => a.progress - b.progress) // lowest progress first = most recommended
      .slice(0, limit);

    return lessonProgress;
  }

  private async calculateStreak(userId: string): Promise<number> {
    const today = new Date();
    
    // Check today
    const hasActivityToday = await this.hasActivityOnDate(userId, today);
    let streak = 0;
    let cursor = new Date(today);

    if (hasActivityToday) {
      streak = 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // If no activity today, check yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const hasActivityYesterday = await this.hasActivityOnDate(userId, yesterday);
      
      if (hasActivityYesterday) {
        streak = 1;
        cursor = yesterday;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        // Neither today nor yesterday has activity -> streak is 0
        return 0;
      }
    }

    // Loop backwards from cursor to count continuous streak
    while (true) {
      const hasActivity = await this.hasActivityOnDate(userId, cursor);
      if (!hasActivity) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  private async hasActivityOnDate(userId: string, date: Date): Promise<boolean> {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return await this.attemptRepo
      .createQueryBuilder('pa')
      .select('1')
      .where('pa.user_id = :userId', { userId })
      .andWhere('pa.status = :status', { status: PracticeAttemptStatus.COMPLETED })
      .andWhere('pa.created_at >= :start', { start: dayStart })
      .andWhere('pa.created_at <= :end', { end: dayEnd })
      .limit(1)
      .getExists();
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
