const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');
const { authenticateToken } = require('../middleware/auth'); // Assuming you have auth middleware

// POST /api/users/device-token - Update device token with role
router.post('/device-token', authenticateToken, userControllers.updateDeviceToken);

// POST /api/users/create-or-update - Create or update user with role
router.post('/create-or-update', authenticateToken, userControllers.createOrUpdateUser);

// GET /api/users/:firebaseId/:role - Get user by firebaseId and role
router.get('/:firebaseId/:role', authenticateToken, userControllers.getUserByRole);

module.exports = router; 