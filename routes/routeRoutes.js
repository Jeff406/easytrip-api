const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeControllers');
const { authenticateToken } = require('../middleware/auth');

// Add middleware to all routes
router.post('/', authenticateToken, routeController.createRoute);
router.get('/nearby', routeController.getNearbyRoutes);
router.get('/nearby-both', authenticateToken, routeController.getRoutesNearbyBothLocations);

module.exports = router;
