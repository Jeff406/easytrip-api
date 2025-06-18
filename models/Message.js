const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  tripRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TripRequest',
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

// Index for faster queries
messageSchema.index({ tripRequestId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 