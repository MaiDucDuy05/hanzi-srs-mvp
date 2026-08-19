import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusOnSubmitToTestAssignment1787083775714 implements MigrationInterface {
    name = 'AddStatusOnSubmitToTestAssignment1787083775714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_assignments" ADD "status_on_submit" character varying(20) NOT NULL DEFAULT 'GRADED'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_assignments" DROP COLUMN "status_on_submit"`);
    }
}
