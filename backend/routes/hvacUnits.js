const express = require('express')
const router = express.Router()
const controller = require('../controllers/hvacUnitsController')

// GET all units
router.get('/', controller.getAllUnits)

// GET single unit
router.get('/:id', controller.getUnitById)

// POST create new unit
router.post('/', controller.createUnit)

// PUT update unit
router.put('/:id', controller.updateUnit)

// DELETE unit
router.delete('/:id', controller.deleteUnit)

module.exports = router