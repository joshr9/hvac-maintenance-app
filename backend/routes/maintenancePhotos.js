const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const upload = multer({ dest: path.join(__dirname, '../uploads') });
const router = express.Router();

router.post('/:logId/photos', upload.array('photos', 10), async (req, res) => {
  const logId = parseInt(req.params.logId, 10);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No photos uploaded" });
  }

  try {
    const photos = await Promise.all(req.files.map(file =>
      prisma.maintenancePhoto.create({
        data: {
          url: `/uploads/${file.filename}`,
          maintenanceLogId: logId
        }
      })
    ));
    res.json({ photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;