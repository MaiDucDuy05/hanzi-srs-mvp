import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserLessonProgress1787499824038 implements MigrationInterface {
    name = 'AddUserLessonProgress1787499824038'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_lesson_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "lesson_id" uuid NOT NULL, "vocab_completed" boolean NOT NULL DEFAULT false, "grammar_completed" boolean NOT NULL DEFAULT false, "is_completed" boolean NOT NULL DEFAULT false, "completed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ca7535b366966615043ad206d59" UNIQUE ("user_id", "lesson_id"), CONSTRAINT "PK_2d52c2d4b5f26e61b3169d3d01a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT '2.5'`);
        await queryRunner.query(`ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "FK_5ce08039490cd0e619ae9560519" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "FK_4427002dcf362d61def4791adee" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_lesson_progress" DROP CONSTRAINT "FK_4427002dcf362d61def4791adee"`);
        await queryRunner.query(`ALTER TABLE "user_lesson_progress" DROP CONSTRAINT "FK_5ce08039490cd0e619ae9560519"`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT 2.5`);
        await queryRunner.query(`DROP TABLE "user_lesson_progress"`);
    }

}
