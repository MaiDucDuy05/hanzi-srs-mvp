import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueCodeToHskLevels1787137274547 implements MigrationInterface {
    name = 'AddUniqueCodeToHskLevels1787137274547'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "hsk_levels" ADD CONSTRAINT "UQ_c9f72266eac80d754f29657b3f5" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT '2.5'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT 2.5`);
        await queryRunner.query(`ALTER TABLE "hsk_levels" DROP CONSTRAINT "UQ_c9f72266eac80d754f29657b3f5"`);
    }

}
