import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeVocabularyLevelIdNullable1789730000000
  implements MigrationInterface
{
  name = 'MakeVocabularyLevelIdNullable1789730000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vocabularies" ALTER COLUMN "level_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vocabularies" ALTER COLUMN "level_id" SET NOT NULL`,
    );
  }
}
