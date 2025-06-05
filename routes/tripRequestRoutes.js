const express = require('express');
const router = express.Router();
const tripRequestControllers = require('../controllers/tripRequestControllers');
const { authenticateToken } = require('../middleware/auth');

// POST /api/trips/request-trip
router.post('/request-trip', authenticateToken, tripRequestControllers.requestTrip);

// GET /api/trips/:id
router.get('/:id', authenticateToken, tripRequestControllers.getTripRequest);

// POST /api/trips/:id/accept
router.post('/:id/accept', authenticateToken, tripRequestControllers.acceptTripRequest);

// POST /api/trips/:id/reject
router.post('/:id/reject', authenticateToken, tripRequestControllers.rejectTripRequest);

// GET /api/trips/driver/:driverId
router.get('/driver/:driverId', authenticateToken, tripRequestControllers.getDriverTripRequests);

// GET /api/trips/passenger/:passengerId
router.get('/passenger/:passengerId', authenticateToken, tripRequestControllers.getPassengerTripRequests);

module.exports = router; 