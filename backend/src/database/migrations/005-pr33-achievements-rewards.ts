import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * PR-33: Achievements & Rewards System.
 * - users: +total_exp, +current_exp (cached balance)
 * - mistake_book: +context jsonb
 * - subscriptions: +scope jsonb (a-la-carte feature VIP)
 * - exp_transactions: append-only ledger, PARTITION BY RANGE(created_at) monthly
 * - exp_daily_earnings: daily cap tracker (composite PK)
 * - user_activities: timeline, PARTITION BY RANGE(created_at) monthly
 * - rewards: catalog (admin-managed)
 * - user_rewards: redemption inventory
 *
 * Partition pattern follows practice_attempts (001-initial-schema).
 * Partial unique idempotency index đặt trên TỪNG partition (PG限制).
 */
export class Pr33AchievementsRewards1723712345690 implements MigrationInterface {
  name = 'Pr33AchievementsRewards1723712345690';

  public async up(qr: QueryRunner): Promise<void> {
    // ============ ALTER EXISTING TABLES ============
    await qr.query(`
      ALTER TABLE users
        ADD COLUMN total_exp int NOT NULL DEFAULT 0,
        ADD COLUMN current_exp int NOT NULL DEFAULT 0;
      CREATE INDEX idx_users_exp ON users (total_exp DESC);
    `);

    await qr.query(`
      ALTER TABLE mistake_book ADD COLUMN context jsonb;
    `);

    await qr.query(`
      ALTER TABLE subscriptions
        ADD COLUMN scope jsonb NOT NULL DEFAULT '[]'::jsonb;
      CREATE INDEX idx_subscriptions_scope ON subscriptions USING gin (scope);
    `);

    // ============ exp_transactions: APPEND-ONLY LEDGER (partitioned monthly) ============
    await qr.query(`
      CREATE TABLE exp_transactions (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        amount int NOT NULL,
        type varchar(30) NOT NULL,
        ref_type varchar(30),
        ref_id uuid,
        idempotency_key varchar(64),
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (id, created_at),
        CONSTRAINT chk_exp_transactions_amount CHECK (amount <> 0),
        CONSTRAINT chk_exp_transactions_type CHECK (
          type IN ('EARN_LESSON','EARN_PERFECT','EARN_COMBO','EARN_STREAK',
                   'EARN_MISTAKE_REVIEW','REDEEM','ADMIN_ADJUST')
        )
      ) PARTITION BY RANGE (created_at);
    `);

    // Partitions: current + next + default (match practice_attempts pattern).
    await qr.query(`
      CREATE TABLE exp_transactions_2026_08 PARTITION OF exp_transactions
        FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
      CREATE TABLE exp_transactions_2026_09 PARTITION OF exp_transactions
        FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
      CREATE TABLE exp_transactions_default PARTITION OF exp_transactions DEFAULT;
    `);

    // Partial unique idempotency — trên từng partition (PG không cho trên parent).
    await qr.query(`
      CREATE UNIQUE INDEX uq_exp_tx_idem_2026_08
        ON exp_transactions_2026_08 (user_id, idempotency_key)
        WHERE idempotency_key IS NOT NULL;
      CREATE UNIQUE INDEX uq_exp_tx_idem_2026_09
        ON exp_transactions_2026_09 (user_id, idempotency_key)
        WHERE idempotency_key IS NOT NULL;
      CREATE UNIQUE INDEX uq_exp_tx_idem_default
        ON exp_transactions_default (user_id, idempotency_key)
        WHERE idempotency_key IS NOT NULL;
    `);

    await qr.query(`
      CREATE INDEX idx_exp_tx_user_created
        ON exp_transactions (user_id, created_at DESC);
    `);

    // ============ exp_daily_earnings: DAILY CAP TRACKER ============
    await qr.query(`
      CREATE TABLE exp_daily_earnings (
        user_id uuid NOT NULL REFERENCES users(id),
        date date NOT NULL DEFAULT CURRENT_DATE,
        earned int NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, date),
        CONSTRAINT chk_exp_daily_earned_nonneg CHECK (earned >= 0)
      );
    `);

    // ============ user_activities: TIMELINE (partitioned monthly) ============
    await qr.query(`
      CREATE TABLE user_activities (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        activity_type varchar(30) NOT NULL,
        details jsonb,
        exp_awarded int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (id, created_at),
        CONSTRAINT chk_user_activities_type CHECK (
          activity_type IN ('LESSON_COMPLETED','PRACTICE_COMPLETED','PERFECT_BONUS',
            'COMBO_BONUS','STREAK_MILESTONE','MISTAKE_REVIEWED','REDEEMED_REWARD',
            'REWARD_GRANTED','LEVEL_UP')
        )
      ) PARTITION BY RANGE (created_at);
    `);

    await qr.query(`
      CREATE TABLE user_activities_2026_08 PARTITION OF user_activities
        FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
      CREATE TABLE user_activities_2026_09 PARTITION OF user_activities
        FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
      CREATE TABLE user_activities_default PARTITION OF user_activities DEFAULT;
    `);

    await qr.query(`
      CREATE INDEX idx_user_activities_user_created
        ON user_activities (user_id, created_at DESC);
    `);

    // ============ rewards: CATALOG ============
    await qr.query(`
      CREATE TABLE rewards (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(50) NOT NULL,
        title varchar(120) NOT NULL,
        type varchar(30) NOT NULL,
        cost_exp int NOT NULL,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        active bool NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_rewards_cost_pos CHECK (cost_exp > 0),
        CONSTRAINT chk_rewards_type CHECK (
          type IN ('TEMPORARY_VIP','DISCOUNT_VOUCHER','CONTENT_UNLOCK','COSMETIC')
        )
      );
      CREATE UNIQUE INDEX uq_rewards_code ON rewards (code);
    `);

    // ============ user_rewards: REDEMPTION INVENTORY ============
    await qr.query(`
      CREATE TABLE user_rewards (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        reward_id uuid NOT NULL REFERENCES rewards(id),
        idempotency_key varchar(64),
        type varchar(30) NOT NULL,
        metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
        is_used bool NOT NULL DEFAULT false,
        redeemed_at timestamptz NOT NULL DEFAULT now(),
        expires_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_user_rewards_type CHECK (
          type IN ('TEMPORARY_VIP','DISCOUNT_VOUCHER','CONTENT_UNLOCK','COSMETIC')
        )
      );
      CREATE UNIQUE INDEX uq_user_rewards_idem
        ON user_rewards (user_id, idempotency_key)
        WHERE idempotency_key IS NOT NULL;
      CREATE INDEX idx_user_rewards_user_used
        ON user_rewards (user_id, is_used);
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    // Drop in reverse dependency order.
    await qr.query(`DROP TABLE IF EXISTS user_rewards CASCADE;`);
    await qr.query(`DROP TABLE IF EXISTS rewards CASCADE;`);

    await qr.query(`
      DROP INDEX IF EXISTS idx_user_activities_user_created;
      DROP TABLE IF EXISTS user_activities_2026_08 CASCADE;
      DROP TABLE IF EXISTS user_activities_2026_09 CASCADE;
      DROP TABLE IF EXISTS user_activities_default CASCADE;
      DROP TABLE IF EXISTS user_activities CASCADE;
    `);

    await qr.query(`DROP TABLE IF EXISTS exp_daily_earnings CASCADE;`);

    await qr.query(`
      DROP INDEX IF EXISTS idx_exp_tx_user_created;
      DROP INDEX IF EXISTS uq_exp_tx_idem_2026_08;
      DROP INDEX IF EXISTS uq_exp_tx_idem_2026_09;
      DROP INDEX IF EXISTS uq_exp_tx_idem_default;
      DROP TABLE IF EXISTS exp_transactions_2026_08 CASCADE;
      DROP TABLE IF EXISTS exp_transactions_2026_09 CASCADE;
      DROP TABLE IF EXISTS exp_transactions_default CASCADE;
      DROP TABLE IF EXISTS exp_transactions CASCADE;
    `);

    await qr.query(`
      DROP INDEX IF EXISTS idx_subscriptions_scope;
      ALTER TABLE subscriptions DROP COLUMN IF EXISTS scope;
    `);

    await qr.query(`ALTER TABLE mistake_book DROP COLUMN IF EXISTS context;`);

    await qr.query(`
      DROP INDEX IF EXISTS idx_users_exp;
      ALTER TABLE users DROP COLUMN IF EXISTS total_exp, DROP COLUMN IF EXISTS current_exp;
    `);
  }
}
