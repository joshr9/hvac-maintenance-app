// scripts/seedTechnicians.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTechnicians() {
  try {
    console.log('🌱 Seeding technicians...');

    const technicians = [
      {
        name: 'Mario Escobar',
        email: 'mario@deancallan.com',
        role: 'TECHNICIAN'
      },
      {
        name: 'Alex Howard',
        email: 'alex@deancallan.com',
        role: 'TECHNICIAN'
      },
      {
        name: 'Gina Calley',
        email: 'gina@deancallan.com',
        role: 'TECHNICIAN'
      },
      {
        name: 'Lacey Wall',
        email: 'lacey@deancallan.com',
        role: 'TECHNICIAN'
      },
      {
        name: 'Armondo Metas',
        email: 'armondo@deancallan.com',
        role: 'TECHNICIAN'
      },
      {
        name: 'Tammy Banks',
        email: 'tammy@deancallan.com',
        role: 'TECHNICIAN'
      },
      {
        name: 'Emilio Escobar',
        email: 'emilio@deancallan.com',
        role: 'TECHNICIAN'
      },
      {
        name: 'Gavin Harris',
        email: 'gavin@deancallan.com',
        role: 'TECHNICIAN'
      },
      {
        name: 'Norm McGinnis',
        email: 'norm@deancallan.com',
        role: 'TECHNICIAN'
      }
    ];

    // Create technicians one by one to handle duplicates gracefully
    for (const tech of technicians) {
      try {
        const existing = await prisma.user.findUnique({
          where: { email: tech.email }
        });

        if (!existing) {
          const created = await prisma.user.create({ data: tech });
          console.log(`✅ Created technician: ${created.name} (ID: ${created.id})`);
        } else {
          console.log(`⚠️  Technician already exists: ${existing.name} (ID: ${existing.id})`);
        }
      } catch (error) {
        console.error(`❌ Error creating technician ${tech.name}:`, error.message);
      }
    }

    // Show all technicians with their IDs
    console.log('\n📋 All technicians in database:');
    const allTechs = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      select: { id: true, name: true, email: true }
    });

    allTechs.forEach(tech => {
      console.log(`   ID: ${tech.id} - ${tech.name} (${tech.email})`);
    });

    console.log('\n✅ Technician seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding technicians:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedTechnicians();
}

module.exports = seedTechnicians;