const User = require('../models/User');
const admin = require('firebase-admin');

exports.updateDeviceToken = async (req, res) => {
  try {
    const { token } = req.body;
    const firebaseId = req.user.uid; // Get the Firebase UID from the verified token

    console.log('Updating device token for user:', {
      firebaseId,
      hasToken: !!token
    });

    if (!token) {
      return res.status(400).json({ message: 'Device token is required' });
    }

    if (!firebaseId) {
      console.error('No Firebase ID available in request');
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get user info from Firebase
    let userInfo = {};
    try {
      const userRecord = await admin.auth().getUser(firebaseId);
      userInfo = {
        displayName: userRecord.displayName,
        email: userRecord.email
      };
    } catch (error) {
      console.error('Error getting user info from Firebase:', error);
    }

    // Find user by firebaseId and update device token and user info
    const user = await User.findOneAndUpdate(
      { firebaseId },
      { 
        firebaseId, // Ensure firebaseId is set
        displayName: userInfo.displayName,
        email: userInfo.email,
        deviceToken: token,
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true // Create user if doesn't exist
      }
    );

    console.log('Device token updated successfully for user:', {
      firebaseId: user.firebaseId,
      displayName: user.displayName,
      email: user.email,
      hasDeviceToken: !!user.deviceToken
    });

    res.json({
      message: 'Device token updated successfully',
      user: {
        firebaseId: user.firebaseId,
        displayName: user.displayName,
        email: user.email,
        hasDeviceToken: !!user.deviceToken
      }
    });
  } catch (error) {
    console.error('Error updating device token:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 