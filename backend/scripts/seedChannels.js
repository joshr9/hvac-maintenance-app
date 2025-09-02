// File: scripts/seedChannels.js
// Create this file in your backend directory

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedChannels() {
  console.log('🌱 Seeding default channels...');
  
  const channels = [
    {
      name: 'General',
      description: 'Team-wide announcements and general discussion',
      type: 'channel'
    },
    {
      name: 'Boulder Zone',
      description: 'Boulder area properties and jobs',
      type: 'channel'
    },
    {
      name: 'Westminster Zone',
      description: 'Westminster area properties and jobs',
      type: 'channel'
    },
    {
      name: 'HVAC Team',
      description: 'HVAC technicians and related work',
      type: 'channel'
    },
    {
      name: 'Urgent Alerts',
      description: 'High priority issues and emergencies',
      type: 'channel'
    }
  ];

  for (const channel of channels) {
    try {
      await prisma.channel.upsert({
        where: { name: channel.name },
        update: {},
        create: channel
      });
      console.log(`✅ Created channel: ${channel.name}`);
    } catch (error) {
      console.error(`❌ Error creating channel ${channel.name}:`, error.message);
    }
  }
  
  console.log('🎉 Default channels seeded!');
}

seedChannels()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });