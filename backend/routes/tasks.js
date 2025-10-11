const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');

// GET /api/tasks - Get tasks (with filters)
router.get('/', tasksController.getTasks);

// POST /api/tasks - Create a new task
router.post('/', tasksController.createTask);

// GET /api/tasks/:id - Get specific task
router.get('/:id', tasksController.getTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', tasksController.updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', tasksController.deleteTask);

// POST /api/tasks/:id/assign - Assign task to users
router.post('/:id/assign', tasksController.assignTask);

// POST /api/tasks/:id/comments - Add comment to task
router.post('/:id/comments', tasksController.addComment);

// PUT /api/tasks/:id/progress - Update task progress
router.put('/:id/progress', tasksController.updateProgress);

// POST /api/tasks/:id/assignees - Add assignee to task
router.post('/:id/assignees', tasksController.addAssignee);

// DELETE /api/tasks/:id/assignees - Remove all assignees from task
router.delete('/:id/assignees', tasksController.deleteAllAssignees);

// POST /api/tasks/from-message - Create task from message
router.post('/from-message', tasksController.createFromMessage);

module.exports = router;
