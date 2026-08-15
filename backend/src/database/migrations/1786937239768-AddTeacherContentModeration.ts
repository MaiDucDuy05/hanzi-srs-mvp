import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeacherContentModeration1786937239768 implements MigrationInterface {
    name = 'AddTeacherContentModeration1786937239768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add to practice_questions
        await queryRunner.query(`ALTER TABLE "practice_questions" ADD COLUMN IF NOT EXISTS "hidden_by_admin" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "practice_questions" ADD COLUMN IF NOT EXISTS "hide_reason" text`);
        await queryRunner.query(`ALTER TABLE "practice_questions" ADD COLUMN IF NOT EXISTS "hidden_at" timestamptz`);

        // Add to tests
        await queryRunner.query(`ALTER TABLE "tests" ADD COLUMN IF NOT EXISTS "hidden_by_admin" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tests" ADD COLUMN IF NOT EXISTS "hide_reason" text`);
        await queryRunner.query(`ALTER TABLE "tests" ADD COLUMN IF NOT EXISTS "hidden_at" timestamptz`);

        // Add to resources
        await queryRunner.query(`ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "hidden_by_admin" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "hide_reason" text`);
        await queryRunner.query(`ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "hidden_at" timestamptz`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove from resources
        await queryRunner.query(`ALTER TABLE "resources" DROP COLUMN IF EXISTS "hidden_at"`);
        await queryRunner.query(`ALTER TABLE "resources" DROP COLUMN IF EXISTS "hide_reason"`);
        await queryRunner.query(`ALTER TABLE "resources" DROP COLUMN IF EXISTS "hidden_by_admin"`);

        // Remove from tests
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN IF EXISTS "hidden_at"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN IF EXISTS "hide_reason"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN IF EXISTS "hidden_by_admin"`);

        // Remove from practice_questions
        await queryRunner.query(`ALTER TABLE "practice_questions" DROP COLUMN IF EXISTS "hidden_at"`);
        await queryRunner.query(`ALTER TABLE "practice_questions" DROP COLUMN IF EXISTS "hide_reason"`);
        await queryRunner.query(`ALTER TABLE "practice_questions" DROP COLUMN IF EXISTS "hidden_by_admin"`);
    }
}
