const admin = require('firebase-admin');
const User = require('../models/User');

class NotificationService {
  async sendTripRequestNotification(driverId, tripRequest) {
    try {
      console.log('Attempting to send notification to driver:', driverId);
      
      // Get driver's device token using driverId (which is the Firebase ID)
      const driver = await User.findOne({ firebaseId: driverId });
      console.log('Found driver in database:', driver ? 'Yes' : 'No');
      
      if (!driver) {
        console.log('Driver not found in database with firebaseId:', driverId);
        return;
      }
      
      if (!driver.deviceToken) {
        console.log('Driver found but no device token available for driverId:', driverId);
        return;
      }

      console.log('Driver device token found, preparing notification message');

      // Prepare notification message
      const message = {
        notification: {
          title: 'New Trip Request',
          body: `Trip from ${tripRequest.pickup.address} to ${tripRequest.destination.address}`
        },
        data: {
          type: 'TRIP_REQUEST',
          tripRequestId: tripRequest._id.toString(),
          routeId: tripRequest.routeId.toString(),
          pickup: tripRequest.pickup.address,
          destination: tripRequest.destination.address,
          departureTime: tripRequest.departureTime.toISOString(),
          expectedPrice: tripRequest.expectedPrice.toString()
        },
        token: driver.deviceToken
      };

      console.log('Sending notification with message:', message);

      // Send notification
      const response = await admin.messaging().send(message);
      console.log('Successfully sent notification:', response);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService(); 