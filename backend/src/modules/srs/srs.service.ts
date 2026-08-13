/**
 * SrsService — SM-2 spaced repetition algorithm.
 *
 * Rating → SM-2 mapping:
 *   AGAIN (q=0): reset interval, decrease mastery
 *   HARD  (q=3): interval *= 1.2, EF -= 0.15
 *   GOOD  (q=4): interval *= EF, EF += 0.1, increase mastery
 *   EASY  (q=5): interval *= EF * 1.3, EF += 0.3, increase mastery
 *
 * EF is bounded [1.3, 2.6]; masteryLevel is bounded [0, 4].
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserVocabularyProgress } from './entities/user-vocabulary-progress.entity';
import { LessonContent } from '../curriculum/entities/lesson-content.entity';
import { Vocabulary } from '../curriculum/entities/vocabulary.entity';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { SubmitReviewDto, SrsRating, UserVocabProgressDto } from './dto/srs.dto';

@Injectable()
export class SrsService {
  constructor(
    @InjectRepository(UserVocabularyProgress)
    private progressRepo: Repository<UserVocabularyProgress>,
    @InjectRepository(LessonContent)
    private contentRepo: Repository<LessonContent>,
    @InjectRepository(Vocabulary)
    private vocabRepo: Repository<Vocabulary>,
    @InjectRepository(TopicVocabulary)
    private topicVocabRepo: Repository<TopicVocabulary>,
  ) {}

  /**
   * Xử lý một lần review — upsert progress row + SM-2 update.
   * @param userId từ JWT (authenticated)
   */
  async submitReview(
    userId: string,
    dto: SubmitReviewDto,
  ): Promise<UserVocabularyProgress> {
    let progress = await this.progressRepo.findOne({
      where: { userId, vocabularyId: dto.vocabularyId },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        userId,
        vocabularyId: dto.vocabularyId,
        masteryLevel: 0,
        reviewCount: 0,
        easinessFactor: 2.5,
        intervalDays: 0,
        nextReviewAt: new Date(),
        lastReviewedAt: null,
      });
    }

    this.applySm2(progress, dto.rating);
    progress.reviewCount += 1;
    progress.lastReviewedAt = new Date();
    return this.progressRepo.save(progress);
  }

  /**
   * Lấy progress map cho user trong một lesson / level / topic.
   * @param userId — user từ JWT
   * @param lessonId — bài học cụ thể (optional)
   * @param levelId — cấp độ HSK (optional)
   * @param topicId — chủ đề (optional)
   * @returns Map<vocabularyId, progress>
   */
  async getProgress(
    userId: string,
    lessonId?: string,
    levelId?: string,
    topicId?: string,
  ): Promise<Map<string, UserVocabProgressDto>> {
    let vocabIds: string[] = [];

    if (lessonId) {
      // Vocabularies from lesson content
      const contents = await this.contentRepo.find({
        where: { lessonId },
      });
      vocabIds = contents
        .filter((c) => c.contentType === 'VOCABULARY')
        .map((c) => c.contentId);
    } else if (levelId) {
      // All vocabularies for an HSK level
      const vocabs = await this.vocabRepo.find({ where: { levelId } });
      vocabIds = vocabs.map((v) => v.id);
    } else if (topicId) {
      // Vocabularies belonging to a topic via join table
      const topicVocabs = await this.topicVocabRepo.find({
        where: { topicId },
        relations: ['vocabulary'],
      });
      vocabIds = topicVocabs.map((tv) => tv.vocabularyId);
    }

    if (vocabIds.length === 0) return new Map();

    const progressRows = await this.progressRepo.find({
      where: { userId, vocabularyId: In(vocabIds) },
    });

    const map = new Map<string, UserVocabProgressDto>();
    for (const row of progressRows) {
      map.set(row.vocabularyId, {
        vocabularyId: row.vocabularyId,
        masteryLevel: row.masteryLevel,
        nextReviewAt: row.nextReviewAt?.toISOString() ?? null,
        lastReviewedAt: row.lastReviewedAt?.toISOString() ?? null,
        reviewCount: row.reviewCount,
      });
    }
    return map;
  }

  /** @deprecated Use getProgress() directly with lessonId */
  async getProgressByLesson(userId: string, lessonId: string) {
    return this.getProgress(userId, lessonId);
  }

  /** SM-2: cập nhật mastery, interval, EF, nextReview. */
  private applySm2(progress: UserVocabularyProgress, rating: SrsRating): void {
    const q = ratingToQuality(rating);
    let ef = Number(progress.easinessFactor);
    let mastery = progress.masteryLevel;
    let interval = progress.intervalDays;

    if (q < 3) {
      // AGAIN: reset
      mastery = Math.max(0, mastery - 1);
      interval = 0;
    } else {
      // Recalculate EF for HARD/GOOD/EASY
      const newEf = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
      ef = Math.min(2.6, newEf);
      progress.easinessFactor = ef;

      if (interval === 0) {
        interval = 1;
      } else if (interval === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ef);
      }

      // Adjust interval based on rating
      if (rating === SrsRating.HARD) {
        interval = Math.max(1, Math.round(interval * 0.8));
      } else if (q >= 4) {
        mastery = Math.min(4, mastery + (q === 5 ? 2 : 1));
      }
    }

    progress.masteryLevel = mastery;
    progress.intervalDays = interval;
    progress.nextReviewAt = new Date(Date.now() + interval * 86_400_000);
  }
}

function ratingToQuality(rating: SrsRating): number {
  switch (rating) {
    case SrsRating.AGAIN: return 0;
    case SrsRating.HARD:  return 3;
    case SrsRating.GOOD:  return 4;
    case SrsRating.EASY:  return 5;
  }
}
