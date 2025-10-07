const express = require('express');
const router = express.Router();
const { clerkClient } = require('@clerk/clerk-sdk-node');

// GET /api/clerk/users - Get all Clerk users
router.get('/users', async (req, res) => {
  try {
    // Fetch all users from Clerk
    const users = await clerkClient.users.getUserList();

    // Return the users list
    res.json(users.data || users);
  } catch (error) {
    console.error('Error fetching Clerk users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
