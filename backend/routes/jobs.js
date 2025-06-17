// routes/jobs.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/jobsController');

// Dashboard and stats (must be before /:id routes)
router.get('/dashboard/stats', controller.getDashboardStats);

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