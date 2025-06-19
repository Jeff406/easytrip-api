const admin = require('firebase-admin');
const User = require('../models/User');

class NotificationService {
  async sendTripRequestNotification(driverId, tripRequest) {
    try {
      console.log('Attempting to send notification to driver:', driverId);
      
      // Get driver's device token using driverId (which is the Firebase ID) and role
      const driver = await User.findOne({ firebaseId: driverId, role: 'driver' });
      console.log('Found driver in database:', driver ? 'Yes' : 'No');
      
      if (!driver) {
        console.log('Driver not found in database with firebaseId:', driverId, 'and role: driver');
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
          trip_request_id: tripRequest._id.toString(),
          trip_route_id: tripRequest.routeId.toString(),
          trip_pickup: tripRequest.pickup.address,
          trip_destination: tripRequest.destination.address,
          trip_departure_time: tripRequest.departureTime.toISOString(),
          trip_expected_price: tripRequest.expectedPrice.toString(),
          trip_transport_mode: tripRequest.transportMode
        },
        token: driver.deviceToken
      };

      console.log('Sending notification with message:', {
        ...message,
        token: message.token ? 'Token exists' : 'No token'
      });

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