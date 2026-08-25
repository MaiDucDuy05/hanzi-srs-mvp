import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCoverImageKey1787509310078 implements MigrationInterface {
    name = 'AddCoverImageKey1787509310078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resources" ADD "cover_image_key" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT '2.5'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT 2.5`);
        await queryRunner.query(`ALTER TABLE "resources" DROP COLUMN "cover_image_key"`);
    }

}
