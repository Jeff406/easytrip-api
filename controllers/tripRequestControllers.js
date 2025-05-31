const TripRequest = require('../models/TripRequest');
const Route = require('../models/Route');

exports.requestTrip = async (req, res) => {
  try {
    const {
      routeId,
      pickup,
      destination,
      pickupCoords,
      destinationCoords,
      departureTime,
      routeDistance,
      routeDuration,
      expectedPrice,
      requestNote
    } = req.body;

    // Validate required fields
    if (!routeId || !pickup || !destination || !pickupCoords || !destinationCoords || 
        !departureTime || !routeDistance || !routeDuration || !expectedPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate route exists and get driverId
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Create new trip request with transformed data
    const tripRequest = new TripRequest({
      routeId,
      driverId: route.driverId, // Get driverId from the route
      pickup: {
        address: pickup,
        lat: pickupCoords[1],
        lng: pickupCoords[0]
      },
      destination: {
        address: destination,
        lat: destinationCoords[1],
        lng: destinationCoords[0]
      },
      departureTime: new Date(departureTime),
      routeDistance,
      routeDuration,
      expectedPrice,
      requestNote
    });

    await tripRequest.save();

    res.status(201).json({
      message: 'Trip request created successfully',
      tripRequest
    });
  } catch (error) {
    console.error('Error creating trip request:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 