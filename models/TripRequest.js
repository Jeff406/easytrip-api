const mongoose = require('mongoose');

const tripRequestSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  driverId: {
    type: String,
    required: true
  },
  pickup: {
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
  destination: {
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
  departureTime: {
    type: Date,
    required: true
  },
  routeDistance: {
    type: Number,
    required: true
  },
  routeDuration: {
    type: Number,
    required: true
  },
  expectedPrice: {
    type: Number,
    required: true
  },
  requestNote: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TripRequest', tripRequestSchema); 