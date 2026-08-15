import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExpSystemConfigs1786823000000 implements MigrationInterface {
    name = 'AddExpSystemConfigs1786823000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "system_configs" ("key", "value", "valueType", "group", "description") VALUES
            ('exp_base_reward', '10', 'INT', 'gamification', 'EXP cơ bản khi hoàn thành bài tập'),
            ('exp_perfect_reward', '5', 'INT', 'gamification', 'EXP thưởng thêm khi đạt Perfect'),
            ('exp_combo_multiplier', '2', 'INT', 'gamification', 'Hệ số nhân EXP thưởng thêm cho mỗi chuỗi Combo > 2')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "system_configs" WHERE "key" IN ('exp_base_reward', 'exp_perfect_reward', 'exp_combo_multiplier')
        `);
    }
}
