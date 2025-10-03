const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        suites: {
          include: {
            hvacUnits: {
              include: {
                scheduledMaintenance: true,
              },
            },
          },
        },
      },
    });
    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPropertyById = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: { hvacUnits: true },
    })
    res.json(property)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.createProperty = async (req, res) => {
  const { name, address } = req.body
  try {
    const newProperty = await prisma.property.create({
      data: { name, address },
    })
    res.status(201).json(newProperty)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateProperty = async (req, res) => {
  const id = parseInt(req.params.id)
  const { name, address } = req.body
  try {
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { name, address },
    })
    res.json(updatedProperty)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deleteProperty = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    await prisma.property.delete({ where: { id } })
    res.json({ message: 'Property deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}