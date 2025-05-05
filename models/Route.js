const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  driverId: {
    type: String,
    required: true
  },
  from: {
    address: {
      type: String,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  to: {
    address: {
      type: String,
      required: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  routeLine: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true
    },
    coordinates: {
      type: [[Number]],
      required: true
    }
  },
  departureTime: {
    type: Date,
    required: true
  },
  transportMode: {
    type: String,
    required: true,
    enum: ['car', 'scooter']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for routeLine
routeSchema.index({ 'routeLine': '2dsphere' });

module.exports = mongoose.model('Route', routeSchema);
