// scripts/jobScheduler.js - Automatic Recurring Job Generation
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const moment = require('moment');

const prisma = new PrismaClient();

console.log('🚀 Starting Recurring Job Scheduler...');

// ✅ MAIN SCHEDULER: Runs every Monday at 6:00 AM
cron.schedule('0 6 * * 1', async () => {
  console.log('\n🔄 [WEEKLY GENERATION] Starting weekly job generation...');
  await generateWeeklyJobs();
}, {
  timezone: "America/Denver" // Adjust to your timezone
});

// ✅ BACKUP SCHEDULER: Runs daily at 7:00 AM to catch any missed jobs
cron.schedule('0 7 * * *', async () => {
  console.log('\n🔍 [DAILY CHECK] Checking for missed job generation...');
  await checkAndGenerateMissedJobs();
}, {
  timezone: "America/Denver"
});

// ✅ CLEANUP SCHEDULER: Runs every Sunday at 11:00 PM
cron.schedule('0 23 * * 0', async () => {
  console.log('\n🧹 [WEEKLY CLEANUP] Starting weekly cleanup...');
  await weeklyCleanup();
}, {
  timezone: "America/Denver"
});

/**
 * Generate jobs for all active recurring templates
 */
async function generateWeeklyJobs() {
  try {
    const startTime = new Date();
    
    // Get all active templates
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

    console.log(`📋 Found ${templates.length} active recurring templates`);

    let totalGenerated = 0;
    let errors = [];

    for (const template of templates) {
      try {
        const result = await generateJobsFromTemplate(template);
        totalGenerated += result.jobsGenerated;
        
        console.log(`✅ Template "${template.name}": Generated ${result.jobsGenerated} jobs`);
        
        // Update last generation timestamp
        await prisma.recurringJobTemplate.update({
          where: { id: template.id },
          data: { lastGenerated: new Date() }
        });
        
      } catch (error) {
        const errorMsg = `❌ Template "${template.name}" failed: ${error.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    const duration = new Date() - startTime;
    
    console.log('\n📊 WEEKLY GENERATION SUMMARY:');
    console.log(`   Templates processed: ${templates.length}`);
    console.log(`   Jobs generated: ${totalGenerated}`);
    console.log(`   Errors: ${errors.length}`);
    console.log(`   Duration: ${duration}ms`);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(error => console.log(`   ${error}`));
    }

    // Log to database for tracking
    await logSchedulerRun('weekly_generation', {
      templates_processed: templates.length,
      jobs_generated: totalGenerated,
      errors: errors.length,
      duration_ms: duration
    });

  } catch (error) {
    console.error('💥 Fatal error in weekly job generation:', error);
    await logSchedulerRun('weekly_generation', { error: error.message });
  }
}

/**
 * Check for templates that should have generated jobs but didn't
 */
async function checkAndGenerateMissedJobs() {
  try {
    const startOfWeek = moment().startOf('week').add(1, 'day'); // Monday
    
    // Find templates that should have generated jobs this week but didn't
    const missedTemplates = await prisma.recurringJobTemplate.findMany({
      where: {
        isActive: true,
        OR: [
          { lastGenerated: null },
          { lastGenerated: { lt: startOfWeek.toDate() } }
        ]
      },
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

    if (missedTemplates.length === 0) {
      console.log('✅ No missed templates found');
      return;
    }

    console.log(`🔍 Found ${missedTemplates.length} templates with missed generation`);

    let totalGenerated = 0;

    for (const template of missedTemplates) {
      try {
        const result = await generateJobsFromTemplate(template);
        totalGenerated += result.jobsGenerated;
        
        console.log(`✅ Caught up template "${template.name}": Generated ${result.jobsGenerated} jobs`);
        
        await prisma.recurringJobTemplate.update({
          where: { id: template.id },
          data: { lastGenerated: new Date() }
        });
        
      } catch (error) {
        console.error(`❌ Failed to catch up template "${template.name}":`, error.message);
      }
    }

    console.log(`📊 Missed generation recovery: ${totalGenerated} jobs generated`);

  } catch (error) {
    console.error('💥 Error in missed job check:', error);
  }
}

/**
 * Generate jobs from a specific template
 */
async function generateJobsFromTemplate(template) {
  const generatedJobs = [];
  const currentWeek = moment().startOf('week').add(1, 'day'); // Monday
  
  // Get target properties
  let targetProperties = [];
  if (template.zoneId && template.zone) {
    targetProperties = template.zone.properties.map(pz => pz.property);
  } else if (template.propertyId && template.property) {
    targetProperties = [template.property];
  }

  if (targetProperties.length === 0) {
    throw new Error('No target properties found for template');
  }

  // Generate jobs for current week
  for (const property of targetProperties) {
    const jobDate = calculateJobDate(template, currentWeek);
    
    if (jobDate) {
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
    }
  }

  return {
    templateId: template.id,
    templateName: template.name,
    jobsGenerated: generatedJobs.length,
    jobs: generatedJobs
  };
}

/**
 * Calculate the job date based on template frequency
 */
function calculateJobDate(template, weekStart) {
  switch (template.frequency) {
    case 'WEEKLY':
      return weekStart.clone().add(template.dayOfWeek - 1, 'days');
    case 'BIWEEKLY':
      const weekNumber = weekStart.week();
      if (weekNumber % 2 === 0) {
        return weekStart.clone().add(template.dayOfWeek - 1, 'days');
      }
      return null;
    case 'MONTHLY':
      return weekStart.clone().startOf('month').add(template.dayOfMonth - 1, 'days');
    case 'QUARTERLY':
      return weekStart.clone().startOf('quarter').add(template.dayOfMonth - 1, 'days');
    default:
      return null;
  }
}

/**
 * Create a job from template
 */
async function createJobFromTemplate(template, property, jobDate) {
  const jobNumber = await generateJobNumber();
  
  return await prisma.job.create({
    data: {
      jobNumber,
      title: `${template.name} - ${property.name}`,
      description: template.description,
      workType: template.workType,
      priority: template.priority,
      status: 'SCHEDULED',
      propertyId: property.id,
      zoneId: template.zoneId,
      assignedTechnician: template.assignedTechnician,
      scheduledDate: jobDate.toDate(),
      scheduledTime: template.timeOfDay,
      estimatedDuration: template.estimatedDuration,
      isRecurring: true,
      recurringTemplateId: template.id
    },
    include: {
      property: true,
      zone: true,
      recurringTemplate: true
    }
  });
}

/**
 * Generate unique job number
 */
async function generateJobNumber() {
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
    const lastNumber = parseInt(lastJob.jobNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
}

/**
 * Weekly cleanup tasks
 */
async function weeklyCleanup() {
  try {
    console.log('🧹 Performing weekly cleanup tasks...');
    
    // Clean up old scheduler logs (keep last 30 days)
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    
    // If you have a scheduler_logs table, clean it up
    // await prisma.schedulerLog.deleteMany({
    //   where: {
    //     createdAt: { lt: thirtyDaysAgo }
    //   }
    // });
    
    console.log('✅ Weekly cleanup completed');
    
  } catch (error) {
    console.error('❌ Error in weekly cleanup:', error);
  }
}

/**
 * Log scheduler runs for monitoring
 */
async function logSchedulerRun(type, data) {
  try {
    // If you have a scheduler_logs table, log the run
    console.log(`📝 Scheduler run logged: ${type}`, data);
    
    // Example log entry - implement this if you want database logging
    // await prisma.schedulerLog.create({
    //   data: {
    //     type,
    //     data: JSON.stringify(data),
    //     createdAt: new Date()
    //   }
    // });
    
  } catch (error) {
    console.error('Failed to log scheduler run:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down scheduler...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down scheduler...');
  await prisma.$disconnect();
  process.exit(0);
});

console.log('✅ Recurring Job Scheduler is running!');
console.log('📅 Schedule:');
console.log('   - Weekly generation: Every Monday at 6:00 AM');
console.log('   - Daily check: Every day at 7:00 AM');
console.log('   - Weekly cleanup: Every Sunday at 11:00 PM');
console.log('\n⏰ Waiting for scheduled runs...\n');