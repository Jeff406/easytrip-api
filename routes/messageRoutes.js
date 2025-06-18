const express = require('express');
const router = express.Router();
const messageControllers = require('../controllers/messageControllers');
const { authenticateToken } = require('../middleware/auth');

// GET /api/messages/:tripRequestId - Get messages for a trip request
router.get('/:tripRequestId', authenticateToken, messageControllers.getMessages);

// POST /api/messages - Create a new message
router.post('/', authenticateToken, messageControllers.createMessage);

// PUT /api/messages/:messageId/read - Mark message as read
router.put('/:messageId/read', authenticateToken, messageControllers.markAsRead);

module.exports = router; 