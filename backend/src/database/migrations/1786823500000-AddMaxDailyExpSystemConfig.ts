import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMaxDailyExpSystemConfig1786823500000 implements MigrationInterface {
    name = 'AddMaxDailyExpSystemConfig1786823500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "system_configs" ("key", "value", "valueType", "group", "description") VALUES
            ('max_daily_exp', '200', 'INT', 'gamification', 'Giới hạn EXP tối đa có thể nhận mỗi ngày')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "system_configs" WHERE "key" = 'max_daily_exp'
        `);
    }
}
