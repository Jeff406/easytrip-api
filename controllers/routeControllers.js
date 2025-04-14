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
