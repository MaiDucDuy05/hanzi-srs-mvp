import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add question source tracking to questions table.
 *
 * Keep practice_questions separate (stores question + answer together for self-study).
 * Add columns to questions table for unified question bank with source tracking.
 *
 * Changes:
 * 1. Add source_type column (PRACTICE/EXAM/BOTH) - default 'EXAM'
 * 2. Add topic_id column for curriculum binding
 * 3. Add question_type column for normalized type filtering
 * 4. Add admin moderation columns
 */
export class AddQuestionSourceTracking20260818060040 implements MigrationInterface {
  name = 'AddQuestionSourceTracking20260818060040';

  public async up(qr: QueryRunner): Promise<void> {
    // Step 1: Add new columns to questions table
    await qr.query(`
      ALTER TABLE "questions"
        ADD COLUMN IF NOT EXISTS "source_type" varchar(20) NOT NULL DEFAULT 'EXAM',
        ADD COLUMN IF NOT EXISTS "topic_id" uuid,
        ADD COLUMN IF NOT EXISTS "question_type" varchar(30),
        ADD COLUMN IF NOT EXISTS "hidden_by_admin" boolean NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "hide_reason" text,
        ADD COLUMN IF NOT EXISTS "hidden_at" timestamptz
    `);

    // Step 2: Add indexes
    await qr.query(`
      CREATE INDEX IF NOT EXISTS "idx_questions_source_type" ON "questions"("source_type")
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS "idx_questions_topic" ON "questions"("topic_id")
      WHERE "topic_id" IS NOT NULL
    `);
    await qr.query(`
      CREATE INDEX IF NOT EXISTS "idx_questions_hidden" ON "questions"("hidden_by_admin")
      WHERE "hidden_by_admin" = true
    `);

    // Step 3: Add constraints
    await qr.query(`
      ALTER TABLE "questions"
        ADD CONSTRAINT "chk_questions_source_type"
        CHECK ("source_type" IN ('PRACTICE', 'EXAM', 'BOTH'))
    `);

    // Step 4: Normalize question_type from type column
    await qr.query(`
      UPDATE "questions"
      SET "question_type" = "type"
      WHERE "question_type" IS NULL
    `);

    // Step 5: Update existing questions to have source_type = 'EXAM'
    await qr.query(`
      UPDATE "questions"
      SET "source_type" = 'EXAM'
      WHERE "source_type" IS NULL OR "source_type" = 'EXAM'
    `);

    // Step 6: Add FK constraint for topic_id if topics table exists
    await qr.query(`
      ALTER TABLE "questions"
        ADD CONSTRAINT "fk_questions_topic"
        FOREIGN KEY ("topic_id") REFERENCES "topics"("id")
        ON DELETE SET NULL
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    // Drop FK first
    await qr.query(`ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "fk_questions_topic"`);

    // Drop constraints
    await qr.query(`ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "chk_questions_source_type"`);

    // Drop indexes
    await qr.query(`DROP INDEX IF EXISTS "idx_questions_hidden"`);
    await qr.query(`DROP INDEX IF EXISTS "idx_questions_topic"`);
    await qr.query(`DROP INDEX IF EXISTS "idx_questions_source_type"`);

    // Drop columns
    await qr.query(`
      ALTER TABLE "questions"
        DROP COLUMN IF EXISTS "hidden_at",
        DROP COLUMN IF EXISTS "hide_reason",
        DROP COLUMN IF EXISTS "hidden_by_admin",
        DROP COLUMN IF EXISTS "question_type",
        DROP COLUMN IF EXISTS "topic_id",
        DROP COLUMN IF EXISTS "source_type"
    `);
  }
}
