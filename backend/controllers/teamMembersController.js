const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/team-members - Get all technicians (Enhanced for calendar)
exports.getTeamMembers = async (req, res) => {
  try {
    // Get all technicians from User table
    const teamMembers = await prisma.user.findMany({
      where: {
        role: 'TECHNICIAN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get job statistics for each team member
    const teamMembersWithStats = await Promise.all(
      teamMembers.map(async (member) => {
        const [totalJobs, activeJobs, completedJobs, todaysJobs] = await Promise.all([
          prisma.job.count({
            where: { assignedTechnician: member.name }
          }),
          prisma.job.count({
            where: { 
              assignedTechnician: member.name,
              status: { in: ['SCHEDULED', 'IN_PROGRESS', 'DISPATCHED'] }
            }
          }),
          prisma.job.count({
            where: { 
              assignedTechnician: member.name,
              status: 'COMPLETED'
            }
          }),
          prisma.job.count({
            where: { 
              assignedTechnician: member.name,
              scheduledDate: {
                gte: new Date(new Date().toDateString()), // Today start
                lt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000) // Tomorrow start
              }
            }
          })
        ]);

        return {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          initials: member.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
          totalJobs,
          activeJobs,
          completedJobs,
          todaysJobs,
          createdAt: member.createdAt,
          isActive: true
        };
      })
    );

    res.json(teamMembersWithStats);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ 
      error: 'Failed to fetch team members',
      details: error.message 
    });
  }
};

// POST /api/team-members - Create a new technician (Keep your existing functionality)
exports.createTeamMember = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Name and email are required' 
      });
    }

    const newTechnician = await prisma.user.create({
      data: {
        name,
        email,
        role: 'TECHNICIAN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json(newTechnician);
  } catch (error) {
    console.error('Error creating technician:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Email already exists' 
      });
    }

    res.status(500).json({ 
      error: 'Failed to create technician',
      details: error.message 
    });
  }
};

// GET /api/team-members/:id - Get specific technician (Enhanced)
exports.getTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    const technician = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
        role: 'TECHNICIAN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        maintenanceLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!technician) {
      return res.status(404).json({ 
        error: 'Technician not found' 
      });
    }

    // Get job statistics for this technician
    const [totalJobs, activeJobs, completedJobs, recentJobs] = await Promise.all([
      prisma.job.count({
        where: { assignedTechnician: technician.name }
      }),
      prisma.job.count({
        where: { 
          assignedTechnician: technician.name,
          status: { in: ['SCHEDULED', 'IN_PROGRESS', 'DISPATCHED'] }
        }
      }),
      prisma.job.count({
        where: { 
          assignedTechnician: technician.name,
          status: 'COMPLETED'
        }
      }),
      prisma.job.findMany({
        where: { assignedTechnician: technician.name },
        include: {
          property: true,
          suite: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const technicianWithStats = {
      ...technician,
      initials: technician.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      totalJobs,
      activeJobs,
      completedJobs,
      recentJobs
    };

    res.json(technicianWithStats);
  } catch (error) {
    console.error('Error fetching technician:', error);
    res.status(500).json({ 
      error: 'Failed to fetch technician',
      details: error.message 
    });
  }
};

// GET /api/team-members/:id/jobs - Get jobs for a team member
exports.getTeamMemberJobs = async (req, res) => {
  const { id } = req.params;
  const { 
    status, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 20 
  } = req.query;

  try {
    // First get the technician to get their name
    const technician = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
        role: 'TECHNICIAN'
      },
      select: { name: true }
    });

    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    const whereClause = {
      assignedTechnician: technician.name
    };

    // Status filtering
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Date filtering
    if (startDate) {
      whereClause.scheduledDate = {
        ...whereClause.scheduledDate,
        gte: new Date(startDate)
      };
    }
    if (endDate) {
      whereClause.scheduledDate = {
        ...whereClause.scheduledDate,
        lte: new Date(endDate)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        include: {
          property: true,
          suite: true,
          hvacUnit: true
        },
        orderBy: [
          { scheduledDate: 'desc' },
          { scheduledTime: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.job.count({ where: whereClause })
    ]);

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
    console.error('Error fetching team member jobs:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/team-members/schedule - Get schedule for all team members
exports.getTeamSchedule = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  try {
    // Get all technicians
    const technicians = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      select: { id: true, name: true }
    });

    const whereClause = {
      assignedTechnician: { 
        in: technicians.map(t => t.name)
      }
    };

    if (startDate && endDate) {
      whereClause.scheduledDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
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
        }
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' }
      ]
    });

    // Group by technician
    const schedule = jobs.reduce((acc, job) => {
      const tech = job.assignedTechnician;
      if (!acc[tech]) {
        acc[tech] = [];
      }
      acc[tech].push({
        id: job.id,
        jobNumber: job.jobNumber,
        title: job.title,
        status: job.status,
        priority: job.priority,
        scheduledDate: job.scheduledDate,
        scheduledTime: job.scheduledTime,
        estimatedDuration: job.estimatedDuration,
        property: job.property,
        suite: job.suite
      });
      return acc;
    }, {});

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching team schedule:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/team-members/availability - Check team availability
exports.getTeamAvailability = async (req, res) => {
  const { date, startTime, endTime } = req.query;
  
  try {
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Get all technicians
    const technicians = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      select: { id: true, name: true }
    });

    // Get all jobs for the specified date
    const dateStart = new Date(date);
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);

    const jobs = await prisma.job.findMany({
      where: {
        scheduledDate: {
          gte: dateStart,
          lt: dateEnd
        },
        assignedTechnician: { 
          in: technicians.map(t => t.name)
        },
        status: { in: ['SCHEDULED', 'IN_PROGRESS', 'DISPATCHED'] }
      },
      select: {
        assignedTechnician: true,
        scheduledTime: true,
        estimatedDuration: true
      }
    });

    // Calculate availability for each technician
    const availability = technicians.map(tech => {
      const techJobs = jobs.filter(job => 
        job.assignedTechnician === tech.name
      );

      const isAvailable = !techJobs.some(job => {
        if (!job.scheduledTime) return false;
        
        const jobStart = job.scheduledTime;
        const jobDuration = job.estimatedDuration || 120;
        const jobEndTime = new Date();
        const [hours, minutes] = jobStart.split(':');
        jobEndTime.setHours(parseInt(hours), parseInt(minutes) + jobDuration);
        const jobEnd = `${jobEndTime.getHours().toString().padStart(2, '0')}:${jobEndTime.getMinutes().toString().padStart(2, '0')}`;

        // Check for time conflicts
        if (startTime && endTime) {
          return (startTime < jobEnd && endTime > jobStart);
        }
        
        return false;
      });

      return {
        id: tech.id,
        name: tech.name,
        isAvailable,
        jobCount: techJobs.length,
        jobs: techJobs
      };
    });

    res.json(availability);
  } catch (error) {
    console.error('Error checking team availability:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTeamMembers: exports.getTeamMembers,
  createTeamMember: exports.createTeamMember,
  getTeamMember: exports.getTeamMember,
  getTeamMemberJobs: exports.getTeamMemberJobs,
  getTeamSchedule: exports.getTeamSchedule,
  getTeamAvailability: exports.getTeamAvailability
};