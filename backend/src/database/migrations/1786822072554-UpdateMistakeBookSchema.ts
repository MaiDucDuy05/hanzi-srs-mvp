import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMistakeBookSchema1786822072554 implements MigrationInterface {
    name = 'UpdateMistakeBookSchema1786822072554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mistake_book" ADD "question_id" uuid`);
        await queryRunner.query(`ALTER TABLE "mistake_book" ADD "vocabulary_id" uuid`);
        await queryRunner.query(`ALTER TABLE "mistake_book" ADD "fail_count" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "mistake_book" ADD "correct_streak" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "mistake_book" ADD "last_failed_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "mistake_book" ADD "last_reviewed_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mistake_book" DROP COLUMN "last_reviewed_at"`);
        await queryRunner.query(`ALTER TABLE "mistake_book" DROP COLUMN "last_failed_at"`);
        await queryRunner.query(`ALTER TABLE "mistake_book" DROP COLUMN "correct_streak"`);
        await queryRunner.query(`ALTER TABLE "mistake_book" DROP COLUMN "fail_count"`);
        await queryRunner.query(`ALTER TABLE "mistake_book" DROP COLUMN "vocabulary_id"`);
        await queryRunner.query(`ALTER TABLE "mistake_book" DROP COLUMN "question_id"`);
    }

}
