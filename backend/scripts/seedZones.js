const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedZones() {
  console.log('🌱 Seeding zones...');

  const zones = [
    { name: 'Boulder', description: 'Boulder area properties' },
    { name: 'Lafayette', description: 'Lafayette area properties' },
    { name: 'Louisville', description: 'Louisville area properties' },
    { name: 'Gunbarrel', description: 'Gunbarrel area properties' },
    { name: 'North Boulder', description: 'North Boulder area properties' },
    { name: 'Northglenn', description: 'Northglenn area properties' },
    { name: 'Denver', description: 'Denver area properties' }
  ];

  for (const zone of zones) {
    await prisma.zone.upsert({
      where: { name: zone.name },
      update: {},
      create: zone
    });
    console.log(`✅ Created zone: ${zone.name}`);
  }

  console.log('🎉 Zone seeding complete!');
}

seedZones()
  .catch(console.error)
  .finally(() => prisma.$disconnect());