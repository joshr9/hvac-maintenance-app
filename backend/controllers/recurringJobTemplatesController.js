// controllers/recurringJobTemplatesController.js - Complete Controller
const { PrismaClient } = require('@prisma/client');
const moment = require('moment');

const prisma = new PrismaClient();

// GET /api/recurring-job-templates - Get all templates
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await prisma.recurringJobTemplate.findMany({
      include: {
        zone: true,
        property: true,
        _count: {
          select: {
            generatedJobs: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/recurring-job-templates/:id - Get template by ID
exports.getTemplateById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const template = await prisma.recurringJobTemplate.findUnique({
      where: { id: parseInt(id) },
      include: {
        zone: true,
        property: true,
        generatedJobs: {
          include: {
            property: true
          },
          orderBy: { scheduledDate: 'desc' },
          take: 10
        }
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/recurring-job-templates - Create new template
exports.createTemplate = async (req, res) => {
  const {
    name,
    description,
    workType,
    frequency,
    dayOfWeek,
    dayOfMonth,
    timeOfDay,
    estimatedDuration,
    priority,
    assignedTechnician,
    zoneId,
    propertyId
  } = req.body;

  if (!name || !workType || !frequency) {
    return res.status(400).json({ 
      error: 'Name, work type, and frequency are required' 
    });
  }

  try {
    const template = await prisma.recurringJobTemplate.create({
      data: {
        name,
        description,
        workType,
        frequency,
        dayOfWeek: dayOfWeek || null,
        dayOfMonth: dayOfMonth || null,
        timeOfDay,
        estimatedDuration,
        priority: priority || 'MEDIUM',
        assignedTechnician,
        zoneId: zoneId || null,
        propertyId: propertyId || null
      },
      include: {
        zone: true,
        property: true
      }
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/recurring-job-templates/:id - Update template
exports.updateTemplate = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    workType,
    frequency,
    dayOfWeek,
    dayOfMonth,
    timeOfDay,
    estimatedDuration,
    priority,
    assignedTechnician,
    isActive
  } = req.body;

  try {
    const template = await prisma.recurringJobTemplate.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(workType && { workType }),
        ...(frequency && { frequency }),
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(dayOfMonth !== undefined && { dayOfMonth }),
        ...(timeOfDay && { timeOfDay }),
        ...(estimatedDuration && { estimatedDuration }),
        ...(priority && { priority }),
        ...(assignedTechnician !== undefined && { assignedTechnician }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        zone: true,
        property: true
      }
    });

    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/recurring-job-templates/:id - Delete template
exports.deleteTemplate = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if template has generated jobs
    const template = await prisma.recurringJobTemplate.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            generatedJobs: true
          }
        }
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template._count.generatedJobs > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete template that has generated jobs. Please remove jobs first or deactivate template.'
      });
    }

    await prisma.recurringJobTemplate.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/recurring-job-templates/generate - Generate jobs from specific template
exports.generateJobsFromTemplate = async (req, res) => {
  const { templateId } = req.body;
  const { startDate, weeks = 1 } = req.query;

  try {
    const template = await prisma.recurringJobTemplate.findUnique({
      where: { id: parseInt(templateId) },
      include: {
        zone: {
          include: {
            properties: {
              include: {
                property: true
              }
            }
          }
        },
        property: true
      }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const generatedJobs = [];
    const start = startDate ? 
      moment(startDate) : moment().startOf('week');

    // Get target properties
    let targetProperties = [];
    if (template.zoneId) {
      targetProperties = template.zone.properties.map(pz => pz.property);
    } else if (template.propertyId) {
      targetProperties = [template.property];
    }

    // Generate jobs for specified weeks
    for (let week = 0; week < weeks; week++) {
      const weekStart = start.clone().add(week, 'weeks');
      
      for (const property of targetProperties) {
        const jobDate = calculateJobDate(template, weekStart);
        
        if (jobDate) {
          // Check if job already exists for this date/property/template
          const existingJob = await prisma.job.findFirst({
            where: {
              recurringTemplateId: template.id,
              propertyId: property.id,
              scheduledDate: jobDate.toDate()
            }
          });

          if (!existingJob) {
            const job = await createJobFromTemplate(template, property, jobDate);
            generatedJobs.push(job);
          }
        }
      }
    }

    // Update template's lastGenerated timestamp
    await prisma.recurringJobTemplate.update({
      where: { id: template.id },
      data: { lastGenerated: new Date() }
    });

    res.json({
      message: `Generated ${generatedJobs.length} jobs`,
      jobs: generatedJobs
    });

  } catch (error) {
    console.error('Error generating jobs:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/recurring-job-templates/generate-all - Generate jobs from all templates
exports.generateJobsFromAllTemplates = async (req, res) => {
  const startTime = new Date();
  
  try {
    console.log('🔄 Starting batch job generation from all templates...');
    
    // Get all active templates with their relationships
    const templates = await prisma.recurringJobTemplate.findMany({
      where: { isActive: true },
      include: {
        zone: {
          include: {
            properties: {
              include: {
                property: true
              }
            }
          }
        },
        property: true
      }
    });

    if (templates.length === 0) {
      return res.json({
        message: 'No active templates found',
        templatesProcessed: 0,
        jobsGenerated: 0,
        errors: 0,
        duration: new Date() - startTime
      });
    }

    console.log(`📋 Found ${templates.length} active recurring templates`);

    let totalGenerated = 0;
    let successfulTemplates = 0;
    let errors = [];
    const generatedJobs = [];

    // Process each template
    for (const template of templates) {
      try {
        const result = await generateJobsFromSingleTemplate(template);
        
        totalGenerated += result.jobsGenerated;
        successfulTemplates++;
        generatedJobs.push(...result.jobs);

        // Update template's lastGenerated timestamp
        await prisma.recurringJobTemplate.update({
          where: { id: template.id },
          data: { lastGenerated: new Date() }
        });

        console.log(`✅ Template "${template.name}": Generated ${result.jobsGenerated} jobs`);

      } catch (error) {
        const errorMessage = `Template "${template.name}" (ID: ${template.id}): ${error.message}`;
        console.error(`❌ ${errorMessage}`);
        errors.push(errorMessage);
      }
    }

    const totalDuration = new Date() - startTime;

    // Prepare response
    const response = {
      message: `Generated ${totalGenerated} jobs from ${successfulTemplates}/${templates.length} templates`,
      templatesProcessed: templates.length,
      successfulTemplates,
      jobsGenerated: totalGenerated,
      errors: errors.length,
      duration: totalDuration,
      timestamp: new Date().toISOString(),
      jobs: generatedJobs.map(job => ({
        id: job.id,
        jobNumber: job.jobNumber,
        title: job.title,
        propertyName: job.property?.name,
        scheduledDate: job.scheduledDate,
        templateName: job.recurringTemplate?.name
      }))
    };

    console.log(`📊 Generated ${totalGenerated} jobs from ${successfulTemplates} templates`);
    res.json(response);

  } catch (error) {
    const totalDuration = new Date() - startTime;
    console.error('💥 Fatal error in batch job generation:', error);
    
    res.status(500).json({
      error: 'Failed to generate jobs from templates',
      message: error.message,
      templatesProcessed: 0,
      jobsGenerated: 0,
      errors: 1,
      duration: totalDuration,
      timestamp: new Date().toISOString()
    });
  }
};

// Helper function to generate jobs from a single template
async function generateJobsFromSingleTemplate(template) {
  const generatedJobs = [];
  const currentWeek = moment().startOf('week').add(1, 'day'); // Monday
  
  // Get target properties
  let targetProperties = [];
  
  if (template.zoneId && template.zone) {
    targetProperties = template.zone.properties.map(pz => pz.property);
    if (targetProperties.length === 0) {
      throw new Error(`Zone "${template.zone.name}" has no properties assigned`);
    }
  } else if (template.propertyId && template.property) {
    targetProperties = [template.property];
  } else {
    throw new Error('Template has no zone or property assigned');
  }

  // Generate jobs for current week
  for (const property of targetProperties) {
    try {
      const jobDate = calculateJobDate(template, currentWeek);
      
      if (!jobDate) {
        continue;
      }

      // Check if job already exists
      const existingJob = await prisma.job.findFirst({
        where: {
          recurringTemplateId: template.id,
          propertyId: property.id,
          scheduledDate: jobDate.toDate()
        }
      });

      if (!existingJob) {
        const job = await createJobFromTemplate(template, property, jobDate);
        generatedJobs.push(job);
      }
    } catch (error) {
      console.error(`Failed to create job for property ${property.name}:`, error.message);
    }
  }

  return {
    templateId: template.id,
    templateName: template.name,
    jobsGenerated: generatedJobs.length,
    targetProperties: targetProperties.length,
    jobs: generatedJobs
  };
}

// Helper function to calculate job date based on template frequency
function calculateJobDate(template, weekStart) {
  try {
    switch (template.frequency) {
      case 'WEEKLY':
        if (!template.dayOfWeek || template.dayOfWeek < 1 || template.dayOfWeek > 7) {
          throw new Error('Invalid dayOfWeek for weekly template');
        }
        return weekStart.clone().add(template.dayOfWeek - 1, 'days');
        
      case 'BIWEEKLY':
        if (!template.dayOfWeek || template.dayOfWeek < 1 || template.dayOfWeek > 7) {
          throw new Error('Invalid dayOfWeek for biweekly template');
        }
        const weekNumber = weekStart.week();
        if (weekNumber % 2 === 0) {
          return weekStart.clone().add(template.dayOfWeek - 1, 'days');
        }
        return null;
        
      case 'MONTHLY':
        if (!template.dayOfMonth || template.dayOfMonth < 1 || template.dayOfMonth > 31) {
          throw new Error('Invalid dayOfMonth for monthly template');
        }
        return weekStart.clone().startOf('month').add(template.dayOfMonth - 1, 'days');
        
      case 'QUARTERLY':
        if (!template.dayOfMonth || template.dayOfMonth < 1 || template.dayOfMonth > 31) {
          throw new Error('Invalid dayOfMonth for quarterly template');
        }
        return weekStart.clone().startOf('quarter').add(template.dayOfMonth - 1, 'days');
        
      default:
        throw new Error(`Unsupported frequency: ${template.frequency}`);
    }
  } catch (error) {
    throw new Error(`Date calculation failed: ${error.message}`);
  }
}

// Helper function to create job from template
async function createJobFromTemplate(template, property, jobDate) {
  try {
    const jobNumber = await generateJobNumber();
    
    const jobData = {
      jobNumber,
      title: `${template.name} - ${property.name}`,
      description: template.description || '',
      workType: template.workType,
      priority: template.priority || 'MEDIUM',
      status: 'SCHEDULED',
      propertyId: property.id,
      zoneId: template.zoneId || null,
      assignedTechnician: template.assignedTechnician || null,
      scheduledDate: jobDate.toDate(),
      scheduledTime: template.timeOfDay || null,
      estimatedDuration: template.estimatedDuration || null,
      isRecurring: true,
      recurringTemplateId: template.id
    };

    const job = await prisma.job.create({
      data: jobData,
      include: {
        property: true,
        zone: true,
        recurringTemplate: true
      }
    });

    return job;

  } catch (error) {
    throw new Error(`Job creation failed: ${error.message}`);
  }
}

// Helper function to generate unique job number
async function generateJobNumber() {
  try {
    const currentYear = new Date().getFullYear();
    const prefix = `DC-${currentYear}-`;
    
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
      const lastNumberStr = lastJob.jobNumber.split('-')[2];
      const lastNumber = parseInt(lastNumberStr);
      if (isNaN(lastNumber)) {
        throw new Error(`Invalid job number format: ${lastJob.jobNumber}`);
      }
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;

  } catch (error) {
    throw new Error(`Job number generation failed: ${error.message}`);
  }
}