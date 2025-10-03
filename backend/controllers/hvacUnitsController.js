const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getHVACStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get scheduled maintenance counts
    const [todayScheduled, overdueScheduled, completedToday, totalUnits, totalScheduled] = await Promise.all([
      // Today's scheduled maintenance
      prisma.scheduledMaintenance.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          },
          status: {
            in: ['SCHEDULED', 'IN_PROGRESS']
          }
        }
      }),

      // Overdue maintenance (past due and not completed)
      prisma.scheduledMaintenance.count({
        where: {
          date: {
            lt: today
          },
          status: {
            in: ['SCHEDULED', 'IN_PROGRESS']
          }
        }
      }),

      // Completed today
      prisma.scheduledMaintenance.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          },
          status: 'COMPLETED'
        }
      }),

      // Total HVAC units
      prisma.hvacUnit.count(),

      // Total scheduled maintenance
      prisma.scheduledMaintenance.count()
    ]);

    res.json({
      todayJobs: todayScheduled,
      overdueUnits: overdueScheduled,
      completedToday: completedToday,
      totalUnits: totalUnits,
      totalScheduled: totalScheduled
    });
  } catch (err) {
    console.error('Error fetching HVAC stats:', err);
    res.status(500).json({ error: err.message });
  }
};

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
  const { label, serialNumber, model, installDate, filterSize, notes, suiteId } = req.body;
  try {
    const unit = await prisma.hvacUnit.create({
      data: {
        label,
        serialNumber,
        model,
        installDate: new Date(installDate),
        filterSize,
        notes,
        suiteId,
}
    })
    res.status(201).json(unit)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.updateUnit = async (req, res) => {
  const id = parseInt(req.params.id);
  const {
    label,
    serialNumber,
    model,
    installDate,
    filterSize,
    notes,
    suiteId,
  } = req.body;

  try {
    const updated = await prisma.hvacUnit.update({
      where: { id },
      data: {
        ...(label !== undefined ? { label } : {}),
        ...(serialNumber !== undefined ? { serialNumber } : {}),
        ...(model !== undefined ? { model } : {}),
        ...(installDate !== undefined ? { installDate: new Date(installDate) } : {}),
        ...(filterSize !== undefined ? { filterSize } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(suiteId !== undefined ? { suiteId } : {}),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUnit = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    await prisma.hvacUnit.delete({ where: { id } })
    res.json({ message: 'HVAC unit deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}