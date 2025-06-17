// routes/jobServices.js
const express = require('express');
const router = express.Router();
const jobServicesController = require('../controllers/jobServicesController');

// Job Services Routes
// All routes are prefixed with /api/jobs/:jobId/services

// GET /api/jobs/:jobId/services - Get all services for a job
router.get('/', jobServicesController.getJobServices);

// POST /api/jobs/:jobId/services - Add a service to a job
router.post('/', jobServicesController.addJobService);

// PUT /api/jobs/:jobId/services/:serviceId - Update a service on a job
router.put('/:serviceId', jobServicesController.updateJobService);

// DELETE /api/jobs/:jobId/services/:serviceId - Remove a service from a job
router.delete('/:serviceId', jobServicesController.deleteJobService);

// POST /api/jobs/:jobId/services/reorder - Reorder services on a job
router.post('/reorder', jobServicesController.reorderJobServices);

module.exports = router;

// To integrate this into your main app.js or routes/index.js, add:
/*
const jobServicesRoutes = require('./routes/jobServices');
app.use('/api/jobs/:jobId/services', jobServicesRoutes);

// OR if you have a more complex routing setup:
const jobServicesRoutes = require('./jobServices');
router.use('/jobs/:jobId/services', jobServicesRoutes);
*/