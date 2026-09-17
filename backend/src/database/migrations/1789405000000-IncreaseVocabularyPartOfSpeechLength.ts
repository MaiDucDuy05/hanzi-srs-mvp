import { MigrationInterface, QueryRunner } from "typeorm";

export class IncreaseVocabularyPartOfSpeechLength1789405000000 implements MigrationInterface {
    name = 'IncreaseVocabularyPartOfSpeechLength1789405000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabularies" ALTER COLUMN "part_of_speech" TYPE character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabularies" ALTER COLUMN "part_of_speech" TYPE character varying(30)`);
    }
}
