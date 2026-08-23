import AppDataSource from './src/database/data-source';

async function fix() {
  try {
    await AppDataSource.initialize();
    const runner = AppDataSource.createQueryRunner();
    
    await runner.query(`CREATE TABLE IF NOT EXISTS "user_rewards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "reward_id" uuid NOT NULL, "idempotency_key" character varying(64), "type" character varying(30) NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}', "is_used" boolean NOT NULL DEFAULT false, "redeemed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_user_rewards" PRIMARY KEY ("id"))`).catch(e => console.log(e.message));
    await runner.query(`CREATE INDEX IF NOT EXISTS "idx_user_rewards_user_used" ON "user_rewards" ("user_id", "is_used")`).catch(e=>console.log(e.message));
    
    await runner.query(`CREATE TABLE IF NOT EXISTS "rewards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying(50) NOT NULL, "title" character varying(120) NOT NULL, "type" character varying(30) NOT NULL, "cost_exp" integer NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}', "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_rewards" PRIMARY KEY ("id"))`).catch(e=>console.log(e.message));
    
    await runner.query(`CREATE TABLE IF NOT EXISTS "exp_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "amount" integer NOT NULL, "type" character varying(30) NOT NULL, "ref_type" character varying(30), "ref_id" uuid, "idempotency_key" character varying(64), CONSTRAINT "PK_exp_transactions" PRIMARY KEY ("id"))`).catch(e=>console.log(e.message));
    
    await runner.query(`CREATE TABLE IF NOT EXISTS "exp_daily_earnings" ("user_id" uuid NOT NULL, "date" date NOT NULL, "earned" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_exp_daily_earnings" PRIMARY KEY ("user_id", "date"))`).catch(e=>console.log(e.message));
    
    await runner.query(`ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "question_type" character varying(30)`).catch(e=>console.log(e.message));
    await runner.query(`ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "source_type" character varying(20) NOT NULL DEFAULT 'EXAM'`).catch(e=>console.log(e.message));
    await runner.query(`ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "topic_id" uuid`).catch(e=>console.log(e.message));
    await runner.query(`ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "hidden_by_admin" boolean NOT NULL DEFAULT false`).catch(e=>console.log(e.message));
    await runner.query(`ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "hide_reason" text`).catch(e=>console.log(e.message));
    await runner.query(`ALTER TABLE "questions" ADD COLUMN IF NOT EXISTS "hidden_at" TIMESTAMP WITH TIME ZONE`).catch(e=>console.log(e.message));
    
    console.log('Fixed all remaining schema objects.');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
fix();
