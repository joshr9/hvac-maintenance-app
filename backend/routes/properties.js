const express = require('express')
const router = express.Router()
const controller = require('../controllers/propertiesController')

router.get('/', controller.getAllProperties)
router.get('/:id', controller.getPropertyById)
router.post('/', controller.createProperty)
router.put('/:id', controller.updateProperty)
router.delete('/:id', controller.deleteProperty)

// Suite routes
router.post('/:id/suites', controller.addSuite)
router.put('/:propertyId/suites/:suiteId', controller.updateSuite)
router.delete('/:propertyId/suites/:suiteId', controller.deleteSuite)

module.exports = router