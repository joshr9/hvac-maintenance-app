const express = require('express');
const router = express.Router();
const { clerkClient } = require('@clerk/clerk-sdk-node');

// GET /api/clerk/users - Get all Clerk users
router.get('/users', async (req, res) => {
  try {
    // Check if Clerk is properly configured
    if (!process.env.CLERK_SECRET_KEY) {
      console.error('CLERK_SECRET_KEY not set in environment');
      return res.status(500).json({
        error: 'Clerk not configured',
        details: 'CLERK_SECRET_KEY environment variable is missing'
      });
    }

    // Fetch all users from Clerk
    const users = await clerkClient.users.getUserList();

    // Return the users list (handle both array and paginated response)
    const userList = users.data || users;
    console.log(`Fetched ${userList.length} users from Clerk`);
    res.json(userList);
  } catch (error) {
    console.error('Error fetching Clerk users:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      details: error.message
    });
  }
});

module.exports = router;
