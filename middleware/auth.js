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
      return res.status(401).json({ 
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ 
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
          details: 'Please refresh your token and try again'
        });
      }
      
      if (error.code === 'auth/invalid-token') {
        return res.status(401).json({ 
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
          details: 'The provided token is invalid'
        });
      }
      
      return res.status(401).json({ 
        message: 'Authentication failed',
        code: 'AUTH_FAILED',
        details: error.message
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error',
      code: 'SERVER_ERROR',
      details: 'An unexpected error occurred during authentication'
    });
  }
}; 