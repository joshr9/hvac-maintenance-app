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

exports.getLogsByUnit = async (req, res) => {
  const { unitId } = req.params;
  try {
    const logs = await prisma.maintenanceLog.findMany({
      where: { hvacUnitId: Number(unitId) },
      orderBy: { createdAt: 'desc' },
      include: {
        technician: { select: { id: true, name: true } },
        photos: true,
      },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

// UPDATED createLog function with validation to fix foreign key constraint errors
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
    // 1. VALIDATE REQUIRED FIELDS
    if (!hvacUnitId || !technicianId || !maintenanceType) {
      return res.status(400).json({
        error: 'Missing required fields: hvacUnitId, technicianId, and maintenanceType are required'
      });
    }

    // 2. VALIDATE TECHNICIAN EXISTS
    const technician = await prisma.user.findFirst({
      where: {
        id: parseInt(technicianId),
        role: 'TECHNICIAN'
      }
    });

    if (!technician) {
      // Get available technicians to help with debugging
      const availableTechnicians = await prisma.user.findMany({
        where: { role: 'TECHNICIAN' },
        select: { id: true, name: true }
      });

      return res.status(400).json({
        error: `Technician with ID ${technicianId} not found. Please use a valid technician ID.`,
        availableTechnicians: availableTechnicians
      });
    }

    // 3. VALIDATE HVAC UNIT EXISTS
    const hvacUnit = await prisma.hvacUnit.findUnique({
      where: { id: parseInt(hvacUnitId) }
    });

    if (!hvacUnit) {
      return res.status(400).json({
        error: `HVAC Unit with ID ${hvacUnitId} not found.`
      });
    }

    // 4. CREATE MAINTENANCE LOG
    const newLog = await prisma.maintenanceLog.create({
      data: {
        hvacUnitId: parseInt(hvacUnitId),
        technicianId: parseInt(technicianId),
        notes,
        maintenanceType,
        status,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
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

    // Auto-close any scheduled maintenance for this unit on or before today
    try {
      const logDate = newLog.createdAt;
      const endOfDay = new Date(logDate);
      endOfDay.setHours(23, 59, 59, 999);

      const pending = await prisma.scheduledMaintenance.findMany({
        where: {
          hvacUnitId: parseInt(hvacUnitId),
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          date: { lte: endOfDay },
        },
        orderBy: { date: 'asc' },
      });

      if (pending.length > 0) {
        // Link the earliest scheduled record to this log
        await prisma.scheduledMaintenance.update({
          where: { id: pending[0].id },
          data: { status: 'COMPLETED', completedLogId: newLog.id },
        });
        // Mark any additional overdue records completed (no log link — completedLogId is unique)
        if (pending.length > 1) {
          await prisma.scheduledMaintenance.updateMany({
            where: { id: { in: pending.slice(1).map(s => s.id) } },
            data: { status: 'COMPLETED' },
          });
        }
      }
    } catch (scheduleErr) {
      // Non-fatal: log was saved, just couldn't auto-close schedule
      console.error('Warning: could not auto-close scheduled maintenance:', scheduleErr.message);
    }

    res.json(newLog);

  } catch (error) {
    console.error('❌ Error creating maintenance log:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Foreign key constraint failed. Please check that technicianId and hvacUnitId are valid.',
        details: error.meta
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Unique constraint violation',
        details: error.meta
      });
    }

    res.status(500).json({
      error: 'Failed to create maintenance log',
      details: error.message
    });
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