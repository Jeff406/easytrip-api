const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');
const { authenticateToken } = require('../middleware/auth'); // Assuming you have auth middleware

// POST /api/users/device-token
router.post('/device-token', authenticateToken, userControllers.updateDeviceToken);

module.exports = router; 