const Message = require('../models/Message');
const TripRequest = require('../models/TripRequest');

exports.getMessages = async (req, res) => {
  try {
    const { tripRequestId } = req.params;
    const userId = req.user.uid;

    console.log('Getting messages for trip request:', { tripRequestId, userId });

    // Verify the user is part of this trip request
    const tripRequest = await TripRequest.findById(tripRequestId);
    if (!tripRequest) {
      return res.status(404).json({ message: 'Trip request not found' });
    }

    console.log('Trip request found:', {
      driverId: tripRequest.driverId,
      passengerId: tripRequest.passengerId,
      currentUserId: userId
    });

    // Check if the user is either the driver or passenger
    if (tripRequest.driverId !== userId && tripRequest.passengerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    // Get messages for this trip request, sorted by timestamp (oldest first)
    const messages = await Message.find({ tripRequestId })
      .sort({ timestamp: 1 })
      .lean();

    console.log('Raw messages from database:', messages);

    // Format messages for the frontend
    const formattedMessages = messages.map(message => ({
      _id: message._id,
      text: message.content,
      createdAt: message.timestamp,
      user: {
        _id: message.senderId
      },
      received: message.senderId !== userId
    }));

    // console.log('Formatted messages being sent:', formattedMessages);

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { tripRequestId, content, receiverId } = req.body;
    const senderId = req.user.uid;

    // Validate required fields
    if (!tripRequestId || !content || !receiverId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify the user is part of this trip request
    const tripRequest = await TripRequest.findById(tripRequestId);
    if (!tripRequest) {
      return res.status(404).json({ message: 'Trip request not found' });
    }

    // Check if the user is either the driver or passenger
    if (tripRequest.driverId !== senderId && tripRequest.passengerId !== senderId) {
      return res.status(403).json({ message: 'Not authorized to send messages for this trip' });
    }

    // Verify the receiver is the other participant in the trip
    const otherParticipant = tripRequest.driverId === senderId ? tripRequest.passengerId : tripRequest.driverId;
    if (receiverId !== otherParticipant) {
      return res.status(400).json({ message: 'Invalid receiver' });
    }

    // Create new message
    const message = new Message({
      tripRequestId,
      senderId,
      receiverId,
      content: content.trim()
    });

    await message.save();

    // Format message for response
    const formattedMessage = {
      _id: message._id,
      text: message.content,
      createdAt: message.timestamp,
      user: {
        _id: message.senderId
      }
    };

    res.status(201).json(formattedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.uid;

    // Find the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the user is the receiver of this message
    if (message.receiverId !== userId) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    // Mark as read
    message.read = true;
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 