// controllers/jobsController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate unique job number (DC-2025-001 format)
const generateJobNumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `DC-${currentYear}-`;
  
  // Find the highest job number for current year
  const lastJob = await prisma.job.findFirst({
    where: {
      jobNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      jobNumber: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastJob) {
    const lastNumber = parseInt(lastJob.jobNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
};

// GET /api/jobs - List all jobs with filters
exports.getAllJobs = async (req, res) => {
  try {
    const { 
      status, 
      propertyId, 
      suiteId, 
      assignedTechnician, 
      priority,
      startDate,
      endDate,
      workType,
      page = 1,
      limit = 50
    } = req.query;

    const where = {};
    
    // Apply filters
    if (status) where.status = status;
    if (propertyId) where.propertyId = parseInt(propertyId);
    if (suiteId) where.suiteId = parseInt(suiteId);
    if (assignedTechnician) where.assignedTechnician = { contains: assignedTechnician, mode: 'insensitive' };
    if (priority) where.priority = priority;
    if (workType) where.workType = workType;
    
    // Date range filter
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = new Date(startDate);
      if (endDate) where.scheduledDate.lte = new Date(endDate);
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        property: true,
        suite: true,
        hvacUnit: true,
        lineItems: {           // ADD THIS SECTION
          include: {
            service: true
          }
        },
        materials: true,
        timeEntries: true,
        photos: true,
        _count: {
          select: {
            materials: true,
            timeEntries: true,
            photos: true,
            lineItems: true    // ADD THIS LINE
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Scheduled jobs first
        { scheduledDate: 'asc' },
        { createdAt: 'desc' }
      ],
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    // Get total count for pagination
    const totalCount = await prisma.job.count({ where });

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/jobs/:id - Get specific job with full details
exports.getJobById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: {
        property: true,
        suite: true,
        hvacUnit: true,
        materials: {
          orderBy: { createdAt: 'desc' }
        },
        timeEntries: {
          orderBy: { startTime: 'desc' }
        },
        photos: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/jobs - Create new job
exports.createJob = async (req, res) => {
  const {
    title,
    description,
    scheduledDate,
    scheduledTime,
    estimatedDuration,
    assignedTechnician,
    propertyId,
    suiteId,
    hvacUnitId,
    workType,
    priority = 'MEDIUM',
    estimatedCost,
    laborRate,
    customerNotes,
    internalNotes,
    lineItems = [] // ADD THIS LINE - Services from CreateJobModal
  } = req.body;

  // Validation
  if (!title || !propertyId || !workType) {
    return res.status(400).json({ 
      error: 'Missing required fields: title, propertyId, workType' 
    });
  }

  try {
    // Generate unique job number
    const jobNumber = await generateJobNumber();
    
    // Map work type to maintenance type for compatibility
    const workTypeToMaintenanceType = {
      'HVAC_INSPECTION': 'INSPECTION',
      'HVAC_FILTER_CHANGE': 'FILTER_CHANGE',
      'HVAC_FULL_SERVICE': 'FULL_SERVICE',
      'HVAC_REPAIR': 'REPAIR',
      'CLEANING': 'OTHER',
      'LANDSCAPING': 'OTHER',
      'SNOW_REMOVAL': 'OTHER',
      'PLUMBING': 'OTHER',
      'ELECTRICAL': 'OTHER'
    };
    
    const maintenanceType = workTypeToMaintenanceType[workType] || 'OTHER';

    // Calculate totals from line items (ADD THIS SECTION)
    const totalPrice = lineItems.reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0);
    const totalCost = lineItems.reduce((sum, item) => sum + parseFloat(item.totalCost || 0), 0);
    const profitMargin = totalPrice > 0 ? ((totalPrice - totalCost) / totalPrice * 100) : 0;

    const job = await prisma.job.create({
      data: {
        jobNumber,
        title,
        description,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime,
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
        assignedTechnician,
        propertyId: parseInt(propertyId),
        suiteId: suiteId ? parseInt(suiteId) : null,
        hvacUnitId: hvacUnitId ? parseInt(hvacUnitId) : null,
        workType,
        maintenanceType,
        priority,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : totalCost, // MODIFY THIS LINE
        totalCost: totalCost,           // ADD THIS LINE
        totalPrice: totalPrice,         // ADD THIS LINE
        profitMargin: profitMargin,     // ADD THIS LINE
        laborRate: laborRate ? parseFloat(laborRate) : null,
        customerNotes,
        internalNotes,
        // ADD THIS SECTION - Create line items
        ...(lineItems.length > 0 && {
          lineItems: {
            create: lineItems.map(item => ({
              serviceId: item.serviceId || null,
              serviceName: item.serviceName,
              description: item.description,
              quantity: parseFloat(item.quantity),
              unitPrice: parseFloat(item.unitPrice),
              totalPrice: parseFloat(item.totalPrice),
              unitCost: parseFloat(item.unitCost || 0),
              totalCost: parseFloat(item.totalCost || 0)
            }))
          }
        })
      },
      include: {
        property: true,
        suite: true,
        hvacUnit: true,
        lineItems: {           // ADD THIS SECTION
          include: {
            service: true
          }
        }
      }
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/jobs/:id - Update job
exports.updateJob = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Process data types
    const processedData = {
      ...updateData,
      ...(updateData.scheduledDate && { scheduledDate: new Date(updateData.scheduledDate) }),
      ...(updateData.propertyId && { propertyId: parseInt(updateData.propertyId) }),
      ...(updateData.suiteId && { suiteId: parseInt(updateData.suiteId) }),
      ...(updateData.hvacUnitId && { hvacUnitId: parseInt(updateData.hvacUnitId) }),
      ...(updateData.estimatedDuration && { estimatedDuration: parseInt(updateData.estimatedDuration) }),
      ...(updateData.estimatedCost && { estimatedCost: parseFloat(updateData.estimatedCost) }),
      ...(updateData.actualCost && { actualCost: parseFloat(updateData.actualCost) }),
      ...(updateData.laborHours && { laborHours: parseFloat(updateData.laborHours) }),
      ...(updateData.laborRate && { laborRate: parseFloat(updateData.laborRate) })
    };

    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: processedData,
      include: {
        property: true,
        suite: true,
        hvacUnit: true,
        materials: true,
        timeEntries: true,
        photos: true
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/jobs/:id/status - Update job status
exports.updateJobStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updateData = { status };
    
    // Set timestamps based on status
    if (status === 'IN_PROGRESS') {
      updateData.startedAt = new Date();
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        property: true,
        suite: true,
        hvacUnit: true
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Error updating job status:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/jobs/:id/start - Start job
exports.startJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date()
      },
      include: {
        property: true,
        suite: true,
        hvacUnit: true
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Error starting job:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/jobs/:id/complete - Complete job
exports.completeJob = async (req, res) => {
  const { id } = req.params;
  const { technicianNotes, actualCost, laborHours } = req.body;

  try {
    const updateData = {
      status: 'COMPLETED',
      completedAt: new Date()
    };

    if (technicianNotes) updateData.technicianNotes = technicianNotes;
    if (actualCost) updateData.actualCost = parseFloat(actualCost);
    if (laborHours) updateData.laborHours = parseFloat(laborHours);

    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        property: true,
        suite: true,
        hvacUnit: true,
        materials: true,
        timeEntries: true
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Error completing job:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/jobs/:id - Delete job
exports.deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.job.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/jobs/dashboard/stats - Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalJobs,
      scheduledJobs,
      inProgressJobs,
      completedThisWeek,
      revenueThisMonth
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'SCHEDULED' } }),
      prisma.job.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.job.count({ 
        where: { 
          status: 'COMPLETED',
          completedAt: { gte: thisWeek }
        } 
      }),
      prisma.job.aggregate({
        where: {
          status: { in: ['COMPLETED', 'INVOICED', 'CLOSED'] },
          completedAt: { gte: thisMonth }
        },
        _sum: { actualCost: true }
      })
    ]);

    res.json({
      totalJobs,
      scheduledJobs,
      inProgressJobs,
      completedThisWeek,
      revenueThisMonth: revenueThisMonth._sum.actualCost || 0
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};