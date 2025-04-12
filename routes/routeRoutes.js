const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeControllers');

router.post('/', routeController.createRoute);
router.get('/nearby', routeController.getNearbyRoutes);

module.exports = router;
