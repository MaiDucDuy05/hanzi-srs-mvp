import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentStatus1786677239767 implements MigrationInterface {
    name = 'AddContentStatus1786677239767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practice_questions" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "vocabularies" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "topics" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "is_active" boolean NOT NULL DEFAULT true`);
        
        // Add hsk_levels_status_enum only if it doesn't exist
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hsk_levels_status_enum') THEN
                    CREATE TYPE "public"."hsk_levels_status_enum" AS ENUM('DRAFT', 'PUBLISHED', 'HIDDEN');
                END IF;
            END$$;
        `);
        
        // Add status column to hsk_levels
        await queryRunner.query(`ALTER TABLE "hsk_levels" ADD COLUMN IF NOT EXISTS "status" "public"."hsk_levels_status_enum" NOT NULL DEFAULT 'DRAFT'`);
        await queryRunner.query(`ALTER TABLE "hsk_levels" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "grammar_points" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grammar_points" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "hsk_levels" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "hsk_levels" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "topics" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "vocabularies" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "practice_questions" DROP COLUMN "is_active"`);
    }

}
