// routes/services.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/servicesController');

// Service statistics (must be before /:id routes)
router.get('/stats', controller.getServiceStats);

// Service categories
router.get('/categories', controller.getServiceCategories);

// CSV Import
router.post('/import-csv', controller.uploadCSV, controller.importServicesFromCSV);

// Main CRUD operations
router.get('/', controller.getAllServices);
router.get('/:id', controller.getServiceById);
router.post('/', controller.createService);
router.put('/:id', controller.updateService);
router.delete('/:id', controller.deleteService);

module.exports = router;