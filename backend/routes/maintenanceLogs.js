const express = require('express')
const router = express.Router()
const controller = require('../controllers/maintenanceLogsController')
const multer = require('multer')
const { v2: cloudinary } = require('cloudinary')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Store upload in memory so we can pipe to Cloudinary
const upload = multer({ storage: multer.memoryStorage() })

// Download report route (must be before /:id route)
router.get('/report', controller.downloadReport)

// Get logs by suite ID
router.get('/suite/:suiteId', controller.getLogsBySuite)

// Get logs by HVAC unit ID
router.get('/unit/:unitId', controller.getLogsByUnit)

// Photo upload route (must be before /:id route to avoid conflict)
router.post('/:logId/photos', upload.single('photo'), async (req, res) => {
  try {
    const logId = parseInt(req.params.logId, 10)
    console.log('Photo upload: logId', logId, 'file', req.file ? `${req.file.originalname} ${req.file.size}b` : 'MISSING')
    console.log('Cloudinary config:', { cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: !!process.env.CLOUDINARY_API_KEY, api_secret: !!process.env.CLOUDINARY_API_SECRET })
    if (!req.file) return res.status(400).json({ error: "No file uploaded." })

    // Upload buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'hvac-maintenance', resource_type: 'image' },
        (error, result) => {
          if (error) { console.error('Cloudinary upload_stream error:', error); reject(error); }
          else { console.log('Cloudinary upload success:', result.secure_url); resolve(result); }
        }
      )
      stream.end(req.file.buffer)
    })

    const photo = await prisma.maintenancePhoto.create({
      data: {
        url: result.secure_url,
        maintenanceLogId: logId
      }
    })
    res.status(201).json(photo)
  } catch (err) {
    console.error('Photo upload error:', err)
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