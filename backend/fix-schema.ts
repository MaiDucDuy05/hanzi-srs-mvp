import AppDataSource from './src/database/data-source';

async function fixDB() {
  try {
    await AppDataSource.initialize();
    
    await AppDataSource.query(`ALTER TABLE "test_assignments" ADD COLUMN IF NOT EXISTS "status_on_submit" character varying(20) NOT NULL DEFAULT 'GRADED'`);
    
    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS "contact_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying(100) NOT NULL,
        "email" character varying(255) NOT NULL,
        "phone" character varying(30),
        "message" text NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'NEW',
        CONSTRAINT "PK_contact_requests" PRIMARY KEY ("id")
      )
    `);
    
    console.log('Added status_on_submit to test_assignments and created contact_requests table.');
    
  } catch (err) {
    console.error('Error fixing DB:', err);
  } finally {
    process.exit(0);
  }
}

fixDB();
