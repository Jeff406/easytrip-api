const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  from: {
    address: String,
    lat: Number,
    lng: Number,
  },
  to: {
    address: String,
    lat: Number,
    lng: Number,
  },
  routeLine: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true,
      default: 'LineString',
    },
    coordinates: {
      type: [[Number]], // [ [lng, lat], [lng, lat], ... ]
      required: true,
    },
  },
  createdAt: { type: Date, default: Date.now },
});

// Create 2dsphere index for routeLine
RouteSchema.index({ routeLine: '2dsphere' });

module.exports = mongoose.model('Route', RouteSchema);
