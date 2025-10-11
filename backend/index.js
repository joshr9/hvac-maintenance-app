require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path"); // for photos

// Middleware
const app = express();

// CORS configuration for SSE and API endpoints
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://app.deancallanm.com',
    'https://app.deancallanpm.com',
    'https://front-end-production-3ed1.up.railway.app',
    'https://hvac-maintenance-app-production.up.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} (originalUrl: ${req.originalUrl})`);
  if (req.method === 'POST') {
    console.log('Body:', req.body);
  }
  next();
});

// uploading photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ NEW: Serve CSS and other static files
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
const hvacRoutes = require('./routes/hvacUnits');
app.use('/api/hvac-units', hvacRoutes);

const propertyRoutes = require('./routes/properties');
app.use('/api/properties', propertyRoutes);

const maintenanceRoutes = require('./routes/maintenanceLogs');
app.use('/api/maintenance-logs', maintenanceRoutes); // Includes photo upload routes

const scheduledMaintenanceRoutes = require('./routes/scheduledMaintenance');
app.use('/api/scheduled-maintenance', scheduledMaintenanceRoutes);

const jobsRoutes = require('./routes/jobs');
app.use('/api/jobs', jobsRoutes);

const jobServicesRoutes = require('./routes/jobServices');
app.use('/api/jobs', jobServicesRoutes);

const servicesRoutes = require('./routes/services');
app.use('/api/services', servicesRoutes);

const teamMembersRoutes = require('./routes/teamMembers');
app.use('/api/team-members', teamMembersRoutes);

// Territory Management Routes
const zonesRoutes = require('./routes/zones');
app.use('/api/zones', zonesRoutes);

const { clerkAuth, authenticateUser } = require('./middleware/clerkAuth');

const messagesRoutes = require('./routes/messages');
app.use('/api/messages', clerkAuth, authenticateUser, messagesRoutes);

const tasksRoutes = require('./routes/tasks');
// Original tasks endpoint
app.use('/api/tasks', (req, res, next) => {
  console.log('⚡⚡⚡ TASKS ROUTE HIT! ⚡⚡⚡');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('URL:', req.url);
  console.log('OriginalUrl:', req.originalUrl);
  console.log('BaseUrl:', req.baseUrl);
  console.log('⚡ About to call clerkAuth...');
  next();
}, clerkAuth, (req, res, next) => {
  console.log('⚡ After clerkAuth, req.auth:', req.auth);
  next();
}, authenticateUser, tasksRoutes);

// WORKAROUND: Alternate endpoint name to bypass browser/firewall block
app.use('/api/task-items', clerkAuth, authenticateUser, tasksRoutes);

const clerkRoutes = require('./routes/clerk');
app.use('/api/clerk', clerkRoutes);

// FIXED: Use singular form to match your file name
const recurringJobTemplateRoutes = require('./routes/recurringJobTemplate');
app.use('/api/recurring-job-templates', recurringJobTemplateRoutes);

// ✅ NEW: Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    scheduler: process.env.ENABLE_SCHEDULER === 'true' ? 'enabled' : 'disabled'
  });
});

// ✅ NEW: Manual job generation endpoint for admin dashboard
app.post('/api/admin/generate-jobs', async (req, res) => {
  try {
    console.log('🔄 Manual job generation triggered via API...');
    
    const response = await fetch(`http://localhost:${PORT}/api/recurring-job-templates/generate-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const result = await response.json();
      res.json({
        success: true,
        message: 'Jobs generated successfully',
        ...result
      });
    } else {
      throw new Error('Generation request failed');
    }
  } catch (error) {
    console.error('❌ Manual generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Root Route
app.get("/", (req, res) => {
  res.send("HVAC Maintenance API is running ✅");
});

// Test POST endpoint without auth
app.post("/api/test-post", (req, res) => {
  console.log('🧪 Test POST received!', req.body);
  res.json({ success: true, message: "POST works!", received: req.body });
});

const PORT = process.env.PORT || 3000;

// ✅ NEW: Optional scheduler startup
if (process.env.ENABLE_SCHEDULER === 'true') {
  console.log('🔄 Starting integrated recurring job scheduler...');
  try {
    require('./scripts/jobScheduler');
    console.log('✅ Scheduler integrated successfully');
  } catch (error) {
    console.error('❌ Failed to start scheduler:', error);
    console.log('💡 You can run the scheduler separately with: npm run scheduler');
  }
}

// ✅ ENHANCED: Server startup with detailed logging
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📅 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 Scheduler: ${process.env.ENABLE_SCHEDULER === 'true' ? 'Integrated' : 'Separate process'}`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  
  if (process.env.ENABLE_SCHEDULER !== 'true') {
    console.log('\n💡 To enable automatic job generation:');
    console.log('   1. Set ENABLE_SCHEDULER=true in your .env file, or');
    console.log('   2. Run: npm run scheduler (in a separate terminal)');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
});

// ✅ NEW: Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});
