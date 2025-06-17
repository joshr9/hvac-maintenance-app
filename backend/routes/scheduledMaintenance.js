// routes/scheduledMaintenance.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/scheduledMaintenanceController');



// Get ALL scheduled maintenance (must be before other routes to avoid conflict)
router.get('/all', controller.getAllScheduledMaintenance);

// Get upcoming maintenance (next 7 days)
router.get('/upcoming', controller.getUpcomingMaintenance);

// Get scheduled maintenance for a suite
router.get('/suite/:suiteId', controller.getScheduledMaintenance);

// Create new scheduled maintenance
router.post('/', controller.createScheduledMaintenance);

// Update scheduled maintenance
router.put('/:id', controller.updateScheduledMaintenance);

// Mark as completed
router.patch('/:id/complete', controller.completeScheduledMaintenance);

// Delete scheduled maintenance
router.delete('/:id', controller.deleteScheduledMaintenance);

// Send reminders (for cron job)
router.post('/reminders', controller.sendReminders);

module.exports = router;