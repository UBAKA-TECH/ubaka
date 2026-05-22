import prisma, { isDbConnected } from '../config/db.js';

// Seed mock tasks store (in-memory) for fallback when database is disconnected
let MOCK_TASKS = [
  {
    id: 'task-1',
    title: 'Configure sign language model translation accuracy',
    description: 'Optimize training epochs for the Rwandan sign language converter to hit >95% verification rating.',
    status: 'in_progress',
    priority: 'high',
    projectId: 'proj-gesture-id', // Gesture to Speech
    assigneeId: 'mock-dev-id', // Benit Gilbert
    creatorId: 'mock-manager-id',
    createdAt: '2026-05-18T10:00:00Z',
    updatedAt: '2026-05-20T12:00:00Z'
  },
  {
    id: 'task-2',
    title: 'Setup bus route synchronization cron jobs',
    description: 'Create a background job that pulls bus GPS locations every 30 seconds and keeps Linker app updated.',
    status: 'todo',
    priority: 'medium',
    projectId: 'proj-linker-id', // Linker
    assigneeId: 'mock-dev-id', // Benit Gilbert
    creatorId: 'mock-manager-id',
    createdAt: '2026-05-20T09:00:00Z',
    updatedAt: '2026-05-20T09:00:00Z'
  },
  {
    id: 'task-3',
    title: 'Virtual 3D tour rendering optimizer',
    description: 'Compress video uploads for property visits on Homland to enable smooth viewing on mobile networks.',
    status: 'todo',
    priority: 'critical',
    projectId: 'proj-homland-id', // Homland
    assigneeId: null, // Unassigned
    creatorId: 'mock-manager-id',
    createdAt: '2026-05-21T08:00:00Z',
    updatedAt: '2026-05-21T08:00:00Z'
  },
  {
    id: 'task-4',
    title: 'Fix checkout cart crash on multi-vendor split payment',
    description: 'Ensure checkout logic doesn\'t throw Stripe exception when cart contains items from multiple vendors.',
    status: 'review',
    priority: 'critical',
    projectId: 'proj-impressa-id', // Impressa
    assigneeId: 'mock-dev-id', // Benit Gilbert
    creatorId: 'mock-manager-id',
    createdAt: '2026-05-19T14:30:00Z',
    updatedAt: '2026-05-21T10:00:00Z'
  },
  {
    id: 'task-5',
    title: 'Deploy Linker staging server on Render',
    description: 'Setup automatic github workflow deployment to Render environment for QA tester verification.',
    status: 'done',
    priority: 'low',
    projectId: 'proj-linker-id', // Linker
    assigneeId: 'mock-dev-id', // Benit Gilbert
    creatorId: 'mock-manager-id',
    createdAt: '2026-05-15T08:00:00Z',
    updatedAt: '2026-05-17T16:00:00Z'
  },
  {
    id: 'task-6',
    title: 'Create Rwandan sign language custom dictionaries',
    description: 'Marketers and content teams to record 100 new gestures definitions to sync into sign dictionary.',
    status: 'todo',
    priority: 'low',
    projectId: 'proj-gesture-id', // Gesture to speech
    assigneeId: 'mock-marketer-id',
    creatorId: 'mock-admin-id',
    createdAt: '2026-05-21T10:00:00Z',
    updatedAt: '2026-05-21T10:00:00Z'
  }
];

// Helper to inject mock author details for frontend display
const enrichMockTask = (task) => {
  const assignees = {
    'mock-dev-id': { name: 'Benit Gilbert', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit' },
    'mock-marketer-id': { name: 'Growth Marketer', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=marketer' },
    'mock-admin-id': { name: 'Inzozi Admin', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin' }
  };
  return {
    ...task,
    assignee: task.assigneeId ? (assignees[task.assigneeId] || { name: 'Unknown User' }) : null
  };
};

// Fetch tasks
export const getTasks = async (req, res) => {
  const { projectId } = req.query; // Optional filter
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const filter = projectId ? { projectId } : {};
      const tasks = await prisma.task.findMany({
        where: filter,
        include: {
          assignee: { select: { name: true, avatar: true } },
          creator: { select: { name: true } }
        }
      });
      return res.json(tasks);
    } catch (err) {
      console.warn('[TaskController] Database query failed, falling back to mock tasks:', err.message);
    }
  }

  // Fallback
  let filtered = MOCK_TASKS;
  if (projectId) {
    filtered = MOCK_TASKS.filter(t => t.projectId === projectId);
  }
  return res.json(filtered.map(enrichMockTask));
};

// Create a task
export const createTask = async (req, res) => {
  const { title, description, status, priority, projectId, assigneeId, dueDate } = req.body;
  const creatorId = req.user.id;

  if (!title || !projectId) {
    return res.status(400).json({ error: 'Title and projectId are required fields' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const task = await prisma.task.create({
        data: {
          title,
          description,
          status: status || 'todo',
          priority: priority || 'medium',
          projectId,
          assigneeId: assigneeId || null,
          creatorId,
          dueDate: dueDate ? new Date(dueDate) : null
        },
        include: {
          assignee: { select: { name: true, avatar: true } }
        }
      });
      return res.status(201).json(task);
    } catch (err) {
      console.error('[TaskController] DB Error creating task:', err.message);
      return res.status(500).json({ error: 'Failed to create task on database' });
    }
  }

  // Mock Fallback
  const newTask = {
    id: `task-${Date.now()}`,
    title,
    description,
    status: status || 'todo',
    priority: priority || 'medium',
    projectId,
    assigneeId: assigneeId || null,
    creatorId,
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  MOCK_TASKS.push(newTask);
  return res.status(201).json(enrichMockTask(newTask));
};

// Update a task (e.g. dragging across columns on Kanban board)
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, assigneeId, dueDate } = req.body;

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const updated = await prisma.task.update({
        where: { id },
        data: {
          title,
          description,
          status,
          priority,
          assigneeId: assigneeId === '' ? null : assigneeId,
          dueDate: dueDate ? new Date(dueDate) : undefined
        },
        include: {
          assignee: { select: { name: true, avatar: true } }
        }
      });
      return res.json(updated);
    } catch (err) {
      console.error(`[TaskController] DB Error updating task ${id}:`, err.message);
      return res.status(500).json({ error: 'Failed to update task' });
    }
  }

  // Mock Fallback
  const taskIndex = MOCK_TASKS.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const updatedTask = {
    ...MOCK_TASKS[taskIndex],
    title: title !== undefined ? title : MOCK_TASKS[taskIndex].title,
    description: description !== undefined ? description : MOCK_TASKS[taskIndex].description,
    status: status !== undefined ? status : MOCK_TASKS[taskIndex].status,
    priority: priority !== undefined ? priority : MOCK_TASKS[taskIndex].priority,
    assigneeId: assigneeId !== undefined ? (assigneeId === '' ? null : assigneeId) : MOCK_TASKS[taskIndex].assigneeId,
    dueDate: dueDate !== undefined ? dueDate : MOCK_TASKS[taskIndex].dueDate,
    updatedAt: new Date().toISOString()
  };

  MOCK_TASKS[taskIndex] = updatedTask;
  return res.json(enrichMockTask(updatedTask));
};

// Delete a task
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      await prisma.task.delete({ where: { id } });
      return res.json({ success: true, message: 'Task deleted successfully' });
    } catch (err) {
      console.error(`[TaskController] DB Error deleting task ${id}:`, err.message);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  // Mock Fallback
  const taskIndex = MOCK_TASKS.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  MOCK_TASKS = MOCK_TASKS.filter(t => t.id !== id);
  return res.json({ success: true, message: 'Task deleted successfully (mock)' });
};
