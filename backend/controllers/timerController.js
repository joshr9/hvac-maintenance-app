// controllers/timerController.js - FIXED VERSION
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get active timer for a specific worker/technician
 */
exports.getActiveTimer = async (req, res) => {
  try {
    const { technicianName } = req.params;
    
    const activeTimer = await prisma.jobTimeEntry.findFirst({
      where: {
        technicianName: technicianName,
        endTime: null // Still running
      },
      include: {
        job: {
          include: {
            property: { select: { id: true, name: true, address: true } },
            suite: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    if (!activeTimer) {
      return res.json({ activeTimer: null });
    }

    // Calculate elapsed time
    const elapsed = Math.floor((new Date() - new Date(activeTimer.startTime)) / 1000);
    
    res.json({
      activeTimer: {
        ...activeTimer,
        elapsedSeconds: elapsed
      }
    });
  } catch (error) {
    console.error('Error fetching active timer:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Start timer for a job (auto-stops any existing timer)
 */
exports.startTimer = async (req, res) => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id);
    const { technicianName, notes } = req.body;

    if (!technicianName) {
      return res.status(400).json({ error: 'Technician name is required' });
    }

    if (!jobId || isNaN(jobId)) {
      return res.status(400).json({ error: 'Valid job ID is required' });
    }

    // Start transaction for auto-stop logic
    const result = await prisma.$transaction(async (tx) => {
      // 1. Auto-stop any existing timer for this technician
      const existingTimer = await tx.jobTimeEntry.findFirst({
        where: {
          technicianName: technicianName,
          endTime: null
        }
      });

      if (existingTimer) {
        const endTime = new Date();
        const totalMinutes = Math.floor(
          (endTime - new Date(existingTimer.startTime)) / (1000 * 60)
        );

        await tx.jobTimeEntry.update({
          where: { id: existingTimer.id },
          data: {
            endTime,
            totalMinutes,
            notes: existingTimer.notes 
              ? `${existingTimer.notes} | Auto-stopped when starting new job`
              : 'Auto-stopped when starting new job'
          }
        });

        // Update previous job status if it was in progress
        await tx.job.updateMany({
          where: {
            id: existingTimer.jobId,
            status: 'IN_PROGRESS'
          },
          data: { status: 'SCHEDULED' }
        });
      }

      // 2. Start new timer
      const newTimer = await tx.jobTimeEntry.create({
        data: {
          jobId: jobId,
          technicianName,
          startTime: new Date(),
          notes: notes || null
        },
        include: {
          job: {
            include: {
              property: { select: { id: true, name: true, address: true } },
              suite: { select: { id: true, name: true } }
            }
          }
        }
      });

      // 3. Update job status to IN_PROGRESS
      await tx.job.update({
        where: { id: jobId },
        data: { 
          status: 'IN_PROGRESS',
          startedAt: new Date()
        }
      });

      return newTimer;
    });

    res.json({
      success: true,
      timer: result,
      message: 'Timer started successfully'
    });

  } catch (error) {
    console.error('Error starting timer:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Stop timer for a job
 */
exports.stopTimer = async (req, res) => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id);
    const { technicianName, notes } = req.body;

    if (!technicianName) {
      return res.status(400).json({ error: 'Technician name is required' });
    }

    if (!jobId || isNaN(jobId)) {
      return res.status(400).json({ error: 'Valid job ID is required' });
    }

    // Find active timer for this job and technician
    const activeTimer = await prisma.jobTimeEntry.findFirst({
      where: {
        jobId: jobId,
        technicianName: technicianName,
        endTime: null
      }
    });

    if (!activeTimer) {
      return res.status(404).json({ error: 'No active timer found for this job' });
    }

    // Stop the timer
    const endTime = new Date();
    const totalMinutes = Math.floor(
      (endTime - new Date(activeTimer.startTime)) / (1000 * 60)
    );

    const stoppedTimer = await prisma.jobTimeEntry.update({
      where: { id: activeTimer.id },
      data: {
        endTime,
        totalMinutes,
        notes: notes || activeTimer.notes
      },
      include: {
        job: {
          include: {
            property: { select: { id: true, name: true, address: true } },
            suite: { select: { id: true, name: true } }
          }
        }
      }
    });

    // Update job status back to SCHEDULED (unless user wants to complete it)
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'SCHEDULED' }
    });

    res.json({
      success: true,
      timer: stoppedTimer,
      totalMinutes,
      message: 'Timer stopped successfully'
    });

  } catch (error) {
    console.error('Error stopping timer:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get timer history for a job
 */
exports.getJobTimers = async (req, res) => {
  try {
    const { id } = req.params;
    const jobId = parseInt(id);

    if (!jobId || isNaN(jobId)) {
      return res.status(400).json({ error: 'Valid job ID is required' });
    }

    const timers = await prisma.jobTimeEntry.findMany({
      where: { jobId: jobId },
      orderBy: { startTime: 'desc' }
    });

    // Calculate total time worked
    const totalMinutes = timers.reduce((sum, timer) => {
      return sum + (timer.totalMinutes || 0);
    }, 0);

    res.json({
      success: true,
      timers,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 100) / 100
    });

  } catch (error) {
    console.error('Error fetching job timers:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all time entries for a technician (for TimeHistoryPage)
 */
exports.getAllTimeEntriesForTechnician = async (req, res) => {
  try {
    const { technicianName } = req.params;

    const timeEntries = await prisma.jobTimeEntry.findMany({
      where: {
        technicianName: technicianName
      },
      include: {
        job: {
          include: {
            property: { select: { id: true, name: true, address: true } },
            suite: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { startTime: 'desc' },
      take: 500 // Limit to last 500 entries
    });

    // Transform data to match frontend expectations
    const formattedEntries = timeEntries.map(entry => ({
      id: entry.id,
      jobId: entry.jobId,
      technicianName: entry.technicianName,
      startTime: entry.startTime,
      endTime: entry.endTime,
      totalMinutes: entry.totalMinutes || 0,
      notes: entry.notes,
      createdAt: entry.createdAt,
      jobTitle: entry.job?.title || `Job #${entry.jobId}`,
      propertyAddress: entry.job?.property?.name || entry.job?.property?.address || 'Unknown Property'
    }));

    res.json({
      success: true,
      entries: formattedEntries
    });

  } catch (error) {
    console.error('Error fetching time entries for technician:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch time entries' 
    });
  }
};

/**
 * Update/Edit a time entry
 */
exports.updateTimeEntry = async (req, res) => {
  try {
    const { timerId } = req.params;
    const timerIdInt = parseInt(timerId);
    const { startTime, endTime, notes, totalMinutes } = req.body;

    if (!timerIdInt || isNaN(timerIdInt)) {
      return res.status(400).json({ error: 'Valid timer ID is required' });
    }

    const updatedTimer = await prisma.jobTimeEntry.update({
      where: { id: timerIdInt },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        notes,
        totalMinutes: totalMinutes || undefined
      }
    });

    res.json({
      success: true,
      timer: updatedTimer,
      message: 'Time entry updated successfully'
    });

  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ FIXED: Added missing comma and proper module exports
module.exports = {
  getActiveTimer: exports.getActiveTimer,
  startTimer: exports.startTimer,
  stopTimer: exports.stopTimer,
  getJobTimers: exports.getJobTimers,
  updateTimeEntry: exports.updateTimeEntry,
  getAllTimeEntriesForTechnician: exports.getAllTimeEntriesForTechnician
};