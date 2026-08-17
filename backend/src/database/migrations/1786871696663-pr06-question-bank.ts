import { MigrationInterface, QueryRunner } from "typeorm";

export class Pr06QuestionBank1786871696663 implements MigrationInterface {
    name = 'Pr06QuestionBank1786871696663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "creator_id" uuid NOT NULL, "type" character varying(20) NOT NULL, "visibility" character varying(20) NOT NULL DEFAULT 'PRIVATE', "hsk_level" integer, "lesson_id" uuid, "difficulty" character varying(20) NOT NULL DEFAULT 'MEDIUM', "content" jsonb NOT NULL, "explanation" text, "tags" text array, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_639aedf3c20845210592b370893" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_639aedf3c20845210592b370893"`);
        await queryRunner.query(`DROP TABLE "questions"`);
    }

}
