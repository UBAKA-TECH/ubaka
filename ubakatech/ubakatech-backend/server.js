import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── In-Memory Audit Log (ring buffer, last 50 events) ──────────────────────────
const auditBuffer = [];
const MAX_AUDIT = 50;

export function pushAuditEvent({ actor, action, resource, resourceId }) {
  auditBuffer.unshift({
    actor: actor || 'System',
    action,
    resource: resource || '',
    resourceId: resourceId || null,
    createdAt: new Date().toISOString()
  });
  if (auditBuffer.length > MAX_AUDIT) auditBuffer.length = MAX_AUDIT;
}

// Attach audit pusher to request object
app.use((req, res, next) => {
  req.auditLog = pushAuditEvent;
  next();
});

// Attach socket.io instance
app.use((req, res, next) => {
  req.io = io;
  next();
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Audit log endpoint (authenticated)
import { protect as _protect } from './middleware/authMiddleware.js';
app.get('/api/audit', _protect, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 15, 50);
  res.json(auditBuffer.slice(0, limit));
});

// Import routers
import authRouter from './routes/authRoutes.js';
import projectsRouter from './routes/projectRoutes.js';
import tasksRouter from './routes/taskRoutes.js';
import messagesRouter from './routes/messageRoutes.js';
import delegationRouter from './routes/delegationRoutes.js';
import hrRouter from './routes/hrRoutes.js';
import publicRouter from './routes/publicRoutes.js';
import { seedRolesAndPermissions } from './config/roles.js';
import { startHealthMonitor } from './controllers/projectController.js';

// Seed Roles and Permissions
seedRolesAndPermissions();

// Start Live Status Health Monitor
startHealthMonitor();

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/delegations', delegationRouter);
app.use('/api/hr', hrRouter);
app.use('/api/public', publicRouter);

// WebSocket Connections
io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  // Join a specific project room or chat channel
  socket.on('join_channel', (channelName) => {
    socket.join(channelName);
    console.log(`[WebSocket] Client ${socket.id} joined channel: ${channelName}`);
  });

  // Handle task updates (drag and drop)
  socket.on('task_moved', (data) => {
    console.log(`[WebSocket] Task moved:`, data);
    // Broadcast movement to everyone in the project
    socket.to(data.projectId).emit('task_updated', data);
  });

  // Handle live chat message
  socket.on('send_message', (messageData) => {
    console.log(`[WebSocket] Message received:`, messageData);
    // Broadcast to the channel
    io.to(messageData.channel).emit('receive_message', messageData);
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

// Serve error message for missing routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Ubaka Tech MIS Backend Server is running!`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🔗 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
