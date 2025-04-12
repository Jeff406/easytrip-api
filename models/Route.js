const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  from: {
    address: String,
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    }
  },
  to: {
    address: String,
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    }
  },
  createdAt: { type: Date, default: Date.now }
});

// Create 2dsphere indexes
RouteSchema.index({ 'from.location': '2dsphere' });
RouteSchema.index({ 'to.location': '2dsphere' });

module.exports = mongoose.model('Route', RouteSchema);
