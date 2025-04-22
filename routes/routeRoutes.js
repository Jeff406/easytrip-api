const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeControllers');

router.post('/', routeController.createRoute);
router.get('/nearby', routeController.getNearbyRoutes);
router.get('/nearby-both', routeController.getRoutesNearbyBothLocations);

module.exports = router;
