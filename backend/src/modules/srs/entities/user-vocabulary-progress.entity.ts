import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/**
 * SRS progress tracking per user/vocabulary (SM-2 algorithm).
 * Uniqueness: (user_id, vocabulary_id).
 * Indexed by (user_id, next_review_at) for due-card queries.
 */
@Entity('user_vocabulary_progress')
@Unique(['userId', 'vocabularyId'])
export class UserVocabularyProgress extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'vocabulary_id', type: 'uuid' })
  vocabularyId: string;

  /** 0–4 (0=unseen, 1=new, 2=learning, 3=review, 4=mastered) */
  @Column({ name: 'mastery_level', type: 'int', default: 0 })
  masteryLevel: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  /** Easiness Factor — starts at 2.5, bounded [1.3, 2.6] */
  @Column({ name: 'easiness_factor', type: 'numeric', precision: 3, scale: 2, default: 2.5 })
  easinessFactor: number;

  /** Days until next review */
  @Column({ name: 'interval_days', type: 'int', default: 0 })
  intervalDays: number;

  @Column({ name: 'next_review_at', type: 'timestamptz', default: () => 'now()' })
  nextReviewAt: Date;

  @Column({ name: 'last_reviewed_at', type: 'timestamptz', nullable: true })
  lastReviewedAt: Date | null;
}
