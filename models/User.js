const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseId: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['driver', 'passenger'],
    default: 'passenger'
  },
  displayName: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  deviceToken: {
    type: String,
    default: null
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

// Create compound index for firebaseId + role to ensure uniqueness per role
userSchema.index({ firebaseId: 1, role: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema); 