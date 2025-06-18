const TripRequest = require('../models/TripRequest');
const Route = require('../models/Route');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

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
      requestNote,
      transportMode
    } = req.body;

    // Validate required fields
    if (!routeId || !pickup || !destination || !pickupCoords || !destinationCoords || 
        !departureTime || !routeDistance || !routeDuration || !expectedPrice || !transportMode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate transport mode
    if (!['car', 'scooter'].includes(transportMode)) {
      return res.status(400).json({ message: 'Invalid transport mode. Must be either car or scooter' });
    }

    // Validate route exists and get driverId
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Create new trip request with transformed data
    const tripRequest = new TripRequest({
      routeId,
      driverId: route.driverId,
      passengerId: req.user.uid, // Use authenticated user's ID
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
      requestNote,
      transportMode
    });

    await tripRequest.save();

    // Send notification to driver
    try {
      await notificationService.sendTripRequestNotification(route.driverId, tripRequest);
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Don't fail the request if notification fails
    }

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

exports.getTripRequest = async (req, res) => {
  try {
    const tripRequest = await TripRequest.findById(req.params.id);
    
    if (!tripRequest) {
      return res.status(404).json({ message: 'Trip request not found' });
    }

    // Check if the user is either the driver or passenger
    if (tripRequest.driverId !== req.user.uid && tripRequest.passengerId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to view this trip request' });
    }

    res.json(tripRequest);
  } catch (error) {
    console.error('Error getting trip request:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.acceptTripRequest = async (req, res) => {
  try {
    const tripRequest = await TripRequest.findById(req.params.id);
    
    if (!tripRequest) {
      return res.status(404).json({ message: 'Trip request not found' });
    }

    // Check if the user is the driver
    if (tripRequest.driverId !== req.user.uid) {
      return res.status(403).json({ message: 'Only the driver can accept trip requests' });
    }

    // Check if the trip request is still pending
    if (tripRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Trip request is no longer pending' });
    }

    tripRequest.status = 'accepted';
    await tripRequest.save();

    // TODO: Send notification to passenger about acceptance

    res.json({
      message: 'Trip request accepted successfully',
      tripRequest
    });
  } catch (error) {
    console.error('Error accepting trip request:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.rejectTripRequest = async (req, res) => {
  try {
    const tripRequest = await TripRequest.findById(req.params.id);
    
    if (!tripRequest) {
      return res.status(404).json({ message: 'Trip request not found' });
    }

    // Check if the user is the driver
    if (tripRequest.driverId !== req.user.uid) {
      return res.status(403).json({ message: 'Only the driver can reject trip requests' });
    }

    // Check if the trip request is still pending
    if (tripRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Trip request is no longer pending' });
    }

    tripRequest.status = 'rejected';
    await tripRequest.save();

    // TODO: Send notification to passenger about rejection

    res.json({
      message: 'Trip request rejected successfully',
      tripRequest
    });
  } catch (error) {
    console.error('Error rejecting trip request:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getDriverTripRequests = async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // Check if the user is requesting their own trip requests
    if (driverId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to view these trip requests' });
    }

    const tripRequests = await TripRequest.find({ driverId })
      .sort({ createdAt: -1 }); // Most recent first

    // Transform the data to include passenger information
    const transformedTripRequests = await Promise.all(
      tripRequests.map(async (tripRequest) => {
        const tripRequestObj = tripRequest.toObject();
        
        // Get passenger information
        let passengerName = 'Unknown Passenger';
        try {
          const passenger = await User.findOne({ firebaseId: tripRequest.passengerId });
          if (passenger) {
            passengerName = passenger.displayName || passenger.email || passenger.firebaseId;
          }
        } catch (error) {
          console.error('Error fetching passenger info:', error);
        }
        
        return {
          ...tripRequestObj,
          passengerName
        };
      })
    );

    res.json(transformedTripRequests);
  } catch (error) {
    console.error('Error getting driver trip requests:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getPassengerTripRequests = async (req, res) => {
  try {
    const { passengerId } = req.params;
    
    // Check if the user is requesting their own trip requests
    if (passengerId !== req.user.uid) {
      return res.status(403).json({ message: 'Not authorized to view these trip requests' });
    }

    const tripRequests = await TripRequest.find({ passengerId })
      .sort({ createdAt: -1 }); // Most recent first

    // Transform the data to include driver and passenger information
    const transformedTripRequests = await Promise.all(
      tripRequests.map(async (tripRequest) => {
        const tripRequestObj = tripRequest.toObject();
        
        // Get driver information
        let driverName = 'Unknown Driver';
        try {
          const driver = await User.findOne({ firebaseId: tripRequest.driverId });
          if (driver) {
            driverName = driver.displayName || driver.email || driver.firebaseId;
          }
        } catch (error) {
          console.error('Error fetching driver info:', error);
        }

        // Get passenger information (current user)
        let passengerName = 'Unknown Passenger';
        try {
          const passenger = await User.findOne({ firebaseId: tripRequest.passengerId });
          if (passenger) {
            passengerName = passenger.displayName || passenger.email || passenger.firebaseId;
          }
        } catch (error) {
          console.error('Error fetching passenger info:', error);
        }
        
        return {
          ...tripRequestObj,
          driverName,
          passengerName
        };
      })
    );

    res.json(transformedTripRequests);
  } catch (error) {
    console.error('Error getting passenger trip requests:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 