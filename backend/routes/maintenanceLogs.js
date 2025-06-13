const express = require('express')
const router = express.Router()
const controller = require('../controllers/maintenanceLogsController')
router.get('/report', controller.downloadReport)

router.get('/', controller.getAllLogs)
router.get('/:id', controller.getLogById)
router.post('/', controller.createLog)
router.put('/:id', controller.updateLog)
router.delete('/:id', controller.deleteLog)

module.exports = router