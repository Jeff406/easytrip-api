const Route = require('../models/Route');

exports.createRoute = async (req, res) => {
  try {
    const { driverId, from, to, routeLine, departureTime, transportMode } = req.body;

    console.log('Received createRoute request with body:', req.body);

    // Validate fields
    if (!from?.address || typeof from?.lat !== 'number' || typeof from?.lng !== 'number') {
      console.log('Validation failed: Invalid from field', from);
      return res.status(400).json({ message: 'Invalid from field' });
    }

    if (!to?.address || typeof to?.lat !== 'number' || typeof to?.lng !== 'number') {
      console.log('Validation failed: Invalid to field', to);
      return res.status(400).json({ message: 'Invalid to field' });
    }

    if (!driverId) {
      console.log('Validation failed: Missing driverId', driverId);
      return res.status(400).json({ message: 'Missing driverId' });
    }

    if (!routeLine?.type || routeLine.type !== 'LineString') {
      console.log('Validation failed: Invalid routeLine type', routeLine);
      return res.status(400).json({ message: 'Invalid routeLine type' });
    }

    if (!Array.isArray(routeLine.coordinates) ||
        !routeLine.coordinates.every(coord => Array.isArray(coord) && coord.length === 2 && coord.every(c => typeof c === 'number'))) {
      console.log('Validation failed: Invalid routeLine coordinates', routeLine.coordinates);
      return res.status(400).json({ message: 'Invalid routeLine coordinates' });
    }

    if (!departureTime) {
      console.log('Validation failed: Missing departureTime', departureTime);
      return res.status(400).json({ message: 'Missing departureTime' });
    }

    if (!transportMode || !['car', 'scooter'].includes(transportMode)) {
      console.log('Validation failed: Invalid transportMode', transportMode);
      return res.status(400).json({ message: 'Invalid transportMode. Must be either car or scooter' });
    }

    const newRoute = new Route({
      driverId,
      from: {
        address: from.address,
        lat: from.lat,
        lng: from.lng
      },
      to: {
        address: to.address,
        lat: to.lat,
        lng: to.lng
      },
      routeLine: {
        type: 'LineString',
        coordinates: routeLine.coordinates
      },
      departureTime: new Date(departureTime),
      transportMode
    });

    await newRoute.save();

    console.log('Route created successfully:', newRoute);
    res.status(201).json({ message: 'Route created successfully', route: newRoute });
  } catch (error) {
    console.log('Error in createRoute:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNearbyRoutes = async (req, res) => {
  const { lng, lat, maxDistance = 100 } = req.query;

  if (!lng || !lat) {
    return res.status(400).json({ message: 'Missing lng and lat in query params' });
  }

  try {
    const routes = await Route.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          spherical: true,
          maxDistance: parseInt(maxDistance),
          key: 'routeLine'
        }
      },
      { $limit: 10 }
    ]);

    res.json({ routes });
  } catch (error) {
    console.error('Error finding nearby routes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRoutesNearbyBothLocations = async (req, res) => {
  const { pickupLng, pickupLat, destLng, destLat, maxDistance = 100, limit = 10, departureTime } = req.query;

  console.log('Departure time:', departureTime);
  // Validate coordinates
  if (!pickupLng || !pickupLat || !destLng || !destLat) {
    return res.status(400).json({ message: 'Missing required coordinates in query params' });
  }

  // Validate departureTime
  if (!departureTime) {
    return res.status(400).json({ message: 'Missing departureTime in query params' });
  }

  const requestTime = new Date(departureTime);
  if (isNaN(requestTime.getTime())) {
    return res.status(400).json({ message: 'Invalid departureTime format' });
  }

  // Calculate maximum departure time (30 minutes before request time)
  const maxDepartureTime = new Date(requestTime.getTime() - 30 * 60 * 1000);

  // Validate coordinate format
  const coordinates = [pickupLng, pickupLat, destLng, destLat].map(coord => parseFloat(coord));
  if (coordinates.some(isNaN)) {
    return res.status(400).json({ message: 'Invalid coordinate format' });
  }

  try {
    // Run both geo queries concurrently using Promise.all
    const [routesNearPickup, routesNearDest] = await Promise.all([
      Route.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [coordinates[0], coordinates[1]]
            },
            distanceField: 'pickupDistance',
            spherical: true,
            maxDistance: parseInt(maxDistance),
            key: 'routeLine'
          }
        },
        {
          $match: {
            departureTime: { 
              $gte: maxDepartureTime,
              $lt: requestTime
            }
          }
        },
        { $limit: parseInt(limit) }
      ]),
      Route.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [coordinates[2], coordinates[3]]
            },
            distanceField: 'destDistance',
            spherical: true,
            maxDistance: parseInt(maxDistance),
            key: 'routeLine'
          }
        },
        {
          $match: {
            departureTime: { 
              $gte: maxDepartureTime,
              $lt: requestTime
            }
          }
        },
        { $limit: parseInt(limit) }
      ])
    ]);

    // Create a map of destination routes for O(1) lookup
    const destRoutesMap = new Map(
      routesNearDest.map(route => [route._id.toString(), route])
    );

    // Find intersection and calculate total distance
    const finalRoutes = routesNearPickup
      .filter(route => destRoutesMap.has(route._id.toString()))
      .map(route => {
        const destRoute = destRoutesMap.get(route._id.toString());
        return {
          ...route,
          destDistance: destRoute.destDistance,
          pickupDistance: route.pickupDistance
        };
      })
      .slice(0, parseInt(limit));

    res.json({ 
      routes: finalRoutes,
      total: finalRoutes.length,
      maxDistance: parseInt(maxDistance)
    });
  } catch (error) {
    console.error('Error finding routes near both locations:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
