import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// Static Job Openings list
export const STATIC_JOBS = [
  {
    id: 'role-senior-frontend',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Gicumbi, Rwanda (Byumba / Hybrid)',
    type: 'Full-time',
    description: 'Lead the design and development of our next-generation responsive dashboard interfaces and client web portals using React 19, Vite, and Tailwind CSS v4.',
    requirements: [
      '3+ years of experience with React and modern JavaScript/TypeScript.',
      'Strong eye for visual design and pixel-perfect implementation.',
      'Experience with build configurations (Vite, Rollup) and state management.',
      'Strong communication skills and willingness to mentor junior developers.'
    ],
    benefits: [
      'Competitive salary in RWF/USD.',
      'Work in our office in Byumba with top-tier equipment.',
      'Flexible hours and hybrid work options (3 days office, 2 days remote).',
      'Full health insurance coverage & annual learning stipend.'
    ]
  },
  {
    id: 'role-uiux-designer',
    title: 'UI/UX Product Designer',
    department: 'Product & Design',
    location: 'Gicumbi, Rwanda (Byumba / Remote)',
    type: 'Full-time',
    description: 'Shape the visual language and user flows of civic and merchant tools. Design interfaces that feel human, fast, and accessible to low-bandwidth mobile users.',
    requirements: [
      'Portfolio demonstrating beautiful Web/Mobile product designs.',
      'Proficiency in Figma, vector artwork, and interactive prototyping.',
      'Deep empathy for real-world user workflows (local marketplace vendors, commuters).',
      'Basic understanding of frontend frameworks (React, HTML/CSS) to collaborate with engineers.'
    ],
    benefits: [
      'Flexible work location (fully remote option available).',
      'Figma Professional license and latest MacBook Pro setup.',
      'Health insurance & wellness budget.',
      'Creative workspace with collaborative design sprints.'
    ]
  },
  {
    id: 'role-backend-developer',
    title: 'Backend Systems Engineer',
    department: 'Engineering',
    location: 'Gicumbi, Rwanda (Gisuna / Office)',
    type: 'Full-time',
    description: 'Design robust database schemas, secure API gateways, and manage external integrations (EBM invoicing compliance, Mobile Money checkout triggers).',
    requirements: [
      '3+ years in Node.js, Express, PostgreSQL, and Prisma ORM or equivalent.',
      'Solid understanding of transactional databases, query optimization, and schema design.',
      'Experience with background processing, Redis, and WebSockets.',
      'Familiarity with containerized deployments (Docker) and AWS.'
    ],
    benefits: [
      'Highly competitive compensation.',
      'Workspace in a high-growth environment.',
      'Premium hardware & technical books budget.',
      'Annual team retreat.'
    ]
  },
  {
    id: 'role-qa-automation',
    title: 'QA Automation Specialist',
    department: 'Quality Assurance',
    location: 'Remote',
    type: 'Part-time / Contract',
    description: 'Ensure our systems work flawlessly across 100+ low-end smartphone devices. Write automated browser tests, stress test database operations, and document bug flows.',
    requirements: [
      'Experience writing Cypress, Playwright, or Selenium automation scripts.',
      'Familiarity with API testing tools (Postman, Jest).',
      'Analytical mindset with sharp attention to detail.',
      'Knowledge of CI/CD integration for automated tests.'
    ],
    benefits: [
      'Hourly competitive contract rates.',
      'Flexible remote schedule.',
      'Access to technical software licenses and hardware testing farm.'
    ]
  }
];

// Helper to ensure data directory and file exists
async function getFileRecords(fileName) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const filePath = path.join(DATA_DIR, fileName);
    try {
      const fileData = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileData);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File does not exist yet, write empty array
        await fs.writeFile(filePath, '[]', 'utf-8');
        return [];
      }
      throw err;
    }
  } catch (err) {
    console.error(`[PublicController] Error reading file ${fileName}:`, err.message);
    return [];
  }
}

// Helper to save records
async function saveFileRecords(fileName, records) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const filePath = path.join(DATA_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(records, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`[PublicController] Error saving file ${fileName}:`, err.message);
    return false;
  }
}

// Handler to submit a project request (inquiry)
export const createInquiry = async (req, res) => {
  const { name, email, org, serviceType, budget, timeline, description, features } = req.body;

  if (!name || !email || !serviceType || !budget || !timeline || !description) {
    return res.status(400).json({ error: 'Please provide all required fields (name, email, serviceType, budget, timeline, description).' });
  }

  try {
    const inquiries = await getFileRecords('inquiries.json');
    
    const trackingId = `UBK-INQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const newInquiry = {
      id: trackingId,
      name,
      email,
      org: org || 'Individual / Startup',
      serviceType,
      budget,
      timeline,
      description,
      features: features || [],
      status: 'received',
      createdAt: new Date().toISOString()
    };

    inquiries.push(newInquiry);
    await saveFileRecords('inquiries.json', inquiries);

    console.log(`[PublicController] New client inquiry created: ${trackingId} from ${email}`);
    
    return res.status(201).json({
      success: true,
      message: 'Your project inquiry was successfully received. We will contact you within 24 hours.',
      inquiry: newInquiry
    });
  } catch (err) {
    console.error('[PublicController] Failed to create inquiry:', err.message);
    return res.status(500).json({ error: 'Failed to save project request. Please try again.' });
  }
};

// Handler to list open job postings
export const getCareers = async (req, res) => {
  return res.json(STATIC_JOBS);
};

// Handler to apply for a job posting
export const applyJob = async (req, res) => {
  const { name, email, roleId, portfolioUrl, resumeUrl, pitch } = req.body;

  if (!name || !email || !roleId || !resumeUrl || !pitch) {
    return res.status(400).json({ error: 'Please fill in all required application fields (name, email, roleId, resumeUrl, pitch).' });
  }

  const roleMatch = STATIC_JOBS.find(j => j.id === roleId);
  if (!roleMatch) {
    return res.status(404).json({ error: 'Selected position does not exist or has been filled.' });
  }

  try {
    const applications = await getFileRecords('applications.json');
    const trackingId = `UBK-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newApplication = {
      id: trackingId,
      name,
      email,
      roleId,
      roleName: roleMatch.title,
      portfolioUrl: portfolioUrl || '',
      resumeUrl,
      pitch,
      status: 'pending_review',
      createdAt: new Date().toISOString()
    };

    applications.push(newApplication);
    await saveFileRecords('applications.json', applications);

    console.log(`[PublicController] New application received: ${trackingId} for ${roleMatch.title} from ${email}`);

    return res.status(201).json({
      success: true,
      message: 'Your application was received successfully. We will review it and get back to you shortly.',
      application: newApplication
    });
  } catch (err) {
    console.error('[PublicController] Failed to process application:', err.message);
    return res.status(500).json({ error: 'Failed to submit application. Please try again.' });
  }
};

// Handler to get public team members
export const getTeam = async (req, res) => {
  try {
    const team = await prisma.employee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        title: true,
        focus: true,
        avatar: true,
        department: true,
        location: true
      }
    });
    return res.json(team);
  } catch (err) {
    console.error('[PublicController] Failed to fetch team members:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve team members.' });
  }
};

// Handler to get capabilities services
export const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    return res.json(services);
  } catch (err) {
    console.error('[PublicController] Failed to fetch services:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve services.' });
  }
};

// Handler to get pricing packages
export const getPricing = async (req, res) => {
  try {
    const pricing = await prisma.pricingPackage.findMany();
    return res.json(pricing);
  } catch (err) {
    console.error('[PublicController] Failed to fetch pricing packages:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve pricing packages.' });
  }
};

// Handler to get retainer packages
export const getRetainers = async (req, res) => {
  try {
    const retainers = await prisma.retainerPackage.findMany();
    return res.json(retainers);
  } catch (err) {
    console.error('[PublicController] Failed to fetch retainer packages:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve retainer packages.' });
  }
};

// Handler to get FAQ list
export const getFaqs = async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { order: 'asc' }
    });
    return res.json(faqs);
  } catch (err) {
    console.error('[PublicController] Failed to fetch FAQs:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve FAQs.' });
  }
};

// Database connectivity debug handler
export const debugDb = async (req, res) => {
  let host = 'unknown';
  let pathName = 'unknown';
  let user = 'unknown';
  let queryParams = {};
  
  const dbUrl = process.env.DATABASE_URL || 'not set';
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
  
  try {
    const lastAt = dbUrl.lastIndexOf('@');
    if (lastAt !== -1) {
      const credentialsPart = dbUrl.substring(0, lastAt);
      const hostPart = dbUrl.substring(lastAt + 1);
      
      const hostUrl = new URL('http://' + hostPart);
      host = hostUrl.host;
      pathName = hostUrl.pathname;
      hostUrl.searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });
      
      const protocolEnd = credentialsPart.indexOf('://') + 3;
      if (protocolEnd > 2) {
        const userPassPart = credentialsPart.substring(protocolEnd);
        const colonIdx = userPassPart.indexOf(':');
        if (colonIdx !== -1) {
          user = userPassPart.substring(0, colonIdx);
        } else {
          user = userPassPart;
        }
      }
    }
  } catch (parseErr) {
    console.error('Failed to parse dbUrl details:', parseErr.message);
  }

  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    const count = await prisma.service.count();
    
    return res.json({
      success: true,
      message: 'Database check successful',
      maskedUrl,
      dbDetails: { host, pathName, user, queryParams },
      rawQueryResult: result,
      servicesCount: count
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database check failed',
      maskedUrl,
      dbDetails: { host, pathName, user, queryParams },
      error: err.message,
      stack: err.stack,
      env: process.env.NODE_ENV,
      dbLimit: process.env.DB_CONNECTION_LIMIT
    });
  }
};

