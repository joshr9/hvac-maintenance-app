const { PrismaClient } = require('@prisma/client');
const { clerkClient } = require('@clerk/clerk-sdk-node');
const prisma = new PrismaClient();

// GET /api/tasks - Get tasks with filters and user auth
exports.getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      assignedTo,
      createdBy,
      linkedToJobId,
      linkedToPropertyId,
      dueDate,
      page = 1,
      limit = 20
    } = req.query;

    const userId = req.userId; // From Clerk auth
    let whereClause = {};

    // Filter based on user role
    const userRole = req.userRole;
    if (userRole !== 'admin' && userRole !== 'manager') {
      // Non-admin users only see their own tasks or tasks they created
      whereClause.OR = [
        { createdBy: userId },
        { assignees: { some: { userId: userId } } }
      ];
    }

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (linkedToJobId) whereClause.linkedToJobId = parseInt(linkedToJobId);
    if (linkedToPropertyId) whereClause.linkedToPropertyId = parseInt(linkedToPropertyId);
    if (createdBy) whereClause.createdBy = createdBy;

    if (dueDate) {
      const date = new Date(dueDate);
      whereClause.dueDate = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }

    if (assignedTo) {
      whereClause.assignees = {
        some: {
          userId: assignedTo
        }
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, totalCount] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        include: {
          assignees: true,
          comments: {
            take: 3,
            orderBy: { createdAt: 'desc' }
          },
          subtasks: {
            orderBy: { order: 'asc' }
          },
          linkedToJob: {
            select: { id: true, title: true, jobNumber: true }
          },
          linkedToProperty: {
            select: { id: true, name: true }
          },
          createdFromMessage: {
            select: { id: true, content: true, authorId: true }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: parseInt(limit)
      }),
      prisma.task.count({ where: whereClause })
    ]);

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/tasks - Create a new task with auth
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority = 'medium',
      assignedTo = [],
      dueDate,
      estimatedTime,
      linkedToJobId,
      linkedToPropertyId,
      subtasks = []
    } = req.body;

    const createdBy = req.userId; // From Clerk auth

    const task = await prisma.$transaction(async (tx) => {
      // Create the task
      const newTask = await tx.task.create({
        data: {
          title,
          description,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
          linkedToJobId: linkedToJobId ? parseInt(linkedToJobId) : null,
          linkedToPropertyId: linkedToPropertyId ? parseInt(linkedToPropertyId) : null,
          createdBy
        }
      });

      // Add assignees (convert Clerk user IDs to your user system)
      if (assignedTo.length > 0) {
        await tx.taskAssignee.createMany({
          data: assignedTo.map(userId => ({
            taskId: newTask.id,
            userId: userId // These should be Clerk user IDs
          }))
        });
      }

      // Add subtasks
      if (subtasks.length > 0) {
        await tx.subtask.createMany({
          data: subtasks.map((subtask, index) => ({
            taskId: newTask.id,
            title: subtask.title,
            order: index
          }))
        });
      }

      return newTask;
    });

    // Fetch the complete task with relations
    const completeTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        assignees: true,
        subtasks: { orderBy: { order: 'asc' } },
        linkedToJob: {
          select: { id: true, title: true, jobNumber: true }
        },
        linkedToProperty: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json(completeTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/tasks/from-message - Create task from message with auth
exports.createFromMessage = async (req, res) => {
  try {
    const {
      messageId,
      title,
      description,
      priority = 'medium',
      assignedTo = [],
      dueDate,
      estimatedTime,
      linkedToJobId,
      linkedToPropertyId
    } = req.body;

    const createdBy = req.userId; // From Clerk auth

    const task = await prisma.$transaction(async (tx) => {
      // Create the task
      const newTask = await tx.task.create({
        data: {
          title,
          description,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
          linkedToJobId: linkedToJobId ? parseInt(linkedToJobId) : null,
          linkedToPropertyId: linkedToPropertyId ? parseInt(linkedToPropertyId) : null,
          createdFromMessageId: parseInt(messageId),
          createdBy
        }
      });

      // Add assignees
      if (assignedTo.length > 0) {
        await tx.taskAssignee.createMany({
          data: assignedTo.map(userId => ({
            taskId: newTask.id,
            userId: userId
          }))
        });
      }

      // Update the message to link to this task
      await tx.message.update({
        where: { id: parseInt(messageId) },
        data: { createdFromTaskId: newTask.id }
      });

      return newTask;
    });

    // Fetch complete task
    const completeTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        assignees: true,
        linkedToJob: {
          select: { id: true, title: true, jobNumber: true }
        },
        linkedToProperty: {
          select: { id: true, name: true }
        },
        createdFromMessage: {
          select: { id: true, content: true, authorId: true }
        }
      }
    });

    res.status(201).json(completeTask);
  } catch (error) {
    console.error('Error creating task from message:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/tasks/:id/progress - Update task progress with auth
exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, status } = req.body;
    const userId = req.userId;

    // Check if user can update this task
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { assignees: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const userRole = req.userRole;
    const isAssigned = task.assignees.some(a => a.userId === userId);
    const isCreator = task.createdBy === userId;

    if (userRole !== 'admin' && userRole !== 'manager' && !isAssigned && !isCreator) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    let updateData = {};
    
    if (progress !== undefined) {
      updateData.progress = Math.max(0, Math.min(100, parseInt(progress)));
    }
    
    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
        updateData.progress = 100;
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        assignees: true,
        subtasks: { orderBy: { order: 'asc' } }
      }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task progress:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/tasks/:id - Get a specific task
async function getTask(req, res) {
  try {
    const id = parseInt(req.params.id);
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignees: true,
        comments: { orderBy: { createdAt: 'desc' } },
        subtasks: { orderBy: { order: 'asc' } },
        linkedToJob: { select: { id: true, title: true, jobNumber: true } },
        linkedToProperty: { select: { id: true, name: true } },
        createdFromMessage: { select: { id: true, content: true, authorId: true } },
      },
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });
    return res.json(task);
  } catch (e) {
    console.error('Error getTask:', e);
    return res.status(500).json({ error: e.message });
  }
}

// PUT /api/tasks/:id - Update task
async function updateTask(req, res) {
  try {
    const id = parseInt(req.params.id);
    const updated = await prisma.task.update({
      where: { id },
      data: req.body,
      include: {
        assignees: true,
        subtasks: { orderBy: { order: 'asc' } },
      },
    });
    return res.json(updated);
  } catch (e) {
    console.error('Error updateTask:', e);
    return res.status(500).json({ error: e.message });
  }
}

// DELETE /api/tasks/:id - Delete task
async function deleteTask(req, res) {
  try {
    const id = parseInt(req.params.id);
    await prisma.task.delete({ where: { id } });
    return res.status(204).end();
  } catch (e) {
    console.error('Error deleteTask:', e);
    return res.status(500).json({ error: e.message });
  }
}

// POST /api/tasks/:id/assign - Assign task to users
async function assignTask(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { assignedTo = [] } = req.body;

    // Replace all assignees with the provided list (adjust strategy as needed)
    await prisma.taskAssignee.deleteMany({ where: { taskId: id } });
    if (assignedTo.length) {
      await prisma.taskAssignee.createMany({
        data: assignedTo.map((userId) => ({ taskId: id, userId })),
      });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { assignees: true },
    });

    return res.json(task);
  } catch (e) {
    console.error('Error assignTask:', e);
    return res.status(500).json({ error: e.message });
  }
}

// POST /api/tasks/:id/comments - Add a comment to a task
async function addComment(req, res) {
  try {
    const id = parseInt(req.params.id);
    const { content } = req.body;
    const authorId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // If your Prisma model is named differently (e.g., taskComment), adjust `prisma.comment` accordingly
    const comment = await prisma.comment.create({
      data: {
        taskId: id,
        content,
        authorId,
      },
    });

    return res.status(201).json(comment);
  } catch (e) {
    console.error('Error addComment:', e);
    return res.status(500).json({ error: e.message });
  }
}

module.exports = {
  getTasks: exports.getTasks,
  createTask: exports.createTask,
  createFromMessage: exports.createFromMessage,
  updateProgress: exports.updateProgress,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
  addComment,
};
