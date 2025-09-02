const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');

const clerkAuth = ClerkExpressWithAuth({
  secretKey: process.env.CLERK_SECRET_KEY
});

const authenticateUser = async (req, res, next) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.userId = req.auth.userId;
    req.userRole = req.auth?.sessionClaims?.role || 'technician';
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { clerkAuth, authenticateUser };
