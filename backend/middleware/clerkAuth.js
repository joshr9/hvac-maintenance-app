const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

const clerkAuth = ClerkExpressWithAuth({
  secretKey: process.env.CLERK_SECRET_KEY
});

const authenticateUser = async (req, res, next) => {
  try {
    if (!req.auth?.userId) {
      // Set CORS headers even on auth failure
      const origin = req.headers.origin;
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://app.deancallanm.com',
        'https://app.deancallanpm.com',
        'https://front-end-production-3ed1.up.railway.app',
        'https://hvac-maintenance-app-production.up.railway.app'
      ];

      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.userId = req.auth.userId;
    req.userRole = req.auth?.sessionClaims?.role || 'technician';

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    // Set CORS headers even on error
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://app.deancallanm.com',
      'https://app.deancallanpm.com',
      'https://front-end-production-3ed1.up.railway.app',
      'https://hvac-maintenance-app-production.up.railway.app'
    ];

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { clerkAuth, authenticateUser };
