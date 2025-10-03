const express = require('express')
const router = express.Router()
const controller = require('../controllers/maintenanceLogsController')
const multer = require('multer')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Set up multer storage for photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: function (req, file, cb) {
    cb(null, `${req.params.logId}-${Date.now()}-${file.originalname}`)
  }
})
const upload = multer({ storage })

// Download report route (must be before /:id route)
router.get('/report', controller.downloadReport)

// Get logs by suite ID
router.get('/suite/:suiteId', controller.getLogsBySuite)

// Photo upload route (must be before /:id route to avoid conflict)
router.post('/:logId/photos', upload.single('photo'), async (req, res) => {
  try {
    const logId = parseInt(req.params.logId, 10)
    if (!req.file) return res.status(400).json({ error: "No file uploaded." })
    const url = `/uploads/${req.file.filename}`
    const photo = await prisma.maintenancePhoto.create({
      data: {
        url,
        maintenanceLogId: logId
      }
    })
    res.status(201).json(photo)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

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