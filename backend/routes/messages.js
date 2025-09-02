const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');

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

// GET /api/messages/channels - Get available channels
router.get('/channels', messagesController.getChannels);

// GET /api/messages/direct/:userId - Get DM conversation
router.get('/direct/:userId', messagesController.getDirectMessages);

module.exports = router;