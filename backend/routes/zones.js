// routes/zones.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/zonesController');

// Basic CRUD operations
router.get('/', controller.getAllZones);
router.get('/:id', controller.getZoneById);
router.post('/', controller.createZone);
router.put('/:id', controller.updateZone);
router.delete('/:id', controller.deleteZone);

// Zone property management
router.get('/:id/properties', controller.getZoneProperties);
router.post('/:id/assign-property', controller.assignPropertyToZone);
router.delete('/:id/properties/:propertyId', controller.removePropertyFromZone);

module.exports = router;