import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddYctCurriculum1790000000000 implements MigrationInterface {
  name = 'AddYctCurriculum1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── yct_levels ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "yct_levels" (
        "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "code"          VARCHAR(10)   NOT NULL,
        "name"          VARCHAR(100)  NOT NULL,
        "description"   TEXT,
        "thumbnail_key" VARCHAR(255),
        "display_order" INT           NOT NULL DEFAULT 0,
        "status"        VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
        "is_active"     BOOLEAN       NOT NULL DEFAULT true,
        CONSTRAINT "PK_yct_levels" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_yct_levels_code" UNIQUE ("code")
      )
    `);

    // ── yct_lessons ─────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "yct_lessons" (
        "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "level_id"      uuid          NOT NULL,
        "title"         VARCHAR(200)  NOT NULL,
        "description"   TEXT,
        "thumbnail_key" VARCHAR(255),
        "display_order" INT           NOT NULL DEFAULT 0,
        "status"        VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
        "is_active"     BOOLEAN       NOT NULL DEFAULT true,
        "published_at"  TIMESTAMPTZ,
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "PK_yct_lessons" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "yct_lessons"
        ADD CONSTRAINT "FK_yct_lessons_level_id"
        FOREIGN KEY ("level_id") REFERENCES "yct_levels"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // ── yct_vocabularies ─────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "yct_vocabularies" (
        "id"             uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"     TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMPTZ   NOT NULL DEFAULT now(),
        "level_id"       uuid,
        "lesson_id"      uuid,
        "hanzi"          VARCHAR(50)   NOT NULL,
        "pinyin"         VARCHAR(100)  NOT NULL,
        "meaning_vi"     TEXT          NOT NULL,
        "audio_key"      VARCHAR(255),
        "image_key"      VARCHAR(255),
        "part_of_speech" VARCHAR(100),
        "example"        TEXT,
        "status"         VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
        "is_active"      BOOLEAN       NOT NULL DEFAULT true,
        "deleted_at"     TIMESTAMPTZ,
        CONSTRAINT "PK_yct_vocabularies" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "yct_vocabularies"
        ADD CONSTRAINT "FK_yct_vocabularies_level_id"
        FOREIGN KEY ("level_id") REFERENCES "yct_levels"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "yct_vocabularies"
        ADD CONSTRAINT "FK_yct_vocabularies_lesson_id"
        FOREIGN KEY ("lesson_id") REFERENCES "yct_lessons"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // ── Indexes ──────────────────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE INDEX "idx_yct_lessons_level_status"
        ON "yct_lessons" ("level_id", "status", "display_order")
        WHERE deleted_at IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_yct_vocabs_lesson"
        ON "yct_vocabularies" ("lesson_id", "status")
        WHERE deleted_at IS NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_yct_vocabs_level"
        ON "yct_vocabularies" ("level_id", "status")
        WHERE deleted_at IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_yct_vocabs_level"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_yct_vocabs_lesson"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_yct_lessons_level_status"`);

    await queryRunner.query(`ALTER TABLE "yct_vocabularies" DROP CONSTRAINT IF EXISTS "FK_yct_vocabularies_lesson_id"`);
    await queryRunner.query(`ALTER TABLE "yct_vocabularies" DROP CONSTRAINT IF EXISTS "FK_yct_vocabularies_level_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "yct_vocabularies"`);

    await queryRunner.query(`ALTER TABLE "yct_lessons" DROP CONSTRAINT IF EXISTS "FK_yct_lessons_level_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "yct_lessons"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "yct_levels"`);
  }
}
