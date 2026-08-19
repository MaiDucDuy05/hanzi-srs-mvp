import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTopicIdToPracticeQuestions1786852129335 implements MigrationInterface {
    name = 'AddTopicIdToPracticeQuestions1786852129335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practice_questions" ADD "topic_id" uuid`);
        await queryRunner.query(`ALTER TABLE "practice_questions" ADD CONSTRAINT "practice_questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practice_questions" DROP CONSTRAINT "practice_questions_topic_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "practice_questions" DROP COLUMN "topic_id"`);
    }
}
