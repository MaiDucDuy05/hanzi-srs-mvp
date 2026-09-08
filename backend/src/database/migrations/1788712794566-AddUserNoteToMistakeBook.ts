import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserNoteToMistakeBook1788712794566 implements MigrationInterface {
    name = 'AddUserNoteToMistakeBook1788712794566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_tests_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_test_attempts_test"`);
        await queryRunner.query(`DROP INDEX "public"."idx_test_attempts_user"`);
        await queryRunner.query(`DROP INDEX "public"."idx_test_questions_question"`);
        await queryRunner.query(`DROP INDEX "public"."idx_test_questions_test"`);
        await queryRunner.query(`DROP INDEX "public"."idx_lessons_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_prac_q_lesson"`);
        await queryRunner.query(`DROP INDEX "public"."idx_prac_q_topic"`);
        await queryRunner.query(`DROP INDEX "public"."idx_prac_q_type_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_courses_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_course_lessons_lesson"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_activities_user_type"`);
        await queryRunner.query(`ALTER TABLE "mistake_book" ADD "user_note" text`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT '2.5'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT 2.5`);
        await queryRunner.query(`ALTER TABLE "mistake_book" DROP COLUMN "user_note"`);
        await queryRunner.query(`CREATE INDEX "idx_user_activities_user_type" ON "user_activities" ("user_id", "activity_type") `);
        await queryRunner.query(`CREATE INDEX "idx_course_lessons_lesson" ON "course_lessons" ("lesson_id") `);
        await queryRunner.query(`CREATE INDEX "idx_courses_status" ON "courses" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_prac_q_type_status" ON "practice_questions" ("question_type", "status") `);
        await queryRunner.query(`CREATE INDEX "idx_prac_q_topic" ON "practice_questions" ("topic_id") `);
        await queryRunner.query(`CREATE INDEX "idx_prac_q_lesson" ON "practice_questions" ("lesson_id") `);
        await queryRunner.query(`CREATE INDEX "idx_lessons_status" ON "lessons" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_test_questions_test" ON "test_questions" ("test_id") `);
        await queryRunner.query(`CREATE INDEX "idx_test_questions_question" ON "test_questions" ("question_id") `);
        await queryRunner.query(`CREATE INDEX "idx_test_attempts_user" ON "test_attempts" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_test_attempts_test" ON "test_attempts" ("test_id") `);
        await queryRunner.query(`CREATE INDEX "idx_tests_status" ON "tests" ("status") `);
    }

}
