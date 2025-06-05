const admin = require('firebase-admin');
const User = require('../models/User');

class NotificationService {
  async sendTripRequestNotification(driverId, tripRequest) {
    try {
      // Get driver's device token
      const driver = await User.findOne({ firebaseId: driverId });
      if (!driver || !driver.deviceToken) {
        console.log('Driver not found or no device token available');
        return;
      }

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