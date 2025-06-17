// controllers/scheduledMaintenanceController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all scheduled maintenance for a suite
exports.getScheduledMaintenance = async (req, res) => {
  const { suiteId } = req.params;
  
  try {
    const scheduled = await prisma.scheduledMaintenance.findMany({
      where: { suiteId: parseInt(suiteId) },
      include: {
        hvacUnit: true,
        suite: {
          include: {
            property: true
          }
        },
        completedLog: true
      },
      orderBy: { date: 'asc' }
    });
    
    res.json(scheduled);
  } catch (error) {
    console.error('Error fetching scheduled maintenance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get ALL scheduled maintenance across all properties (NEW ENDPOINT)
exports.getAllScheduledMaintenance = async (req, res) => {
  try {
    const scheduled = await prisma.scheduledMaintenance.findMany({
      include: {
        hvacUnit: true,
        suite: {
          include: {
            property: true
          }
        },
        completedLog: true
      },
      orderBy: { date: 'asc' }
    });
    
    res.json(scheduled);
  } catch (error) {
    console.error('Error fetching all scheduled maintenance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new scheduled maintenance
exports.createScheduledMaintenance = async (req, res) => {
  const {
    date,
    time,
    maintenanceType,
    assignedTechnician,
    priority = 'MEDIUM',
    notes,
    reminderDays = 1,
    suiteId,
    hvacUnitId
  } = req.body;

  // Validation
  if (!date || !time || !maintenanceType || !assignedTechnician || !suiteId) {
    return res.status(400).json({ 
      error: 'Missing required fields: date, time, maintenanceType, assignedTechnician, suiteId' 
    });
  }

  try {
    const scheduled = await prisma.scheduledMaintenance.create({
      data: {
        date: new Date(date),
        time,
        maintenanceType,
        assignedTechnician,
        priority,
        notes,
        reminderDays,
        suiteId: parseInt(suiteId),
        hvacUnitId: hvacUnitId ? parseInt(hvacUnitId) : null,
        status: 'SCHEDULED' // Ensure status is set
      },
      include: {
        hvacUnit: true,
        suite: {
          include: {
            property: true
          }
        }
      }
    });

    res.status(201).json(scheduled);
  } catch (error) {
    console.error('Error creating scheduled maintenance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update scheduled maintenance
exports.updateScheduledMaintenance = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const scheduled = await prisma.scheduledMaintenance.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        ...(updateData.date && { date: new Date(updateData.date) }),
        ...(updateData.suiteId && { suiteId: parseInt(updateData.suiteId) }),
        ...(updateData.hvacUnitId && { hvacUnitId: parseInt(updateData.hvacUnitId) })
      },
      include: {
        hvacUnit: true,
        suite: {
          include: {
            property: true
          }
        },
        completedLog: true
      }
    });

    res.json(scheduled);
  } catch (error) {
    console.error('Error updating scheduled maintenance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark scheduled maintenance as completed
exports.completeScheduledMaintenance = async (req, res) => {
  const { id } = req.params;
  const { maintenanceLogId } = req.body;

  try {
    const scheduled = await prisma.scheduledMaintenance.update({
      where: { id: parseInt(id) },
      data: {
        status: 'COMPLETED',
        completedLogId: maintenanceLogId ? parseInt(maintenanceLogId) : null
      },
      include: {
        hvacUnit: true,
        suite: {
          include: {
            property: true
          }
        },
        completedLog: true
      }
    });

    res.json(scheduled);
  } catch (error) {
    console.error('Error completing scheduled maintenance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete scheduled maintenance
exports.deleteScheduledMaintenance = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.scheduledMaintenance.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Scheduled maintenance deleted' });
  } catch (error) {
    console.error('Error deleting scheduled maintenance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get upcoming maintenance (next 7 days)
exports.getUpcomingMaintenance = async (req, res) => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  try {
    const upcoming = await prisma.scheduledMaintenance.findMany({
      where: {
        date: {
          gte: today,
          lte: nextWeek
        },
        status: 'SCHEDULED'
      },
      include: {
        hvacUnit: true,
        suite: {
          include: {
            property: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(upcoming);
  } catch (error) {
    console.error('Error fetching upcoming maintenance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send reminder notifications (this would be called by a cron job)
exports.sendReminders = async (req, res) => {
  const today = new Date();
  
  try {
    // Get all scheduled maintenance that needs reminders
    const scheduledItems = await prisma.scheduledMaintenance.findMany({
      where: {
        status: 'SCHEDULED',
        date: {
          gte: today
        }
      },
      include: {
        hvacUnit: true,
        suite: {
          include: {
            property: true
          }
        }
      }
    });

    const reminders = [];
    
    scheduledItems.forEach(item => {
      const reminderDate = new Date(item.date);
      reminderDate.setDate(reminderDate.getDate() - item.reminderDays);
      
      // If today is the reminder date
      if (reminderDate.toDateString() === today.toDateString()) {
        reminders.push({
          id: item.id,
          technician: item.assignedTechnician,
          property: item.suite.property.name,
          suite: item.suite.name,
          date: item.date,
          time: item.time,
          type: item.maintenanceType,
          priority: item.priority
        });
      }
    });

    // In a real app, you'd send these via email, SMS, push notifications, etc.
    console.log('Reminders to send:', reminders);
    
    res.json({ 
      message: `${reminders.length} reminders processed`,
      reminders 
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    res.status(500).json({ error: error.message });
  }
};