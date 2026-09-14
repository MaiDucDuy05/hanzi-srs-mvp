import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionDeletedAt1789398514494 implements MigrationInterface {
    name = 'AddQuestionDeletedAt1789398514494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT '2.5'`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_5f4b1514be0b737b652d3f0bb93" FOREIGN KEY ("parent_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_5f4b1514be0b737b652d3f0bb93"`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT 2.5`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "deleted_at"`);
    }

}
