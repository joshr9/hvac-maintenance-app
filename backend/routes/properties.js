const express = require('express')
const router = express.Router()
const controller = require('../controllers/propertiesController')

// Suite routes MUST come before /:id routes
router.post('/:id/suites', controller.addSuite)
router.put('/:propertyId/suites/:suiteId', controller.updateSuite)
router.delete('/:propertyId/suites/:suiteId', controller.deleteSuite)

// Property routes
router.get('/', controller.getAllProperties)
router.get('/:id', controller.getPropertyById)
router.post('/', controller.createProperty)
router.put('/:id', controller.updateProperty)
router.delete('/:id', controller.deleteProperty)

module.exports = router