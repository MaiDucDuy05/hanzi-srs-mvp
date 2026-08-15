import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSystemConfigs1786799934021 implements MigrationInterface {
    name = 'CreateSystemConfigs1786799934021'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."system_configs_valuetype_enum" AS ENUM('INT', 'STRING', 'BOOLEAN', 'JSON')`);
        await queryRunner.query(`CREATE TABLE "system_configs" ("key" character varying(100) NOT NULL, "value" text, "valueType" "public"."system_configs_valuetype_enum" NOT NULL DEFAULT 'STRING', "group" character varying(50), "description" text, "updatedBy" uuid, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5aff9a6d272a5cedf54d7aaf617" PRIMARY KEY ("key"))`);
        
        await queryRunner.query(`
            INSERT INTO "system_configs" ("key", "value", "valueType", "group", "description") VALUES
            ('free_attempt_limit', '3', 'INT', 'limits', 'Số lượt luyện tập miễn phí/bài/ngày'),
            ('free_limit_reset_time', '00:00', 'STRING', 'limits', 'Giờ reset lượt (timezone server)'),
            ('max_students_per_class', '50', 'INT', 'limits', 'Giới hạn sĩ số lớp'),
            ('ai_provider', 'openai', 'STRING', 'ai', 'Provider AI đang dùng (openai/gemini)'),
            ('ai_story_rate_limit_vip', '10', 'INT', 'ai', 'Số lần tạo AI story/ngày cho VIP'),
            ('ai_story_rate_limit_teacher', '30', 'INT', 'ai', 'Số lần tạo AI story/ngày cho Teacher'),
            ('ai_learning_path_rate_limit', '5', 'INT', 'ai', 'Số lần gợi ý lộ trình/ngày cho Teacher'),
            ('vip_price_monthly', '99000', 'INT', 'commerce', 'Giá gói VIP tháng (VNĐ)'),
            ('vip_price_semi_annual', '499000', 'INT', 'commerce', 'Giá gói VIP 6 tháng (VNĐ)'),
            ('vip_price_annual', '899000', 'INT', 'commerce', 'Giá gói VIP năm (VNĐ)'),
            ('resource_max_file_size_mb', '50', 'INT', 'commerce', 'Dung lượng upload tối đa (MB)'),
            ('hskk_max_audio_size_mb', '10', 'INT', 'commerce', 'Dung lượng audio HSKK tối đa (MB)'),
            ('contact_email', 'admin@hanzisrs.com', 'STRING', 'system', 'Email nhận thông báo lead'),
            ('maintenance_mode', 'false', 'BOOLEAN', 'system', 'Bật/tắt chế độ bảo trì'),
            ('feature_ai_enabled', 'true', 'BOOLEAN', 'features', 'Bật/tắt tính năng AI'),
            ('feature_hskk_enabled', 'true', 'BOOLEAN', 'features', 'Bật/tắt tính năng HSKK')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "system_configs"`);
        await queryRunner.query(`DROP TYPE "public"."system_configs_valuetype_enum"`);
    }
}
