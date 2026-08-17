import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fix: Add missing updated_at column to user_activities table.
 * Migration 005 created user_activities without updated_at,
 * but BaseEntity expects both created_at and updated_at.
 */
export class AddUpdatedAtToUserActivities20260818054424 implements MigrationInterface {
  name = 'AddUpdatedAtToUserActivities20260818054424';

  public async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE user_activities
        ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(`
      ALTER TABLE user_activities DROP COLUMN IF EXISTS updated_at;
    `);
  }
}
