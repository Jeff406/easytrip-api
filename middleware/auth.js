const admin = require('firebase-admin');
const serviceAccount = require('../easytrip-bab08-firebase-adminsdk-fbsvc-1b66c19dad.json');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // For development, we'll use a simple initialization
  // In production, you should use proper service account credentials
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('Decoded token:', decodedToken);
      
      // Add the user's Firebase UID to the request
      req.user = { 
        uid: decodedToken.uid,
        email: decodedToken.email,
        phoneNumber: decodedToken.phone_number
      };
      
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 