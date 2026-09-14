import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestTemplateAndSection1789326660738 implements MigrationInterface {
    name = 'AddTestTemplateAndSection1789326660738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_questions" DROP CONSTRAINT "FK_5badfac5ec550e555213ad2e5bc"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_tests_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_test_questions_question"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_test_questions_test"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_test_attempts_test"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_test_attempts_user"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_lessons_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_prac_q_lesson"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_prac_q_topic"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_prac_q_type_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_courses_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_course_lessons_lesson"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_user_activities_user_type"`);
        await queryRunner.query(`CREATE TABLE "test_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "test_id" uuid NOT NULL, "name" character varying(200) NOT NULL, "instruction" text, "order_index" integer NOT NULL DEFAULT '0', "target_skill" character varying(20), "required_question_count" integer, CONSTRAINT "PK_e2437ba617affcf6ef3ed443dcc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "test_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "category" character varying(30) NOT NULL, "hsk_level" integer, "name" character varying(200) NOT NULL, "description" text, "time_limit_minutes" integer NOT NULL DEFAULT '0', "is_system_default" boolean NOT NULL DEFAULT false, "created_by" uuid, "is_public" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_eb5603dc71cc6d0bf9f1c3799ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "test_template_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "template_id" uuid NOT NULL, "name" character varying(200) NOT NULL, "order_index" integer NOT NULL DEFAULT '0', "target_skill" character varying(20) NOT NULL, "question_count" integer NOT NULL, "group_count_allowed" integer NOT NULL DEFAULT '0', "points_per_question" double precision NOT NULL DEFAULT '1', CONSTRAINT "PK_84c86a6fcb46ea07babc69b0143" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tests" ADD "category" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "tests" ADD "template_id" uuid`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "parent_id" uuid`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "skill" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "test_questions" ADD "section_id" uuid`);
        await queryRunner.query(`ALTER TABLE "test_questions" ALTER COLUMN "test_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT '2.5'`);
        await queryRunner.query(`ALTER TABLE "test_sections" ADD CONSTRAINT "FK_54da0bd23d3c9127635878f9dee" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_questions" ADD CONSTRAINT "FK_039077cdefefda6bd319fc94173" FOREIGN KEY ("section_id") REFERENCES "test_sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_template_sections" ADD CONSTRAINT "FK_318c0f702f09de172d2df171c89" FOREIGN KEY ("template_id") REFERENCES "test_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_template_sections" DROP CONSTRAINT "FK_318c0f702f09de172d2df171c89"`);
        await queryRunner.query(`ALTER TABLE "test_questions" DROP CONSTRAINT "FK_039077cdefefda6bd319fc94173"`);
        await queryRunner.query(`ALTER TABLE "test_sections" DROP CONSTRAINT "FK_54da0bd23d3c9127635878f9dee"`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ALTER COLUMN "easiness_factor" SET DEFAULT 2.5`);
        await queryRunner.query(`ALTER TABLE "test_questions" ALTER COLUMN "test_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "test_questions" DROP COLUMN "section_id"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "skill"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "parent_id"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "template_id"`);
        await queryRunner.query(`ALTER TABLE "tests" DROP COLUMN "category"`);
        await queryRunner.query(`DROP TABLE "test_template_sections"`);
        await queryRunner.query(`DROP TABLE "test_templates"`);
        await queryRunner.query(`DROP TABLE "test_sections"`);
        await queryRunner.query(`CREATE INDEX "idx_user_activities_user_type" ON "user_activities" ("user_id", "activity_type") `);
        await queryRunner.query(`CREATE INDEX "idx_course_lessons_lesson" ON "course_lessons" ("lesson_id") `);
        await queryRunner.query(`CREATE INDEX "idx_courses_status" ON "courses" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_prac_q_type_status" ON "practice_questions" ("question_type", "status") `);
        await queryRunner.query(`CREATE INDEX "idx_prac_q_topic" ON "practice_questions" ("topic_id") `);
        await queryRunner.query(`CREATE INDEX "idx_prac_q_lesson" ON "practice_questions" ("lesson_id") `);
        await queryRunner.query(`CREATE INDEX "idx_lessons_status" ON "lessons" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_test_attempts_user" ON "test_attempts" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_test_attempts_test" ON "test_attempts" ("test_id") `);
        await queryRunner.query(`CREATE INDEX "idx_test_questions_test" ON "test_questions" ("test_id") `);
        await queryRunner.query(`CREATE INDEX "idx_test_questions_question" ON "test_questions" ("question_id") `);
        await queryRunner.query(`CREATE INDEX "idx_tests_status" ON "tests" ("status") `);
        await queryRunner.query(`ALTER TABLE "test_questions" ADD CONSTRAINT "FK_5badfac5ec550e555213ad2e5bc" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
