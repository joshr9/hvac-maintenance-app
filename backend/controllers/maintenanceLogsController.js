const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      include: {
        hvacUnit: true,
        user: true,
      },
    })
    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getLogById = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: {
        hvacUnit: true,
        user: true,
      },
    })
    res.json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.createLog = async (req, res) => {
  const { hvacUnitId, userId, description, performedAt } = req.body
  try {
    const newLog = await prisma.maintenanceLog.create({
      data: {
        hvacUnitId,
        userId,
        description,
        performedAt: new Date(performedAt),
      },
    })
    res.status(201).json(newLog)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateLog = async (req, res) => {
  const id = parseInt(req.params.id)
  const { description, performedAt } = req.body
  try {
    const updatedLog = await prisma.maintenanceLog.update({
      where: { id },
      data: {
        description,
        performedAt: new Date(performedAt),
      },
    })
    res.json(updatedLog)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.deleteLog = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    await prisma.maintenanceLog.delete({ where: { id } })
    res.json({ message: 'Maintenance log deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}