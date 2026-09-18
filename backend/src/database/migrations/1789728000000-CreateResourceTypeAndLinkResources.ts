import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateResourceTypeAndLinkResources1789728000000
  implements MigrationInterface
{
  name = 'CreateResourceTypeAndLinkResources1789728000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create table resource_types
    await queryRunner.query(`
      CREATE TABLE "resource_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "name" character varying(100) NOT NULL,
        "code" character varying(50) NOT NULL,
        "description" text,
        "display_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "uq_resource_types_code" UNIQUE ("code"),
        CONSTRAINT "pk_resource_types" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_resource_types_code" ON "resource_types" ("code")`,
    );

    // 2. Add column resource_type_id to resources table
    await queryRunner.query(
      `ALTER TABLE "resources" ADD "resource_type_id" uuid`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_resources_resource_type_id" ON "resources" ("resource_type_id")`,
    );

    await queryRunner.query(`
      ALTER TABLE "resources"
      ADD CONSTRAINT "fk_resources_resource_type"
      FOREIGN KEY ("resource_type_id")
      REFERENCES "resource_types"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // 3. Seed default resource types
    await queryRunner.query(`
      INSERT INTO "resource_types" ("name", "code", "description", "display_order", "is_active") VALUES
      ('Giáo trình chuẩn HSK', 'hsk_standard', 'Tài liệu và giáo trình theo chuẩn HSK các cấp độ', 1, true),
      ('Giáo trình Hán ngữ', 'han_ngu', 'Bộ giáo trình Hán ngữ 6 cuốn kinh điển', 2, true),
      ('Giáo trình Boya', 'boya', 'Bộ giáo trình Boya phát triển kỹ năng giao tiếp toàn diện', 3, true),
      ('Đề thi thử & Luyện đề', 'mock_tests', 'Các bộ đề thi thử HSK, HSKK thực chiến và đáp án', 4, true),
      ('Ngữ pháp & Từ vựng chuyên đề', 'grammar_vocab', 'Sổ tay tổng hợp ngữ pháp, từ vựng theo chủ đề', 5, true),
      ('Tài liệu khác', 'others', 'Các tài liệu, bài giảng tham khảo khác', 6, true)
      ON CONFLICT ("code") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resources" DROP CONSTRAINT "fk_resources_resource_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_resources_resource_type_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resources" DROP COLUMN "resource_type_id"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_resource_types_code"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resource_types"`);
  }
}
