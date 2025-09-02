const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to generate unique job number
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

// Helper function to update job totals
const updateJobTotals = async (jobId) => {
  try {
    // Calculate totals from line items
    const lineItems = await prisma.jobLineItem.findMany({
      where: { jobId: parseInt(jobId) }
    });

    const totalPrice = lineItems.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0);
    const totalCost = lineItems.reduce((sum, item) => sum + (parseFloat(item.totalCost) || 0), 0);
    const profitMargin = totalPrice > 0 ? ((totalPrice - totalCost) / totalPrice * 100) : 0;

    // Update the job with calculated totals
    await prisma.job.update({
      where: { id: parseInt(jobId) },
      data: {
        totalPrice: totalPrice,
        totalCost: totalCost,
        profitMargin: profitMargin
      }
    });

    return { totalPrice, totalCost, profitMargin };
  } catch (error) {
    console.error('Error updating job totals:', error);
    throw error;
  }
};

// GET /api/jobs - Get all jobs (MATCHES your route: controller.getAllJobs)
exports.getAllJobs = async (req, res) => {
  const { 
    startDate, 
    endDate, 
    status, 
    assignedTechnician, 
    propertyId,
    unscheduledOnly,
    page = 1,
    limit = 100 
  } = req.query;

  try {
    const whereClause = {};
    
    // Date filtering for calendar views
    if (startDate && endDate) {
      whereClause.OR = [
        {
          scheduledDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        {
          scheduledDate: null // Include unscheduled jobs
        }
      ];
    } else if (startDate) {
      whereClause.scheduledDate = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.scheduledDate = {
        lte: new Date(endDate)
      };
    }

    // Filter for unscheduled jobs only
    if (unscheduledOnly === 'true') {
      whereClause.scheduledDate = null;
    }

    // Status filtering
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Technician filtering
    if (assignedTechnician && assignedTechnician !== 'all') {
      whereClause.assignedTechnician = {
        contains: assignedTechnician,
        mode: 'insensitive'
      };
    }

    // Property filtering
    if (propertyId) {
      whereClause.propertyId = parseInt(propertyId);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        include: {
          property: true,
          suite: true,
          hvacUnit: true,
          lineItems: {
            include: {
              service: true
            }
          },
          materials: {
            orderBy: {
              createdAt: "desc"
            }
          },
          timeEntries: {
            orderBy: {
              startTime: "desc"
            }
          },
          photos: {
            orderBy: {
              createdAt: "desc"
            }
          }
        },
        orderBy: [
          { scheduledDate: 'asc' },
          { scheduledTime: 'asc' },
          { createdAt: 'desc' }
        ],
        skip: skip,
        take: parseInt(limit)
      }),
      prisma.job.count({ where: whereClause })
    ]);

    // For calendar requests, return array directly (backward compatibility)
    if (req.originalUrl.includes('calendar') || req.query.format === 'calendar') {
      // Transform data for calendar optimization
      const transformedJobs = jobs.map(job => ({
        id: job.id,
        jobNumber: job.jobNumber,
        title: job.title,
        description: job.description,
        status: job.status,
        priority: job.priority,
        workType: job.workType,
        assignedTechnician: job.assignedTechnician,
        scheduledDate: job.scheduledDate ? job.scheduledDate.toISOString().split('T')[0] : null,
        scheduledTime: job.scheduledTime,
        estimatedDuration: job.estimatedDuration,
        totalPrice: job.totalPrice,
        totalCost: job.totalCost,
        property: job.property,
        suite: job.suite,
        hvacUnit: job.hvacUnit,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      }));
      return res.json(transformedJobs);
    }

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

// GET /api/jobs/:id - Get single job (MATCHES your route: controller.getJobById)
exports.getJobById = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: {
        property: true,
        suite: true,
        hvacUnit: true,
        lineItems: {
          include: {
            service: true
          }
        },
        materials: {
          orderBy: {
            createdAt: "desc"
          }
        },
        timeEntries: {
          orderBy: {
            startTime: "desc"
          }
        },
        photos: {
          orderBy: {
            createdAt: "desc"
          }
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

// POST /api/jobs - Create new job (MATCHES your route: controller.createJob)
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
    estimatedPrice,
    laborRate,
    customerNotes,
    internalNotes,
    lineItems = []
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
    
    // Calculate totals from line items
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
        priority,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : totalCost,
        totalCost: totalCost,
        totalPrice: totalPrice,
        profitMargin: profitMargin,
        laborRate: laborRate ? parseFloat(laborRate) : null,
        customerNotes: customerNotes || null,
        internalNotes: internalNotes || null,
        ...(lineItems.length > 0 && {
          lineItems: {
            create: lineItems.map(item => ({
              serviceId: item.serviceId || null,
              serviceName: item.serviceName || item.name || 'Unknown Service',
              description: item.description || '',
              quantity: parseFloat(item.quantity) || 1,
              unitPrice: parseFloat(item.unitPrice) || 0,
              totalPrice: parseFloat(item.totalPrice) || 0,
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
        lineItems: {
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

// PUT /api/jobs/:id - Update job (MATCHES your route: controller.updateJob)
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
      ...(updateData.laborRate && { laborRate: parseFloat(updateData.laborRate) })
    };

    // Add status-specific timestamps
    if (updateData.status === 'IN_PROGRESS' && !processedData.startedAt) {
      processedData.startedAt = new Date();
    }
    if (updateData.status === 'COMPLETED' && !processedData.completedAt) {
      processedData.completedAt = new Date();
    }

    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: processedData,
      include: {
        property: true,
        suite: true,
        hvacUnit: true,
        lineItems: {
          include: {
            service: true
          }
        }
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/jobs/:id - Delete job (MATCHES your route: controller.deleteJob)
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

// PATCH /api/jobs/:id/status - Update job status (MATCHES your route: controller.updateJobStatus)
exports.updateJobStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updateData = { status };

    // Add status-specific timestamps
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

// POST /api/jobs/:id/start - Start job (MATCHES your route: controller.startJob)
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

// POST /api/jobs/:id/complete - Complete job (MATCHES your route: controller.completeJob)
exports.completeJob = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await prisma.job.update({
      where: { id: parseInt(id) },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      },
      include: {
        property: true,
        suite: true,
        hvacUnit: true
      }
    });

    res.json(job);
  } catch (error) {
    console.error('Error completing job:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/jobs/stats - Dashboard statistics (MATCHES your route: controller.getDashboardStats)
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // For late jobs calculation
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    // For upcoming recurring jobs
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const [
      // Existing basic stats
      totalJobs,
      scheduledJobs,
      inProgressJobs,
      completedThisWeek,
      
      // NEW: Late jobs
      lateJobs,
      
      // NEW: Recurring job stats (optional - only if you want recurring stats)
      recurringTemplates,
      autoGeneratedJobs,
      upcomingRecurringJobs,
      totalRecurringJobs
    ] = await Promise.all([
      // Basic job counts
      prisma.job.count(),
      
      prisma.job.count({
        where: { status: { in: ['SCHEDULED', 'DISPATCHED'] } }
      }),
      
      prisma.job.count({
        where: { status: 'IN_PROGRESS' }
      }),
      
      prisma.job.count({
        where: {
          status: 'COMPLETED',
          scheduledDate: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        }
      }),

      // Late Jobs - jobs scheduled in the past but not completed
      prisma.job.count({
        where: {
          scheduledDate: {
            lt: startOfToday
          },
          status: {
            in: ['SCHEDULED', 'DISPATCHED', 'IN_PROGRESS']
          }
        }
      }),

      // Recurring Templates (count of active templates)
      prisma.recurringJobTemplate.count({
        where: { isActive: true }
      }),

      // Auto-generated jobs this week
      prisma.job.count({
        where: {
          isRecurring: true,
          createdAt: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        }
      }),

      // Upcoming recurring jobs (next 7 days)
      prisma.job.count({
        where: {
          isRecurring: true,
          status: { in: ['SCHEDULED', 'DISPATCHED'] },
          scheduledDate: {
            gte: new Date(),
            lte: next7Days
          }
        }
      }),

      // Total recurring jobs ever created (for automation rate calculation)
      prisma.job.count({
        where: { isRecurring: true }
      })
    ]);

    // Calculate automation rate (percentage of jobs that are auto-generated)
    const automationRate = totalJobs > 0 
      ? Math.round((totalRecurringJobs / totalJobs) * 100)
      : 0;

    const stats = {
      // Basic stats (existing)
      totalJobs,
      scheduledJobs,
      inProgressJobs,
      completedThisWeek,
      
      // NEW: Late jobs
      lateJobs,
      
      // NEW: Recurring stats (include these if you want recurring features)
      recurringTemplates,
      autoGeneratedJobs,
      upcomingRecurring: upcomingRecurringJobs,
      automationRate
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// OPTIONAL: ADD this function for a dedicated late jobs page
exports.getLateJobs = async (req, res) => {
  try {
    const { severity = 'all' } = req.query;
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    // Define date filter based on severity
    let dateFilter;
    switch (severity) {
      case 'critical':
        // More than 2 days overdue
        dateFilter = { lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) };
        break;
      case 'moderate':
        // 1-2 days overdue
        dateFilter = { 
          lt: startOfToday,
          gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        };
        break;
      default:
        // All overdue jobs
        dateFilter = { lt: startOfToday };
    }

    const lateJobs = await prisma.job.findMany({
      where: {
        scheduledDate: dateFilter,
        status: { in: ['SCHEDULED', 'DISPATCHED', 'IN_PROGRESS'] }
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        suite: {
          select: {
            id: true,
            name: true
          }
        },
        hvacUnit: {
          select: {
            id: true,
            model: true,
            serial: true
          }
        }
      },
      orderBy: [
        { scheduledDate: 'asc' }, // Most overdue first
        { priority: 'desc' }      // Then by priority
      ]
    });

    // Add days late calculation to each job
    const jobsWithLateness = lateJobs.map(job => {
      const daysLate = Math.floor((now - new Date(job.scheduledDate)) / (1000 * 60 * 60 * 24));
      
      return {
        ...job,
        daysLate,
        urgencyLevel: daysLate > 7 ? 'critical' : daysLate > 2 ? 'high' : 'moderate'
      };
    });

    res.json(jobsWithLateness);
  } catch (error) {
    console.error('Error fetching late jobs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add this function to your jobsController.js (temporary for debugging)

exports.debugJobs = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    console.log('🔍 Current time:', now);
    console.log('🔍 Start of today:', startOfToday);
    
    // Get all jobs with key fields
    const allJobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        scheduledDate: true,
        status: true,
        createdAt: true
      },
      orderBy: { scheduledDate: 'asc' }
    });
    
    console.log('🔍 All jobs raw data:', allJobs);
    
    // Check each job manually
    const analysis = allJobs.map(job => {
      const scheduledDate = job.scheduledDate ? new Date(job.scheduledDate) : null;
      const isBeforeToday = scheduledDate ? scheduledDate < startOfToday : false;
      const hasValidStatus = ['SCHEDULED', 'DISPATCHED', 'IN_PROGRESS'].includes(job.status);
      const shouldBeLate = isBeforeToday && hasValidStatus;
      
      return {
        id: job.id,
        title: job.title,
        scheduledDate: job.scheduledDate,
        scheduledDateParsed: scheduledDate,
        status: job.status,
        isBeforeToday,
        hasValidStatus,
        shouldBeLate,
        daysLate: scheduledDate ? Math.floor((now - scheduledDate) / (1000 * 60 * 60 * 24)) : null
      };
    });
    
    console.log('🔍 Job analysis:', analysis);
    
    const lateJobsCount = analysis.filter(job => job.shouldBeLate).length;
    console.log('🔍 Late jobs count should be:', lateJobsCount);
    
    // Also test the actual query
    const actualLateQuery = await prisma.job.count({
      where: {
        scheduledDate: {
          lt: startOfToday
        },
        status: {
          in: ['SCHEDULED', 'DISPATCHED', 'IN_PROGRESS']
        }
      }
    });
    
    console.log('🔍 Actual late query result:', actualLateQuery);
    
    res.json({
      currentTime: now,
      startOfToday,
      allJobs: analysis,
      shouldBeLateCount: lateJobsCount,
      actualQueryResult: actualLateQuery
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllJobs: exports.getAllJobs,
  getJobById: exports.getJobById,
  createJob: exports.createJob,
  updateJob: exports.updateJob,
  deleteJob: exports.deleteJob,
  updateJobStatus: exports.updateJobStatus,
  startJob: exports.startJob,
  completeJob: exports.completeJob,
  getDashboardStats: exports.getDashboardStats,
  getLateJobs: exports.getLateJobs,
  debugJobs: exports.debugJobs  // ← ADD THIS LINE (temporary)
};