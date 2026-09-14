import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionDisplayOrder1789400252900 implements MigrationInterface {
    name = 'AddQuestionDisplayOrder1789400252900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" ADD "display_order" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT '2.5'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT 2.5`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "display_order"`);
    }

}
