const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, `${req.params.logId}-${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// POST /api/maintenance/:logId/photos
router.post('/:logId/photos', upload.single('photo'), async (req, res) => {
  try {
    const logId = parseInt(req.params.logId, 10);
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    const url = `/uploads/${req.file.filename}`;
    const photo = await prisma.maintenancePhoto.create({
      data: {
        url,
        maintenanceLogId: logId
      }
    });
    res.status(201).json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;