import prisma, { isDbConnected } from '../config/db.js';
import pg from 'pg';
const { Pool } = pg;

let impressaPool = null;

const queryImpressa = async (text, params) => {
  if (!process.env.IMPRESSA_DATABASE_URL) {
    return null;
  }
  if (!impressaPool) {
    impressaPool = new Pool({
      connectionString: process.env.IMPRESSA_DATABASE_URL
    });
  }
  const client = await impressaPool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
};

// Hardcoded initial list of Inzozi Group projects
const INITIAL_PROJECTS = [
  {
    id: 'proj-impressa-id',
    name: 'Impressa',
    slug: 'impressa',
    description: 'Unified commerce and multi-vendor marketplace platform with hybrid POS and shift reconciliation.',
    status: 'active',
    repositoryUrl: 'https://github.com/Benitgilbert/impressa.git',
    liveUrl: 'https://impressa-ecom.inzozi.com',
    metrics: {
      uptime: '99.94%',
      activeUsers: 1420,
      apiHealth: 'healthy',
      serverLoad: '28%',
      weeklyRevenue: '$14,240'
    }
  }
];

// Mock Impressa products waiting for admin approval
let MOCK_IMPRESSA_APPROVALS = [
  {
    id: 'prod-approval-1',
    name: 'Custom Linen Shirt - Summer Collection',
    sellerName: 'Kigali Threads Ltd',
    price: 32.50,
    category: 'Apparel',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=150',
    createdAt: '2026-05-20T10:30:00Z',
    status: 'pending'
  },
  {
    id: 'prod-approval-2',
    name: 'Bamboo Bluetooth Wireless Headphones',
    sellerName: 'GreenTech Rwanda',
    price: 89.00,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150',
    createdAt: '2026-05-21T08:15:00Z',
    status: 'pending'
  },
  {
    id: 'prod-approval-3',
    name: 'Organic Shea Butter Soap (Pack of 3)',
    sellerName: 'Nyungwe Natural Cosmetics',
    price: 15.00,
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1607006342411-9a3363b63b2f?w=150',
    createdAt: '2026-05-21T14:45:00Z',
    status: 'pending'
  }
];

// Mock Impressa support tickets
let MOCK_IMPRESSA_TICKETS = [
  {
    id: 'tick-impressa-1',
    subject: 'Failed payment on Order #IMP-20412',
    userEmail: 'jean.paul@gmail.com',
    priority: 'high',
    status: 'open',
    createdAt: '2026-05-21T11:20:00Z'
  },
  {
    id: 'tick-impressa-2',
    subject: 'Vendor verification approval delay',
    userEmail: 'boutique.chic@inzozi.com',
    priority: 'normal',
    status: 'in_progress',
    createdAt: '2026-05-20T15:40:00Z'
  }
];

// Get all projects
export const getProjects = async (req, res) => {
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      let projects = await prisma.project.findMany();
      if (projects.length === 0) {
        // Seed initial projects
        console.log('[ProjectController] Seeding initial projects in database...');
        await prisma.project.createMany({
          data: INITIAL_PROJECTS.map(({ metrics, ...p }) => p)
        });
        projects = await prisma.project.findMany();
      }
      
      // Inject metrics into DB records
      const projectsWithMetrics = projects.map(p => {
        const match = INITIAL_PROJECTS.find(init => init.slug === p.slug);
        return {
          ...p,
          metrics: match ? match.metrics : { uptime: '100%', activeUsers: 0, apiHealth: 'healthy', serverLoad: '0%' }
        };
      });
      
      return res.json(projectsWithMetrics);
    } catch (err) {
      console.warn('[ProjectController] Error fetching projects from database, falling back to mock:', err.message);
    }
  }

  // Fallback
  return res.json(INITIAL_PROJECTS);
};

// Get single project details & health
export const getProjectBySlug = async (req, res) => {
  const { slug } = req.params;
  const dbActive = await isDbConnected();

  let project;
  if (dbActive) {
    try {
      project = await prisma.project.findUnique({ where: { slug } });
    } catch (err) {
      console.warn('[ProjectController] Error finding project by slug in database:', err.message);
    }
  }

  if (!project) {
    project = INITIAL_PROJECTS.find(p => p.slug === slug);
  }

  if (!project) {
    return res.status(404).json({ error: `Project '${slug}' not found` });
  }

  // Add metrics
  const mockMatch = INITIAL_PROJECTS.find(p => p.slug === slug);
  return res.json({
    ...project,
    metrics: mockMatch ? mockMatch.metrics : { uptime: '100%', activeUsers: 0, apiHealth: 'healthy', serverLoad: '0%' }
  });
};

// IMPRESSA Admin Activities: List products pending approval
export const getPendingImpressaApprovals = async (req, res) => {
  try {
    const realProducts = await queryImpressa(`
      SELECT p.id, p.name, p.price, p."approvalStatus" as status, p."createdAt", p.image, 
             COALESCE(u."storeName", u.name) as "sellerName", c.name as category 
      FROM "Product" p
      LEFT JOIN "User" u ON p."sellerId" = u.id
      LEFT JOIN "_ProductToCategory" pc ON p.id = pc."B"
      LEFT JOIN "Category" c ON pc."A" = c.id
      WHERE p."approvalStatus" = 'pending'
      ORDER BY p."createdAt" DESC
    `);
    
    if (realProducts) {
      return res.json(realProducts);
    }
  } catch (err) {
    console.error("⚠️ Failed to fetch pending products from real Impressa DB, falling back to mock:", err.message);
  }
  res.json(MOCK_IMPRESSA_APPROVALS);
};

// IMPRESSA Admin Activities: Approve/Reject product
export const updateImpressaProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  try {
    if (process.env.IMPRESSA_DATABASE_URL) {
      const visibility = status === 'approved' ? 'public' : 'hidden';
      const approvedBy = req.user?.id || 'inzozi-admin';
      const approvedAt = new Date();

      const result = await queryImpressa(`
        UPDATE "Product" 
        SET "approvalStatus" = $1, "approvalNote" = $2, "approvedBy" = $3, "approvedAt" = $4, "visibility" = $5
        WHERE id = $6
        RETURNING id, name, "approvalStatus"
      `, [status, note || '', approvedBy, approvedAt, visibility, id]);

      if (result && result.length > 0) {
        console.log(`[ProjectController] Real Impressa Product ID ${id} set to ${status}. Note: ${note || 'None'}`);
        return res.json({
          success: true,
          message: `Product successfully ${status} in real Impressa database.`,
          product: result[0]
        });
      } else {
        return res.status(404).json({ error: 'Product not found in real Impressa database.' });
      }
    }
  } catch (err) {
    console.error("⚠️ Failed to update product in real Impressa DB:", err.message);
    return res.status(500).json({ error: `Failed to update product in database: ${err.message}` });
  }

  // Update in mock store
  const productIndex = MOCK_IMPRESSA_APPROVALS.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product approval request not found' });
  }

  const updatedProduct = {
    ...MOCK_IMPRESSA_APPROVALS[productIndex],
    status: status
  };

  // Remove from pending list (in-memory)
  MOCK_IMPRESSA_APPROVALS = MOCK_IMPRESSA_APPROVALS.filter(p => p.id !== id);

  console.log(`[ProjectController] Impressa Product ID ${id} set to ${status}. Note: ${note || 'None'}`);

  // Emit WebSocket real-time update
  if (req.io) {
    req.io.emit('impressa_approvals_updated', MOCK_IMPRESSA_APPROVALS);
  }

  return res.json({
    success: true,
    message: `Product successfully ${status}`,
    product: updatedProduct
  });
};

// IMPRESSA Admin Activities: Get Support Tickets
export const getImpressaTickets = async (req, res) => {
  try {
    const realTickets = await queryImpressa(`
      SELECT t.id, t.subject, t.description, t.status, t.priority, t."createdAt", u.email as "userEmail"
      FROM "Ticket" t
      LEFT JOIN "User" u ON t."userId" = u.id
      WHERE t.status != 'resolved' AND t.status != 'closed'
      ORDER BY t."createdAt" DESC
    `);
    
    if (realTickets) {
      return res.json(realTickets);
    }
  } catch (err) {
    console.error("⚠️ Failed to fetch tickets from real Impressa DB, falling back to mock:", err.message);
  }
  res.json(MOCK_IMPRESSA_TICKETS.filter(t => t.status !== 'resolved'));
};

// IMPRESSA Admin Activities: Update Support Ticket (resolve or modify)
export const updateImpressaTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'open', 'in_progress', 'resolved'

  try {
    if (process.env.IMPRESSA_DATABASE_URL) {
      const result = await queryImpressa(`
        UPDATE "Ticket"
        SET status = $1
        WHERE id = $2
        RETURNING id, subject, status
      `, [status, id]);

      if (result && result.length > 0) {
        console.log(`[ProjectController] Real Impressa Ticket ID ${id} status updated to ${status}`);
        return res.json({
          success: true,
          message: `Ticket successfully updated to ${status} in real Impressa database.`,
          ticket: result[0]
        });
      } else {
        return res.status(404).json({ error: 'Ticket not found in real Impressa database.' });
      }
    }
  } catch (err) {
    console.error("⚠️ Failed to update ticket in real Impressa DB:", err.message);
    return res.status(500).json({ error: `Failed to update ticket in database: ${err.message}` });
  }

  const ticketIndex = MOCK_IMPRESSA_TICKETS.findIndex(t => t.id === id);
  if (ticketIndex === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  MOCK_IMPRESSA_TICKETS[ticketIndex].status = status;

  console.log(`[ProjectController] Impressa Ticket ID ${id} status updated to ${status}`);

  // Emit WebSocket real-time update
  if (req.io) {
    const activeTickets = MOCK_IMPRESSA_TICKETS.filter(t => t.status !== 'resolved');
    req.io.emit('impressa_tickets_updated', activeTickets);
  }

  return res.json({
    success: true,
    message: `Ticket successfully updated to ${status}`,
    ticket: MOCK_IMPRESSA_TICKETS[ticketIndex]
  });
};


// UI showcase metadata mapping for public landing page
const SHOWCASE_METADATA = {
  impressa: {
    tagline: 'Unified E-Commerce & Hybrid Retail POS',
    shortDesc: 'Sustaining local vendors and micro-businesses through modern hybrid e-commerce. Bridging storefronts and streetfronts.',
    icon: 'Smartphone',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    shadow: 'shadow-purple-500/10',
    stats: [
      { label: 'Active Vendors', value: '1,200+' },
      { label: 'Weekly Transactions', value: '7.4M RWF' },
      { label: 'Rwandan Regions Active', value: '5 Provinces' },
      { label: 'System Uptime', value: '99.98%' }
    ],
    details: {
      mission: 'To empower Rwandan SMEs and retail shops by merging their brick-and-mortar sales with a powerful digital marketplace. No vendor is left behind.',
      tech: ['React 19', 'Node.js Express', 'Supabase', 'PostgreSQL', 'Prisma ORM'],
      features: [
        'Unified POS cashier interface with strict shift cash management.',
        'Multi-vendor inventory synchronization and attributes catalog.',
        'Secure credit tracking system ("Abonne tracking") for loyal local customers.',
        'Audit-ready financial report PDF generation.'
      ]
    }
  },
  'gesture-to-speech': {
    tagline: 'Rwandan Sign Language (RSL) Translation System',
    shortDesc: 'Breaking daily communication barriers for deaf students and workers with real-time gesture-to-speech translation.',
    icon: 'Heart',
    gradient: 'from-rose-500 to-orange-500',
    shadow: 'shadow-rose-500/10',
    stats: [
      { label: 'Vocabulary signs', value: '12,000+' },
      { label: 'Translation Latency', value: '120ms' },
      { label: 'Model Accuracy', value: '98.4%' },
      { label: 'Schools Implemented', value: '8 centers' }
    ],
    details: {
      mission: 'Providing digital accessibility tools that enable seamless communication between Deaf signers and non-signing members of the community.',
      tech: ['TensorFlow.js', 'Python FastAPI', 'MediaPipe', 'WebRTC Streamer', 'React'],
      features: [
        'High-speed video frame hand and body pose tracking.',
        'Local dataset mapping Kinyarwanda dialects and RSL idioms.',
        'Voice synthesis engine supporting Kinyarwanda and English audio playback.',
        'Offline capability for school computers with low connectivity.'
      ]
    }
  },
  linker: {
    tagline: 'Smart Commuter Bus Booking Portal',
    shortDesc: 'Removing commuting stress and waiting lines through a digitized real-time booking and scheduling system.',
    icon: 'Globe',
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/10',
    stats: [
      { label: 'Daily Tickets Booked', value: '1,850+' },
      { label: 'Active Routes Mapped', value: '18 lines' },
      { label: 'Partner Operators', value: '5 agencies' },
      { label: 'Bus Terminal Sync', value: 'Real-time' }
    ],
    details: {
      mission: 'Transforming public transportation in Kigali and upcountry routes, replacing unorganized queuing with clean, scheduled seat bookings.',
      tech: ['React Native', 'Redis Queue', 'PostgreSQL', 'Socket.io', 'Twilio Gateway'],
      features: [
        'Real-time bus seat selection and live bus location tracker.',
        'Instant mobile ticket generation via SMS & dynamic QR Codes.',
        'Automated route load balancing for fleet managers.',
        'Mobile Money (MoMo) integration for instant payment checkout.'
      ]
    }
  },
  homland: {
    tagline: 'Virtual Real-Estate & Direct Rental Portal',
    shortDesc: 'Helping tenants meet property owners directly, verifying spaces via virtual tours to eliminate broker scams.',
    icon: 'Home',
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/10',
    stats: [
      { label: 'Verified Properties', value: '2,400+' },
      { label: 'Active Owners', value: '650+' },
      { label: 'Broker Fee Savings', value: '100%' },
      { label: 'Virtual Tours Loaded', value: '1,500+' }
    ],
    details: {
      mission: 'Creating a highly transparent rental market where university students and families can confidently rent houses, apartments, and offices without broker exploitation.',
      tech: ['Vite React', 'Three.js 3D Viewer', 'Cloudinary', 'Node.js', 'PostgreSQL'],
      features: [
        '180° and 360° virtual property walk-throughs.',
        'Direct in-app messaging between landlord and prospective tenants.',
        'Standardized digital lease drafting and rent payment tracking.',
        'Direct validation system (INZOZI staff physically inspect listed listings).'
      ]
    }
  }
};

// Expose public showcase projects for unauthenticated landing page
export const getPublicShowcaseProjects = async (req, res) => {
  const dbActive = await isDbConnected();
  let projects = [];

  if (dbActive) {
    try {
      projects = await prisma.project.findMany();
      if (projects.length === 0) {
        console.log('[ProjectController] Seeding initial projects in database...');
        await prisma.project.createMany({
          data: INITIAL_PROJECTS.map(({ metrics, ...p }) => p)
        });
        projects = await prisma.project.findMany();
      }
    } catch (err) {
      console.warn('[ProjectController] DB error fetching showcase projects, falling back to mock:', err.message);
      projects = INITIAL_PROJECTS;
    }
  } else {
    projects = INITIAL_PROJECTS;
  }

  // Map and merge with dynamic showcase layout attributes
  const showcaseProjects = projects.map(p => {
    const slug = p.slug;
    const metadata = SHOWCASE_METADATA[slug] || {
      tagline: 'INZOZI Group Dynamic Ecosystem Portfolio',
      shortDesc: p.description || 'Creating custom technology solutions to improve community workflows and access.',
      icon: 'Layers',
      gradient: 'from-purple-500 to-indigo-500',
      shadow: 'shadow-purple-500/10',
      stats: [
        { label: 'Project Status', value: p.status.toUpperCase() },
        { label: 'Uptime', value: '100%' },
        { label: 'API Status', value: 'Active' },
        { label: 'Server Load', value: 'Normal' }
      ],
      details: {
        mission: p.description || 'Optimizing community operations with next-generation digital applications.',
        tech: ['React', 'Node.js', 'PostgreSQL'],
        features: ['Optimized backend interfaces.', 'Secure role controls and access audits.']
      }
    };

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      status: p.status,
      repositoryUrl: p.repositoryUrl,
      liveUrl: p.liveUrl,
      tagline: metadata.tagline,
      shortDesc: metadata.shortDesc,
      iconName: metadata.icon,
      gradient: metadata.gradient,
      shadow: metadata.shadow,
      stats: metadata.stats,
      details: metadata.details
    };
  });

  return res.json(showcaseProjects);
};

