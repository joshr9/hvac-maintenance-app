// routes/jobs.js 
const express = require('express');
const router = express.Router();
const controller = require('../controllers/jobsController');
const timerController = require('../controllers/timerController');


// Timer Management Routes
router.get('/technician/:technicianName/active-timer', timerController.getActiveTimer);
router.get('/time-entries/technician/:technicianName', timerController.getAllTimeEntriesForTechnician);
router.post('/:id/timer/start', timerController.startTimer);
router.post('/:id/timer/stop', timerController.stopTimer);
router.get('/:id/timers', timerController.getJobTimers);
router.patch('/timers/:timerId', timerController.updateTimeEntry);

// Stats routes (must be before /:id routes to avoid conflicts)
router.get('/stats', controller.getDashboardStats);           // Direct stats route
router.get('/dashboard/stats', controller.getDashboardStats); // Dashboard stats route

// NEW: Late jobs route (must be before /:id to avoid conflicts)
// router.get('/late', controller.getLateJobs);

// Add this line to routes/jobs.js (temporarily for debugging)
router.get('/debug', controller.debugJobs);



// Add this temporarily for debugging
router.post('/debug-body', (req, res) => {
  console.log('=== Debug Route Hit ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Body type:', typeof req.body);
  res.json({ 
    received: req.body,
    contentType: req.headers['content-type'],
    bodyExists: !!req.body,
    technicianName: req.body?.technicianName
  });
});


// Main CRUD operations
router.get('/', controller.getAllJobs);
router.get('/:id', controller.getJobById);
router.post('/', controller.createJob);
router.put('/:id', controller.updateJob);
router.delete('/:id', controller.deleteJob);

// Status management
router.patch('/:id/status', controller.updateJobStatus);
router.post('/:id/start', controller.startJob);
router.post('/:id/complete', controller.completeJob);

module.exports = router;