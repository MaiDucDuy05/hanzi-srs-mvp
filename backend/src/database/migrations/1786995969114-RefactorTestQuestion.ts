import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorTestQuestion1786995969114 implements MigrationInterface {
    name = 'RefactorTestQuestion1786995969114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE "test_answers", "test_questions" CASCADE`);
        await queryRunner.query(`ALTER TABLE "test_questions" DROP COLUMN "options"`);
        await queryRunner.query(`ALTER TABLE "test_questions" DROP COLUMN "correct_answer"`);
        await queryRunner.query(`ALTER TABLE "test_questions" DROP COLUMN "question_type"`);
        await queryRunner.query(`ALTER TABLE "test_questions" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "test_questions" ADD "question_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "test_questions" ADD CONSTRAINT "FK_275f99133c07faa04deeda6e489" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_questions" DROP CONSTRAINT "FK_275f99133c07faa04deeda6e489"`);
        await queryRunner.query(`ALTER TABLE "test_questions" DROP COLUMN "question_id"`);
        await queryRunner.query(`ALTER TABLE "test_questions" ADD "content" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "test_questions" ADD "question_type" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "test_questions" ADD "correct_answer" jsonb`);
        await queryRunner.query(`ALTER TABLE "test_questions" ADD "options" jsonb`);
    }
}
