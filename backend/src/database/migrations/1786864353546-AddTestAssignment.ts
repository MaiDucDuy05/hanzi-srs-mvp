import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestAssignment1786864353546 implements MigrationInterface {
    name = 'AddTestAssignment1786864353546'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "test_assignments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "test_id" uuid NOT NULL, "classroom_id" uuid, "student_id" uuid, "start_time" TIMESTAMP WITH TIME ZONE NOT NULL, "end_time" TIMESTAMP WITH TIME ZONE NOT NULL, "assigned_by" uuid NOT NULL, CONSTRAINT "PK_b8a92d56c8f2b7535717c55ad0e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tests" ADD "hsk_level" integer`);
        await queryRunner.query(`ALTER TABLE "tests" ADD "shuffle_questions" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "tests" ADD "show_answers_after" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD "assignment_id" uuid`);

        await queryRunner.query(`ALTER TABLE "test_assignments" ADD CONSTRAINT "FK_106045d8b83af4f385f92de5857" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_assignments" ADD CONSTRAINT "FK_dec34634737b219935f5204b4a9" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_assignments" ADD CONSTRAINT "FK_ff3a6281944a887b6b77c4b6578" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD CONSTRAINT "FK_a63b0ea3d44e060cae7dd918773" FOREIGN KEY ("assignment_id") REFERENCES "test_assignments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP CONSTRAINT "FK_a63b0ea3d44e060cae7dd918773"`);
        await queryRunner.query(`ALTER TABLE "test_assignments" DROP CONSTRAINT "FK_ff3a6281944a887b6b77c4b6578"`);
        await queryRunner.query(`ALTER TABLE "test_assignments" DROP CONSTRAINT "FK_dec34634737b219935f5204b4a9"`);
        await queryRunner.query(`ALTER TABLE "test_assignments" DROP CONSTRAINT "FK_106045d8b83af4f385f92de5857"`);

        await queryRunner.query(`ALTER TABLE "test_attempts" DROP COLUMN "assignment_id"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "show_answers_after"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "shuffle_questions"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "hsk_level"`);
        await queryRunner.query(`DROP TABLE "test_assignments"`);
    }

}
