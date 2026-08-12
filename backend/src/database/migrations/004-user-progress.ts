import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserProgress1723512345681 implements MigrationInterface {
  name = 'UserProgress1723512345681';

  public async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE users
        ADD COLUMN daily_goal int NOT NULL DEFAULT 50,
        ADD COLUMN current_streak int NOT NULL DEFAULT 0,
        ADD COLUMN last_activity_date date;
      CREATE INDEX idx_users_activity ON users(last_activity_date);
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE users
        DROP COLUMN daily_goal,
        DROP COLUMN current_streak,
        DROP COLUMN last_activity_date;
      DROP INDEX IF EXISTS idx_users_activity;
    `);
  }
}
