const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getAllUnits = async (req, res) => {
  try {
    const units = await prisma.hvacUnit.findMany({ include: { property: true } })
    res.json(units)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getUnitById = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const unit = await prisma.hvacUnit.findUnique({ where: { id }, include: { property: true } })
    res.json(unit)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.createUnit = async (req, res) => {
  const { serialNumber, model, installDate, propertyId } = req.body
  try {
    const unit = await prisma.hvacUnit.create({
      data: { serialNumber, model, installDate: new Date(installDate), propertyId },
    })
    res.status(201).json(unit)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateUnit = async (req, res) => {
  const id = parseInt(req.params.id)
  const { serialNumber, model, installDate, propertyId } = req.body
  try {
    const updated = await prisma.hvacUnit.update({
      where: { id },
      data: { serialNumber, model, installDate: new Date(installDate), propertyId },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deleteUnit = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    await prisma.hvacUnit.delete({ where: { id } })
    res.json({ message: 'HVAC unit deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}