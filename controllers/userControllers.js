const User = require('../models/User');

exports.updateDeviceToken = async (req, res) => {
  try {
    const { token } = req.body;
    const firebaseId = req.user.uid; // Assuming you have authentication middleware that adds user info to req

    if (!token) {
      return res.status(400).json({ message: 'Device token is required' });
    }

    // Find user by firebaseId and update device token
    const user = await User.findOneAndUpdate(
      { firebaseId },
      { deviceToken: token },
      { new: true, upsert: true } // Create user if doesn't exist
    );

    res.json({
      message: 'Device token updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating device token:', error);
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 