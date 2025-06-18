const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');
const Message = require('./models/Message');
const TripRequest = require('./models/TripRequest');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  // Join chat room
  socket.on('join-chat', ({ tripRequestId }) => {
    const roomId = `chat-${tripRequestId}`;
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room: ${roomId}`);
    
    // Send a confirmation back to the client
    socket.emit('joined-room', { roomId, tripRequestId });
    
    // Log all users in the room
    io.in(roomId).fetchSockets().then(sockets => {
      console.log(`Users in room ${roomId}:`, sockets.map(s => s.userId));
    });
  });

  // Test ping-pong
  socket.on('ping', () => {
    console.log(`Ping received from user ${socket.userId}`);
    socket.emit('pong', { userId: socket.userId, timestamp: new Date() });
  });

  // Handle new messages
  socket.on('send-message', async ({ tripRequestId, content, receiverId }) => {
    try {
      console.log('Received message:', { tripRequestId, content, receiverId, senderId: socket.userId });

      // Validate trip request and user authorization
      const tripRequest = await TripRequest.findById(tripRequestId);
      if (!tripRequest) {
        socket.emit('error', { message: 'Trip request not found' });
        return;
      }

      console.log('Trip request validation:', {
        driverId: tripRequest.driverId,
        passengerId: tripRequest.passengerId,
        senderId: socket.userId,
        receiverId
      });

      // Check if the user is either the driver or passenger
      if (tripRequest.driverId !== socket.userId && tripRequest.passengerId !== socket.userId) {
        socket.emit('error', { message: 'Not authorized to send messages for this trip' });
        return;
      }

      // Verify the receiver is the other participant in the trip
      const otherParticipant = tripRequest.driverId === socket.userId ? tripRequest.passengerId : tripRequest.driverId;
      if (receiverId !== otherParticipant) {
        socket.emit('error', { message: 'Invalid receiver' });
        return;
      }

      const message = new Message({
        tripRequestId,
        senderId: socket.userId,
        receiverId,
        content: content.trim()
      });
      await message.save();

      console.log('Message saved to database:', message);

      // Format message for consistent response
      const formattedMessage = {
        _id: message._id,
        text: message.content,
        content: message.content, // Include both for compatibility
        createdAt: message.timestamp,
        timestamp: message.timestamp, // Include both for compatibility
        user: {
          _id: message.senderId
        },
        senderId: message.senderId // Include for compatibility
      };

      const roomId = `chat-${tripRequestId}`;
      console.log(`Broadcasting message to room: ${roomId}`);
      console.log('Formatted message being broadcast:', formattedMessage);

      // Log who is in the room before broadcasting
      io.in(roomId).fetchSockets().then(sockets => {
        console.log(`Users in room ${roomId} before broadcast:`, sockets.map(s => s.userId));
      });

      // Emit to all users in the chat room
      io.to(roomId).emit('new-message', formattedMessage);

      console.log(`Message sent in room ${roomId}:`, formattedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing status
  socket.on('typing', ({ tripRequestId, isTyping }) => {
    socket.to(`chat-${tripRequestId}`).emit('user-typing', {
      userId: socket.userId,
      isTyping
    });
  });

  // Handle read receipts
  socket.on('mark-read', async ({ tripRequestId, messageId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { read: true });
      io.to(`chat-${tripRequestId}`).emit('message-read', {
        messageId,
        readBy: socket.userId
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
