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
      include: {
        suites: {
          include: {
            hvacUnits: true
          }
        }
      }
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

// Suite CRUD operations
exports.addSuite = async (req, res) => {
  const propertyId = parseInt(req.params.id)
  const { name } = req.body

  try {
    const newSuite = await prisma.suite.create({
      data: {
        name,
        propertyId
      },
      include: {
        hvacUnits: true
      }
    })
    res.status(201).json(newSuite)
  } catch (err) {
    console.error('Error creating suite:', err)
    res.status(500).json({ error: err.message })
  }
}

exports.updateSuite = async (req, res) => {
  const suiteId = parseInt(req.params.suiteId)
  const { name } = req.body

  try {
    const updatedSuite = await prisma.suite.update({
      where: { id: suiteId },
      data: {
        name
      },
      include: {
        hvacUnits: true
      }
    })
    res.json(updatedSuite)
  } catch (err) {
    console.error('Error updating suite:', err)
    res.status(500).json({ error: err.message })
  }
}

exports.deleteSuite = async (req, res) => {
  const suiteId = parseInt(req.params.suiteId)

  try {
    await prisma.suite.delete({
      where: { id: suiteId }
    })
    res.json({ message: 'Suite deleted' })
  } catch (err) {
    console.error('Error deleting suite:', err)
    res.status(500).json({ error: err.message })
  }
}