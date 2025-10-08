// ==============================================
// controllers/messagesController.js
// Complete Messaging Controller with Clerk Auth Integration
// ==============================================

const { PrismaClient } = require('@prisma/client');
const { clerkClient } = require('@clerk/clerk-sdk-node');
const messageEvents = require('../services/messageEvents');
const prisma = new PrismaClient();

// ==============================================
// GET /api/messages - Get messages for a channel/DM
// ==============================================
exports.getMessages = async (req, res) => {
  try {
    const {
      channelId,
      directUserId,
      page = 1,
      limit = 50,
      search,
      before,
      after
    } = req.query;

    const userId = req.userId; // From Clerk auth middleware
    const userRole = req.userRole;

    let whereClause = {};
    
    // Channel messages
    if (channelId) {
      whereClause.channelId = parseInt(channelId);
      
      // Check if user has access to this channel
      const channel = await prisma.channel.findUnique({
        where: { id: parseInt(channelId) }
      });
      
      if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
      }
      
      // Role-based channel access
      if (channel.type === 'private' && userRole !== 'admin') {
        const participants = channel.participants || [];
        if (!participants.includes(userId)) {
          return res.status(403).json({ error: 'Access denied to this channel' });
        }
      }
    }
    
    // Direct messages between two users
    if (directUserId) {
      whereClause.OR = [
        { authorId: userId, directRecipientId: directUserId },
        { authorId: directUserId, directRecipientId: userId }
      ];
    }

    // Search functionality
    if (search) {
      whereClause.content = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Date filtering
    if (before) {
      whereClause.createdAt = { ...whereClause.createdAt, lt: new Date(before) };
    }
    if (after) {
      whereClause.createdAt = { ...whereClause.createdAt, gt: new Date(after) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: whereClause,
        include: {
          channel: {
            select: { id: true, name: true, type: true }
          },
          parent: {
            select: { id: true, content: true, authorId: true }
          },
          replies: {
            take: 3,
            select: { id: true, content: true, authorId: true, createdAt: true }
          },
          savedToJob: {
            select: { id: true, title: true, jobNumber: true }
          },
          savedToProperty: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.message.count({ where: whereClause })
    ]);

    // Get user info for messages using Clerk
    const userIds = [...new Set(messages.map(m => m.authorId))];
    const users = {};
    
    for (const userId of userIds) {
      try {
        const user = await clerkClient.users.getUser(userId);
        users[userId] = {
          id: userId,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.emailAddresses[0]?.emailAddress || 'Unknown User',
          avatar: user.imageUrl || null,
          role: user.publicMetadata?.role || 'technician'
        };
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        users[userId] = {
          id: userId,
          name: 'Unknown User',
          avatar: null,
          role: 'technician'
        };
      }
    }

    // Attach user info to messages
    const messagesWithUsers = messages.map(message => ({
      ...message,
      author: users[message.authorId]
    }));

    res.json({
      messages: messagesWithUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      },
      users
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// POST /api/messages - Send a new message
// ==============================================
exports.createMessage = async (req, res) => {
  try {
    const {
      content,
      channelId,
      directRecipientId,
      parentId,
      attachments = [],
      location,
      urgent = false
    } = req.body;

    const authorId = req.userId; // From Clerk auth

    // Validate required content
    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Message must have content or attachments' });
    }

    // Validate channel or direct message target
    if (!channelId && !directRecipientId) {
      return res.status(400).json({ error: 'Must specify channelId or directRecipientId' });
    }

    let messageData = {
      content,
      authorId,
      attachments: attachments.length > 0 ? attachments : null,
      location: location || null,
      parentId: parentId ? parseInt(parentId) : null
    };

    if (channelId) {
      // Validate channel access
      const channel = await prisma.channel.findUnique({
        where: { id: parseInt(channelId) }
      });
      
      if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
      }
      
      messageData.channelId = parseInt(channelId);
    }

    if (directRecipientId) {
      // For direct messages, we might need a special channel or handle differently
      // This is a simplified approach - you might want to create/find a DM channel
      messageData.directRecipientId = directRecipientId;
    }

    const message = await prisma.message.create({
      data: messageData,
      include: {
        channel: {
          select: { id: true, name: true, type: true }
        },
        parent: {
          select: { id: true, content: true, authorId: true }
        }
      }
    });

    // Get author info from Clerk
    let author;
    try {
      const user = await clerkClient.users.getUser(authorId);
      author = {
        id: authorId,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.emailAddresses[0]?.emailAddress || 'Unknown User',
        avatar: user.imageUrl || null,
        role: user.publicMetadata?.role || 'technician'
      };
    } catch (error) {
      console.error('Error fetching author info:', error);
      author = {
        id: authorId,
        name: 'Unknown User',
        avatar: null,
        role: 'technician'
      };
    }

    const messageWithAuthor = {
      ...message,
      author
    };

    // Emit event for real-time updates
    messageEvents.emit('newMessage', messageWithAuthor);

    res.status(201).json(messageWithAuthor);

  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// PUT /api/messages/:id - Update a message (edit)
// ==============================================
exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const message = await prisma.message.findUnique({
      where: { id: parseInt(id) }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only author or admin can edit
    const userRole = req.userRole;
    if (message.authorId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(id) },
      data: {
        content,
        edited: true,
        updatedAt: new Date()
      },
      include: {
        channel: {
          select: { id: true, name: true, type: true }
        }
      }
    });

    res.json(updatedMessage);

  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// DELETE /api/messages/:id - Delete a message
// ==============================================
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const message = await prisma.message.findUnique({
      where: { id: parseInt(id) }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only author, admin, or manager can delete
    if (message.authorId !== userId && userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await prisma.message.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// POST /api/messages/:id/reactions - Add/remove reaction
// ==============================================
exports.toggleReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.userId;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const message = await prisma.message.findUnique({
      where: { id: parseInt(id) }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    let reactions = message.reactions || {};
    
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    const userIndex = reactions[emoji].indexOf(userId);
    
    if (userIndex > -1) {
      // Remove reaction
      reactions[emoji].splice(userIndex, 1);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    } else {
      // Add reaction
      reactions[emoji].push(userId);
    }

    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(id) },
      data: { reactions }
    });

    res.json(updatedMessage);

  } catch (error) {
    console.error('Error toggling reaction:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// POST /api/messages/:id/save-to-job - Save message to job
// ==============================================
exports.saveToJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobId } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ error: 'Not authorized to save messages to jobs' });
    }

    const [message, job] = await Promise.all([
      prisma.message.findUnique({ where: { id: parseInt(id) } }),
      prisma.job.findUnique({ where: { id: parseInt(jobId) } })
    ]);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(id) },
      data: { savedToJobId: parseInt(jobId) },
      include: {
        savedToJob: {
          select: { id: true, title: true, jobNumber: true }
        }
      }
    });

    res.json(updatedMessage);

  } catch (error) {
    console.error('Error saving message to job:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// POST /api/messages/:id/save-to-property - Save message to property
// ==============================================
exports.saveToProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { propertyId } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ error: 'Not authorized to save messages to properties' });
    }

    const [message, property] = await Promise.all([
      prisma.message.findUnique({ where: { id: parseInt(id) } }),
      prisma.property.findUnique({ where: { id: parseInt(propertyId) } })
    ]);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(id) },
      data: { savedToPropertyId: parseInt(propertyId) },
      include: {
        savedToProperty: {
          select: { id: true, name: true }
        }
      }
    });

    res.json(updatedMessage);

  } catch (error) {
    console.error('Error saving message to property:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// GET /api/messages/channels - Get available channels
// ==============================================
// GET /api/messages/channels - Get available channels
exports.getChannels = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    let whereClause = {};
    
    // Role-based channel filtering
    if (userRole !== 'admin') {
      whereClause.OR = [
        { type: 'channel' }, // Public channels
        { 
          type: 'private',
          participants: { 
            array_contains: userId
          }
        }
      ];
    }

    const channels = await prisma.channel.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        participants: true,
        updatedAt: true,
        _count: {
          select: { messages: true }
        }
      },
      orderBy: [
        { type: 'asc' }, // channels first, then private
        { name: 'asc' }
      ]
    });

    // Add unread message counts (simplified)
    const channelsWithUnread = await Promise.all(
      channels.map(async (channel) => {
        const unreadCount = await prisma.message.count({
          where: {
            channelId: channel.id,
            createdAt: {
              gt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            },
            authorId: { not: userId }
          }
        });

        return {
          ...channel,
          messageCount: channel._count.messages,
          unreadCount
        };
      })
    );

    res.json(channelsWithUnread);

  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// GET /api/messages/direct/:userId - Get DM conversation
// ==============================================
exports.getDirectMessages = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const userId = req.userId;

    console.log(`Loading DMs between ${userId} and ${otherUserId}`);

    // Get direct messages between these two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            authorId: userId,
            directRecipientId: otherUserId
          },
          {
            authorId: otherUserId,
            directRecipientId: userId
          }
        ]
      },
      include: {
        parent: {
          select: { id: true, content: true, authorId: true }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 100
    });

    // Get user info from Clerk
    const users = {};
    for (const uid of [userId, otherUserId]) {
      try {
        const user = await clerkClient.users.getUser(uid);
        users[uid] = {
          id: uid,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.emailAddresses[0]?.emailAddress || 'Unknown User',
          avatar: user.imageUrl || null,
          role: user.publicMetadata?.role || 'technician'
        };
      } catch (error) {
        console.error(`Error fetching user ${uid}:`, error);
        users[uid] = {
          id: uid,
          name: 'Unknown User',
          avatar: null,
          role: 'technician'
        };
      }
    }

    const messagesWithUsers = messages.map(message => ({
      ...message,
      author: users[message.authorId]
    }));

    console.log(`Found ${messagesWithUsers.length} direct messages`);

    res.json({
      messages: messagesWithUsers,
      users
    });

  } catch (error) {
    console.error('Error fetching direct messages:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// POST /api/messages/channels - Create a new channel
// ==============================================
exports.createChannel = async (req, res) => {
  try {
    const { name, description, type = 'channel' } = req.body;
    const userId = req.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Channel name is required' });
    }

    // Check if channel name already exists
    const existing = await prisma.channel.findUnique({
      where: { name: name.trim().toLowerCase() }
    });

    if (existing) {
      return res.status(400).json({ error: 'Channel name already exists' });
    }

    const channel = await prisma.channel.create({
      data: {
        name: name.trim().toLowerCase(),
        description: description?.trim() || null,
        type,
        participants: type === 'private' ? [userId] : null
      }
    });

    // Emit event for real-time updates
    messageEvents.emit('newChannel', channel);

    res.json(channel);

  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: error.message });
  }
};

// ==============================================
// GET /api/messages/events - SSE endpoint for real-time messages
// ==============================================
exports.subscribeToMessages = async (req, res) => {
  const userId = req.userId; // From Clerk auth

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send initial connection success
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  // Handler for new messages
  const messageHandler = (message) => {
    // Only send messages relevant to this user
    const isRelevant =
      message.channelId || // Channel message (all users can see)
      message.authorId === userId || // User sent it
      message.directRecipientId === userId; // User is recipient

    if (isRelevant) {
      res.write(`data: ${JSON.stringify({ type: 'newMessage', message })}\n\n`);
    }
  };

  // Handler for new channels (broadcast to all users)
  const channelHandler = (channel) => {
    res.write(`data: ${JSON.stringify({ type: 'newChannel', channel })}\n\n`);
  };

  // Register listeners
  messageEvents.on('newMessage', messageHandler);
  messageEvents.on('newChannel', channelHandler);

  // Send heartbeat every 30 seconds to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 30000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    messageEvents.removeListener('newMessage', messageHandler);
    messageEvents.removeListener('newChannel', channelHandler);
    res.end();
  });
};

// ==============================================
// EXPORT ALL CONTROLLER FUNCTIONS
// ==============================================
module.exports = {
  getMessages: exports.getMessages,
  createMessage: exports.createMessage,
  updateMessage: exports.updateMessage,
  deleteMessage: exports.deleteMessage,
  toggleReaction: exports.toggleReaction,
  saveToJob: exports.saveToJob,
  saveToProperty: exports.saveToProperty,
  getChannels: exports.getChannels,
  createChannel: exports.createChannel,
  getDirectMessages: exports.getDirectMessages,
  subscribeToMessages: exports.subscribeToMessages
};