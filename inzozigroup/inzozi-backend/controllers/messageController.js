import prisma, { isDbConnected } from '../config/db.js';

// Seed mock messages store (in-memory) for fallback
let MOCK_MESSAGES = [
  {
    id: 'msg-1',
    content: 'Hello everyone! Welcome to the brand new INZOZI Group internal MIS and Control Plane.',
    channel: 'general',
    isDirect: false,
    recipientId: null,
    senderId: 'mock-admin-id',
    sender: { name: 'Inzozi Admin', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin' },
    createdAt: '2026-05-21T09:00:00Z'
  },
  {
    id: 'msg-2',
    content: 'Great to be here! This dashboard is exactly what we need to manage our projects without jumping between Trello, Slack and different admin ports.',
    channel: 'general',
    isDirect: false,
    recipientId: null,
    senderId: 'mock-dev-id',
    sender: { name: 'Benit Gilbert', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit' },
    createdAt: '2026-05-21T09:15:00Z'
  },
  {
    id: 'msg-3',
    content: 'Team, I\'ve uploaded 3 new products to Impressa. Can the Content Controller review and approve them?',
    channel: 'impressa',
    isDirect: false,
    recipientId: null,
    senderId: 'mock-marketer-id',
    sender: { name: 'Growth Marketer', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=marketer' },
    createdAt: '2026-05-21T10:30:00Z'
  },
  {
    id: 'msg-4',
    content: 'On it! I will review the descriptions and images right now through our Impressa Admin viewport here.',
    channel: 'impressa',
    isDirect: false,
    recipientId: null,
    senderId: 'mock-content-id',
    sender: { name: 'Content Controller', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=content' },
    createdAt: '2026-05-21T10:35:00Z'
  },
  {
    id: 'msg-5',
    content: 'Hey Benit, how is the gesture training database looking? Do we need to capture more sign datasets?',
    channel: 'gesture-to-speech',
    isDirect: false,
    recipientId: null,
    senderId: 'mock-manager-id',
    sender: { name: 'Project Manager', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=manager' },
    createdAt: '2026-05-21T11:00:00Z'
  },
  {
    id: 'msg-6',
    content: 'Yes, we need at least 50 more videos of sign repetitions to improve the model accuracy.',
    channel: 'gesture-to-speech',
    isDirect: false,
    recipientId: null,
    senderId: 'mock-dev-id',
    sender: { name: 'Benit Gilbert', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit' },
    createdAt: '2026-05-21T11:15:00Z'
  }
];

// Helper to get sender details
const getSenderDetails = (senderId) => {
  const users = {
    'mock-admin-id': { name: 'Inzozi Admin', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin' },
    'mock-dev-id': { name: 'Benit Gilbert', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit' },
    'mock-manager-id': { name: 'Project Manager', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=manager' },
    'mock-content-id': { name: 'Content Controller', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=content' },
    'mock-marketer-id': { name: 'Growth Marketer', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=marketer' },
    'mock-support-id': { name: 'Support Agent', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=support' }
  };
  return users[senderId] || { name: 'Unknown Employee', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=unknown' };
};

// Get messages for a channel
export const getMessagesByChannel = async (req, res) => {
  const { channel } = req.params;
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const messages = await prisma.message.findMany({
        where: { channel, isDirect: false },
        include: {
          sender: { select: { name: true, avatar: true } }
        },
        orderBy: { createdAt: 'asc' }
      });
      return res.json(messages);
    } catch (err) {
      console.warn('[MessageController] DB fetch failed, falling back to mock messages:', err.message);
    }
  }

  // Fallback
  const filtered = MOCK_MESSAGES.filter(m => m.channel === channel && !m.isDirect);
  return res.json(filtered);
};

// Send a message
export const createMessage = async (req, res) => {
  const { content, channel, isDirect, recipientId } = req.body;
  const senderId = req.user.id;

  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const message = await prisma.message.create({
        data: {
          content,
          channel: channel || 'general',
          isDirect: isDirect || false,
          recipientId: recipientId || null,
          senderId
        },
        include: {
          sender: { select: { name: true, avatar: true } }
        }
      });
      return res.status(201).json(message);
    } catch (err) {
      console.error('[MessageController] DB Error saving message:', err.message);
      return res.status(500).json({ error: 'Failed to save message to database' });
    }
  }

  // Fallback Mock
  const senderInfo = getSenderDetails(senderId);
  const newMessage = {
    id: `msg-${Date.now()}`,
    content,
    channel: channel || 'general',
    isDirect: isDirect || false,
    recipientId: recipientId || null,
    senderId,
    sender: senderInfo,
    createdAt: new Date().toISOString()
  };

  MOCK_MESSAGES.push(newMessage);
  return res.status(201).json(newMessage);
};
