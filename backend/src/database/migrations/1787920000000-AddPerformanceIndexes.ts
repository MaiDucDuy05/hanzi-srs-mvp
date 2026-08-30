import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Thêm composite indexes để tăng tốc các query nặng dưới tải cao:
 *
 * 1. lesson_contents(lesson_id, content_type) — getRecommendedLessons() filter by lesson + type
 * 2. practice_attempts(user_id, status, created_at) — getProgress() dailyXp aggregation
 * 3. user_lesson_progress(user_id, lesson_id) — getLessonProgress() upsert lookup
 */
export class AddPerformanceIndexes1787920000000 implements MigrationInterface {
  name = 'AddPerformanceIndexes1787920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index 1: lesson_contents(lesson_id, content_type)
    // Dùng trong getRecommendedLessons(): WHERE lesson_id IN (...) AND content_type = 'VOCABULARY'
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_lesson_contents_lesson_type"
       ON "lesson_contents" ("lesson_id", "content_type")`,
    );

    // Index 2: practice_attempts(user_id, status, created_at DESC)
    // Dùng trong getProgress(): WHERE user_id + status=COMPLETED + created_at >= today
    // Cải thiện cả dailyXp aggregation lẫn calculateStreak()
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_practice_attempts_user_status_created"
       ON "practice_attempts" ("user_id", "status", "created_at" DESC)`,
    );

    // Index 3: user_lesson_progress(user_id, lesson_id)
    // Dùng trong getLessonProgress(): findOneBy({userId, lessonId}) — hot path của markVocabCompleted
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_user_lesson_progress_user_lesson"
       ON "user_lesson_progress" ("user_id", "lesson_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_lesson_contents_lesson_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_practice_attempts_user_status_created"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_user_lesson_progress_user_lesson"`,
    );
  }
}
