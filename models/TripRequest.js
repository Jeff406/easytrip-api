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
  passengerId: {
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
  transportMode: {
    type: String,
    enum: ['car', 'scooter'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
tripRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TripRequest', tripRequestSchema); 