// Run this script to fix the failed migration in Railway
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMigration() {
  try {
    console.log('Deleting failed migration record from _prisma_migrations table...');

    // Delete the failed migration record
    await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations"
      WHERE migration_name = '20251008_add_direct_messages'
    `);

    console.log('✅ Successfully deleted failed migration record');
    console.log('Now the new migration can run on next deployment');

  } catch (error) {
    console.error('❌ Error fixing migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigration();
