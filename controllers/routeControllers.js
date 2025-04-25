const Route = require('../models/Route');

exports.createRoute = async (req, res) => {
  try {
    const { from, to, driverId, routeLine } = req.body;

    // Validate fields and coordinate format
    if (
      !from?.address || !Array.isArray(from?.location?.coordinates) ||
      !to?.address || !Array.isArray(to?.location?.coordinates) ||
      !driverId ||
      !routeLine?.type || routeLine.type !== 'LineString' ||
      !Array.isArray(routeLine.coordinates)
    ) {
      return res.status(400).json({ message: 'Missing or invalid fields' });
    }

    const newRoute = new Route({
      driverId,
      from: {
        address: from.address,
        location: {
          type: 'Point',
          coordinates: from.location.coordinates
        }
      },
      to: {
        address: to.address,
        location: {
          type: 'Point',
          coordinates: to.location.coordinates
        }
      },
      routeLine: {
        type: 'LineString',
        coordinates: routeLine.coordinates
      }
    });

    await newRoute.save();

    res.status(201).json({ message: 'Route created successfully', route: newRoute });
  } catch (error) {
    console.error('Create route error:', error);
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
  const { pickupLng, pickupLat, destLng, destLat, maxDistance = 100, limit = 10 } = req.query;

  // Validate coordinates
  if (!pickupLng || !pickupLat || !destLng || !destLat) {
    return res.status(400).json({ message: 'Missing required coordinates in query params' });
  }

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
