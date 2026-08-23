import AppDataSource from './src/database/data-source';

async function fixDB() {
  try {
    await AppDataSource.initialize();
    
    await AppDataSource.query(`ALTER TABLE "test_assignments" ADD COLUMN IF NOT EXISTS "status_on_submit" character varying(20) NOT NULL DEFAULT 'GRADED'`);
    
    console.log('Added status_on_submit to test_assignments.');
    
  } catch (err) {
    console.error('Error fixing DB:', err);
  } finally {
    process.exit(0);
  }
}

fixDB();
