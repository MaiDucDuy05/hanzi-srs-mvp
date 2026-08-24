import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtToPracticeAttempt1787600223048 implements MigrationInterface {
    name = 'AddDeletedAtToPracticeAttempt1787600223048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."uq_practice_attempts_idem"`);
        await queryRunner.query(`ALTER TABLE "practice_attempts" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "practice_attempts" DROP CONSTRAINT "PK_0ae13205d3b8c8b125fdd284cb0"`);
        await queryRunner.query(`ALTER TABLE "practice_attempts" ADD CONSTRAINT "PK_bd0c430fd839b52e401242f6d37" PRIMARY KEY ("id", "created_at")`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT '2.5'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_practice_attempts_idem" ON "practice_attempts" ("user_id", "idempotency_key", "created_at") WHERE idempotency_key IS NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."uq_practice_attempts_idem"`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT 2.5`);
        await queryRunner.query(`ALTER TABLE "practice_attempts" DROP CONSTRAINT "PK_bd0c430fd839b52e401242f6d37"`);
        await queryRunner.query(`ALTER TABLE "practice_attempts" ADD CONSTRAINT "PK_0ae13205d3b8c8b125fdd284cb0" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "practice_attempts" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_practice_attempts_idem" ON "practice_attempts" ("user_id", "idempotency_key") WHERE (idempotency_key IS NOT NULL)`);
    }

}
