const express = require('express');
const router = express.Router();
const controller = require('../controllers/recurringJobTemplatesController');

// Basic CRUD operations
router.get('/', controller.getAllTemplates);
router.get('/:id', controller.getTemplateById);
router.post('/', controller.createTemplate);
router.put('/:id', controller.updateTemplate);
router.delete('/:id', controller.deleteTemplate);

// Job generation
router.post('/generate', controller.generateJobsFromTemplate);
router.post('/generate-all', controller.generateJobsFromAllTemplates);

module.exports = router;