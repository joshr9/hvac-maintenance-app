const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

// IMPORTANT: Specific routes BEFORE parameterized routes

// GET /api/messages/events - SSE endpoint for real-time messages
router.get('/events', messagesController.subscribeToMessages);

// GET /api/messages/recent - Get recent messages for notifications (MUST be before /:id)
router.get('/recent', messagesController.getRecentMessages);

// GET /api/messages/channels - Get available channels (MUST be before /:id)
router.get('/channels', messagesController.getChannels);

// POST /api/messages/channels - Create a new channel (MUST be before /:id)
router.post('/channels', messagesController.createChannel);

// GET /api/messages/direct/:userId - Get DM conversation (MUST be before /:id)
router.get('/direct/:userId', messagesController.getDirectMessages);

// GET /api/messages - Get messages for a channel/DM
router.get('/', messagesController.getMessages);

// POST /api/messages - Send a new message
router.post('/', messagesController.createMessage);

// PUT /api/messages/:id - Update a message (edit)
router.put('/:id', messagesController.updateMessage);

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', messagesController.deleteMessage);

// POST /api/messages/:id/reactions - Add/remove reaction
router.post('/:id/reactions', messagesController.toggleReaction);

// POST /api/messages/:id/save-to-job - Save message to job
router.post('/:id/save-to-job', messagesController.saveToJob);

// POST /api/messages/:id/save-to-property - Save message to property
router.post('/:id/save-to-property', messagesController.saveToProperty);

module.exports = router;
