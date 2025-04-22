const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const tech = await prisma.user.create({
    data: {
      name: 'Josh Contractor',
      email: 'josh@example.com',
      role: 'TECHNICIAN',
    },
  })

  const property = await prisma.property.create({
    data: {
      name: 'Dean Callan Office',
      address: '123 Main Street',
    },
  })

  const unit = await prisma.hvacUnit.create({
    data: {
      serialNumber: 'HVAC-0001',
      model: 'Trane X500',
      installDate: new Date('2021-07-01'),
      propertyId: property.id,
    },
  })

  await prisma.maintenanceLog.create({
    data: {
      hvacUnitId: unit.id,
      technicianId: tech.id,
      maintenanceType: 'INSPECTION',
      status: 'COMPLETED',
      notes: 'Everything looked good. Replaced air filter.',
    },
  })
}

main()
  .then(() => {
    console.log('Seed data created!')
    return prisma.$disconnect()
  })
  .catch(e => {
    console.error(e)
    prisma.$disconnect()
  })