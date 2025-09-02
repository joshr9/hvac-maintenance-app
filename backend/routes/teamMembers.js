// routes/teamMembers.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/teamMembersController');

// NEW: Calendar-specific routes (must be before /:id routes)
router.get('/schedule', controller.getTeamSchedule);
router.get('/availability', controller.getTeamAvailability);

// GET /api/team-members - Enhanced to include job stats for calendar
router.get('/', controller.getTeamMembers);

// POST /api/team-members - Keep your existing create functionality  
router.post('/', controller.createTeamMember);

// GET /api/team-members/:id - Enhanced with job stats
router.get('/:id', controller.getTeamMember);

// NEW: Get jobs for specific team member
router.get('/:id/jobs', controller.getTeamMemberJobs);

module.exports = router;