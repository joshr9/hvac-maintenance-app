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
  const { hvacUnitId, technicianId, notes, maintenanceType, status, createdAt } = req.body;
  try {
    const newLog = await prisma.maintenanceLog.create({
      data: {
        hvacUnitId,
        technicianId,
        notes,
        maintenanceType, // should be INSPECTION, etc.
        status,
        createdAt: new Date(createdAt), // or just createdAt if your schema expects string
      }
    });
    res.json(newLog);
  } catch (error) {
    console.error('Error creating log:', error); // <--- POST THIS ERROR HERE
    res.status(500).json({ error: error.message });
  }
}

exports.updateLog = async (req, res) => {
  const id = parseInt(req.params.id)
  const { technicianId, notes, maintenanceType, status, createdAt } = req.body
  try {
    const updatedLog = await prisma.maintenanceLog.update({
      where: { id },
      data: {
        technicianId,
        notes,
        maintenanceType,
        status,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    })
    res.json(updatedLog)
  } catch (err) {
    console.error('Error updating log:', err)
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