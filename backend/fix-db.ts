import AppDataSource from './src/database/data-source';

async function fix() {
  try {
    await AppDataSource.initialize();
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS "user_activities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "user_id" uuid NOT NULL, 
        "activity_type" character varying(30) NOT NULL, 
        "details" jsonb, 
        "exp_awarded" integer NOT NULL DEFAULT '0', 
        CONSTRAINT "PK_1245d4d2cf04ba7743f2924d951" PRIMARY KEY ("id")
      )
    `);
    await AppDataSource.query(`CREATE INDEX IF NOT EXISTS "idx_user_activities_user_created" ON "user_activities" ("user_id", "created_at")`);
    await AppDataSource.query(`CREATE INDEX IF NOT EXISTS "idx_user_activities_user" ON "user_activities" ("user_id")`);
    console.log('Fixed user_activities table.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fix();
