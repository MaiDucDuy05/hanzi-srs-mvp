import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration 002 — Study lesson + SRS + vocab extra fields.
 *
 * Changes:
 * 1. ALTER vocabularies: +part_of_speech, +example
 * 2. CREATE user_vocabulary_progress: SRS mastery tracking per user/vocab (SM-2)
 */
export class StudyLessonSrs002 implements MigrationInterface {
  name = 'StudyLessonSrs002';

  public async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE vocabularies
        ADD COLUMN part_of_speech varchar(30),
        ADD COLUMN example text;
    `);

    await qr.query(`
      CREATE TABLE user_vocabulary_progress (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vocabulary_id uuid NOT NULL REFERENCES vocabularies(id) ON DELETE CASCADE,
        mastery_level int NOT NULL DEFAULT 0,
        review_count int NOT NULL DEFAULT 0,
        easiness_factor numeric(3,2) NOT NULL DEFAULT 2.50,
        interval_days int NOT NULL DEFAULT 0,
        next_review_at timestamptz NOT NULL DEFAULT now(),
        last_reviewed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_user_vocab_progress UNIQUE (user_id, vocabulary_id),
        CONSTRAINT chk_mastery_level CHECK (mastery_level BETWEEN 0 AND 4),
        CONSTRAINT chk_ef CHECK (easiness_factor >= 1.3 AND easiness_factor <= 2.6)
      );
      CREATE INDEX idx_progress_user_next_review ON user_vocabulary_progress (user_id, next_review_at);
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS user_vocabulary_progress`);
    await qr.query(`
      ALTER TABLE vocabularies
        DROP COLUMN IF EXISTS part_of_speech,
        DROP COLUMN IF EXISTS example;
    `);
  }
}
