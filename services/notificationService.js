const admin = require('firebase-admin');
const User = require('../models/User');

class NotificationService {
  async validateDeviceToken(token) {
    try {
      // Try to send a test message to validate the token
      const testMessage = {
        data: {
          test: 'validation'
        },
        token: token
      };
      
      await admin.messaging().send(testMessage);
      return true;
    } catch (error) {
      console.log('Token validation failed:', error.code);
      return false;
    }
  }

  async cleanupInvalidToken(driverId) {
    try {
      await User.findOneAndUpdate(
        { firebaseId: driverId },
        { $unset: { deviceToken: 1 } },
        { new: true }
      );
      console.log('Successfully removed invalid device token for driverId:', driverId);
      return true;
    } catch (error) {
      console.error('Error cleaning up invalid token:', error);
      return false;
    }
  }

  async updateDeviceToken(firebaseId, newToken, role = 'driver') {
    try {
      console.log(`Updating device token for user ${firebaseId} with role ${role}`);
      
      // Validate the new token before saving
      const isTokenValid = await this.validateDeviceToken(newToken);
      if (!isTokenValid) {
        console.log('New token is invalid, not saving');
        return false;
      }

      // Update the user's device token
      const user = await User.findOneAndUpdate(
        { firebaseId, role },
        { deviceToken: newToken, updatedAt: new Date() },
        { new: true, upsert: true }
      );

      console.log('Device token updated successfully for user:', {
        firebaseId: user.firebaseId,
        role: user.role,
        hasDeviceToken: !!user.deviceToken
      });

      return true;
    } catch (error) {
      console.error('Error updating device token:', error);
      return false;
    }
  }

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

      // Validate the device token before sending
      const isTokenValid = await this.validateDeviceToken(driver.deviceToken);
      if (!isTokenValid) {
        console.log('Invalid device token detected, cleaning up...');
        await this.cleanupInvalidToken(driverId);
        return;
      }

      console.log('Driver device token validated, preparing notification message');

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
      
      // Handle specific Firebase messaging errors
      if (error.code === 'messaging/registration-token-not-registered' || 
          error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        
        console.log('Invalid registration token detected, cleaning up...');
        await this.cleanupInvalidToken(driverId);
      }
      
      // Don't throw the error to prevent the trip request from failing
      // Just log it and continue
      console.log('Notification failed but trip request will continue');
    }
  }
}

module.exports = new NotificationService(); 