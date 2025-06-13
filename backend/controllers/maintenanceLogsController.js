const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { Parser } = require('json2csv'); 



exports.getAllLogs = async (req, res) => {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      include: {
        hvacUnit: true,
        technician: true,
        photos: true,
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
        technician: true,
        photos: true,
      },
    })
    res.json(log)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getLogsBySuite = async (req, res) => {
  const { suiteId } = req.params;
  try {
    const logs = await prisma.maintenanceLog.findMany({
      where: {
        hvacUnit: { suiteId: Number(suiteId) }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        hvacUnit: true,   // <--- ADD THIS
        photos: true,
      }
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update your existing createLog function to handle checklist data:

exports.createLog = async (req, res) => {
  const { 
    hvacUnitId, 
    technicianId, 
    notes, 
    maintenanceType, 
    status, 
    createdAt,
    // Add new checklist fields
    checklistData,
    serviceTechnician,
    specialNotes
  } = req.body;
  
  try {
    const newLog = await prisma.maintenanceLog.create({
      data: {
        hvacUnitId,
        technicianId,
        notes,
        maintenanceType,
        status,
        createdAt: new Date(createdAt),
        // Add optional checklist fields
        ...(checklistData && { checklistData }),
        ...(serviceTechnician && { serviceTechnician }),
        ...(specialNotes && { specialNotes })
      },
      include: {
        hvacUnit: true,
        technician: true,
        photos: true
      }
    });
    res.json(newLog);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: error.message });
  }
};

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

exports.downloadReport = async (req, res) => {
  const suiteId = Number(req.query.suiteId);
  if (!suiteId) {
    return res.status(400).json({ error: 'suiteId is required' });
  }
  try {
    const logs = await prisma.maintenanceLog.findMany({
      where: { hvacUnit: { suiteId } },
      include: { hvacUnit: true, technician: true, photos: true },
      orderBy: { createdAt: 'desc' },
    });

    const data = logs.map(log => ({
      ID: log.id,
      'Unit Label': log.hvacUnit?.name || '',
      'Technician': log.technician?.name || '',
      'Maintenance Type': log.maintenanceType,
      Notes: log.notes,
      Date: log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '',
      'Photos': log.photos?.map(p => `http://localhost:3000${p.url}`).join('; ') || ''
    }));

    const fields = ['ID', 'Unit Label', 'Technician', 'Maintenance Type', 'Notes', 'Date', 'Photos'];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('maintenance-history.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};