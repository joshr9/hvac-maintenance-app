// Run this script to fix the failed migration in Railway
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMigration() {
  try {
    console.log('Step 1: Deleting ALL failed migration records...');

    // Delete ALL failed migration records
    await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations"
      WHERE migration_name LIKE '%add_direct_messages%'
         OR migration_name LIKE '%support_direct_messages%'
    `);

    console.log('Step 2: Applying schema changes directly...');

    // Apply the actual schema changes
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "messages" ALTER COLUMN "channelId" DROP NOT NULL;
    `);
    console.log('  - Made channelId optional');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "directRecipientId" TEXT;
    `);
    console.log('  - Added directRecipientId column');

    // Mark migration as applied
    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (gen_random_uuid(), '', NOW(), '20251008160834_support_direct_messages', NULL, NULL, NOW(), 1)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Successfully fixed migration and applied schema changes');

  } catch (error) {
    console.error('❌ Error fixing migration:', error);
    console.error('Full error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigration();
