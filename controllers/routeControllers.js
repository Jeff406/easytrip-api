const Route = require('../models/Route');

exports.createRoute = async (req, res) => {
  try {
    const { from, to, driverId } = req.body;

    if (!from || !to || !driverId || !from.lat || !from.lng || !to.lat || !to.lng) {
      return res.status(400).json({ message: 'Missing required fields or coordinates' });
    }

    const newRoute = new Route({
      driverId,
      from: {
        address: from.address,
        location: {
          type: 'Point',
          coordinates: [from.lng, from.lat] // Note the order: [lng, lat]
        }
      },
      to: {
        address: to.address,
        location: {
          type: 'Point',
          coordinates: [to.lng, to.lat]
        }
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
  const { lng, lat, maxDistance = 10000 } = req.query; // maxDistance in meters

  if (!lng || !lat) {
    return res.status(400).json({ message: 'Missing lng and lat in query params' });
  }

  try {
    const routes = await Route.find({
      'from.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(10); // or increase based on your UI

    res.json({ routes });
  } catch (error) {
    console.error('Error finding nearby routes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
