const express = require('express')
const router = express.Router()
const controller = require('../controllers/maintenanceLogsController')

// Download report route (must be before /:id route)
router.get('/report', controller.downloadReport)

// Get logs by suite ID
router.get('/suite/:suiteId', controller.getLogsBySuite)

// Get all logs
router.get('/', controller.getAllLogs)

// Get single log
router.get('/:id', controller.getLogById)

// Create new log
router.post('/', controller.createLog)

// Update log
router.put('/:id', controller.updateLog)

// Delete log
router.delete('/:id', controller.deleteLog)

module.exports = router