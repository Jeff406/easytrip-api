const express = require('express');
const router = express.Router();
const tripRequestControllers = require('../controllers/tripRequestControllers');

// POST /api/trips/request-trip
router.post('/request-trip', tripRequestControllers.requestTrip);

module.exports = router; 