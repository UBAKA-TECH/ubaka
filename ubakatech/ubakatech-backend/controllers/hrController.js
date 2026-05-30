import prisma, { isDbConnected } from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

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
    console.error(`[HRController] Error reading file ${fileName}:`, err.message);
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
    console.error(`[HRController] Error saving file ${fileName}:`, err.message);
    return false;
  }
}

// ─── MOCK DATA (DB-disconnected fallback) ──────────────────────────────────────

export let MOCK_ONBOARDING = [
  {
    id: 'onb-1', employeeId: 'mock-dev-id', employeeName: 'Benit Gilbert', employeeAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit',
    task: 'Sign Employment Contract', category: 'Legal', isComplete: true, dueDate: null, completedAt: new Date().toISOString(), createdAt: new Date().toISOString()
  },
  {
    id: 'onb-2', employeeId: 'mock-dev-id', employeeName: 'Benit Gilbert', employeeAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit',
    task: 'Complete Security Training', category: 'IT Setup', isComplete: false, dueDate: null, completedAt: null, createdAt: new Date().toISOString()
  },
  {
    id: 'onb-3', employeeId: 'mock-dev-id', employeeName: 'Benit Gilbert', employeeAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit',
    task: 'Set Up Development Environment', category: 'IT Setup', isComplete: false, dueDate: null, completedAt: null, createdAt: new Date().toISOString()
  }
];

export let MOCK_APPROVALS = [
  {
    id: 'apr-1', type: 'time_off', status: 'pending', title: 'Annual Leave — 3 Days',
    description: 'Taking leave for a family event.', startDate: '2026-06-10', endDate: '2026-06-12',
    amount: null, employeeId: 'mock-pm-id', employeeName: 'Jane HR', employeeAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=jane',
    reviewerId: null, reviewerName: null, reviewNote: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'apr-2', type: 'hardware', status: 'pending', title: 'MacBook Pro M3 Max',
    description: 'Need upgrade for heavy build workloads.', startDate: null, endDate: null,
    amount: 3499, employeeId: 'mock-dev-id', employeeName: 'Benit Gilbert', employeeAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit',
    reviewerId: null, reviewerName: null, reviewNote: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'apr-3', type: 'expense', status: 'approved', title: 'AWS re:Invent Conference',
    description: 'Travel and accommodation for conference.', startDate: null, endDate: null,
    amount: 1200, employeeId: 'mock-pm-id', employeeName: 'Jane HR', employeeAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=jane',
    reviewerId: 'mock-dev-id', reviewerName: 'Benit Gilbert', reviewNote: 'Approved — within training budget.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }
];

export let MOCK_HARDWARE = [
  {
    id: 'hw-1', name: 'MacBook Pro M2', serialNumber: 'SN-MBP-001', type: 'laptop', brand: 'Apple',
    specs: '16GB RAM, 512GB SSD', status: 'assigned', purchasedAt: '2024-01-15', warrantyUntil: '2027-01-15',
    assignedToId: 'mock-dev-id', assignedToName: 'Benit Gilbert', assignedAt: '2024-01-20', notes: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'hw-2', name: 'Dell 4K Monitor 27"', serialNumber: 'SN-MON-002', type: 'monitor', brand: 'Dell',
    specs: '4K UHD, 144Hz', status: 'available', purchasedAt: '2024-03-01', warrantyUntil: '2027-03-01',
    assignedToId: null, assignedToName: null, assignedAt: null, notes: 'Available in Kigali office',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  },
  {
    id: 'hw-3', name: 'iPhone 15 Pro', serialNumber: 'SN-PHN-003', type: 'phone', brand: 'Apple',
    specs: '256GB, Titanium', status: 'assigned', purchasedAt: '2024-09-20', warrantyUntil: '2025-09-20',
    assignedToId: 'mock-pm-id', assignedToName: 'Jane HR', assignedAt: '2024-09-22', notes: 'For mobile QA testing',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }
];

export let MOCK_SAAS = [
  { id: 'saas-1', tool: 'GitHub Enterprise', category: 'DevOps', totalSeats: 10, usedSeats: 2, costPerSeat: 21, renewalDate: '2027-01-01', notes: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'saas-2', tool: 'Figma Professional', category: 'Design', totalSeats: 5, usedSeats: 1, costPerSeat: 15, renewalDate: '2026-12-01', notes: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'saas-3', tool: 'Slack Pro', category: 'Communication', totalSeats: 15, usedSeats: 2, costPerSeat: 7.25, renewalDate: '2026-11-01', notes: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'saas-4', tool: 'AWS Developer', category: 'DevOps', totalSeats: 5, usedSeats: 1, costPerSeat: 0, renewalDate: null, notes: 'Pay-as-you-go', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

export let MOCK_CERTIFICATIONS = [
  {
    id: 'cert-1', employeeId: 'mock-dev-id', employeeName: 'Benit Gilbert', employeeAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit',
    name: 'AWS Solutions Architect Associate', issuer: 'Amazon Web Services',
    issuedAt: '2024-06-01', expiresAt: '2027-06-01', cost: 300, badgeUrl: null, createdAt: new Date().toISOString()
  }
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const requireHR = (req, res) => {
  const perms = req.user.permissions || [];
  if (!perms.includes('manage_hr') && !perms.includes('submit_requests')) {
    res.status(403).json({ error: 'Forbidden: HR Portal access required.' });
    return false;
  }
  return true;
};

const isHRAdmin = (req) => (req.user.permissions || []).includes('manage_hr');

// ─── ONBOARDING ──────────────────────────────────────────────────────────────

export const getOnboarding = async (req, res) => {
  if (!requireHR(req, res)) return;
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const employees = await prisma.employee.findMany({
        include: { onboardingTasks: true, role: true },
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      // Only return employees who have onboarding tasks
      const data = employees
        .filter(e => e.onboardingTasks.length > 0)
        .map(e => ({
          employeeId: e.id,
          employeeName: e.name,
          employeeAvatar: e.avatar,
          roleName: e.role?.name || 'Unknown',
          tasks: e.onboardingTasks,
          progress: e.onboardingTasks.length > 0
            ? Math.round((e.onboardingTasks.filter(t => t.isComplete).length / e.onboardingTasks.length) * 100)
            : 0
        }));
      return res.json(data);
    } catch (err) {
      console.warn('[HRController] DB error fetching onboarding:', err.message);
    }
  }

  // Mock fallback — group tasks by employee
  const grouped = {};
  for (const task of MOCK_ONBOARDING) {
    if (!grouped[task.employeeId]) {
      grouped[task.employeeId] = { employeeId: task.employeeId, employeeName: task.employeeName, employeeAvatar: task.employeeAvatar, tasks: [] };
    }
    grouped[task.employeeId].tasks.push(task);
  }
  return res.json(Object.values(grouped).map(g => ({
    ...g,
    progress: Math.round((g.tasks.filter(t => t.isComplete).length / g.tasks.length) * 100)
  })));
};

export const addOnboardingTask = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const { employeeId } = req.params;
  const { task, category, dueDate } = req.body;
  if (!task) return res.status(400).json({ error: 'Task description is required.' });

  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const created = await prisma.onboardingChecklist.create({
        data: { employeeId, task, category: category || 'General', dueDate: dueDate ? new Date(dueDate) : null }
      });
      return res.json({ success: true, task: created });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to add onboarding task.' });
    }
  }

  const newTask = { id: `onb-${Date.now()}`, employeeId, task, category: category || 'General', isComplete: false, dueDate: dueDate || null, completedAt: null, createdAt: new Date().toISOString() };
  MOCK_ONBOARDING.push(newTask);
  return res.json({ success: true, task: newTask });
};

export const updateOnboardingTask = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const { taskId } = req.params;
  const { isComplete } = req.body;

  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const updated = await prisma.onboardingChecklist.update({
        where: { id: taskId },
        data: { isComplete: !!isComplete, completedAt: isComplete ? new Date() : null }
      });
      return res.json({ success: true, task: updated });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update onboarding task.' });
    }
  }

  const idx = MOCK_ONBOARDING.findIndex(t => t.id === taskId);
  if (idx === -1) return res.status(404).json({ error: 'Task not found.' });
  MOCK_ONBOARDING[idx] = { ...MOCK_ONBOARDING[idx], isComplete: !!isComplete, completedAt: isComplete ? new Date().toISOString() : null };
  return res.json({ success: true, task: MOCK_ONBOARDING[idx] });
};

export const deleteOnboardingTask = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const { taskId } = req.params;

  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      await prisma.onboardingChecklist.delete({ where: { id: taskId } });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete onboarding task.' });
    }
  }

  MOCK_ONBOARDING = MOCK_ONBOARDING.filter(t => t.id !== taskId);
  return res.json({ success: true });
};

// ─── APPROVALS ───────────────────────────────────────────────────────────────

export const getApprovals = async (req, res) => {
  if (!requireHR(req, res)) return;
  const { status, mine } = req.query;
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const where = {};
      if (mine === 'true') where.employeeId = req.user.id;
      if (status) where.status = status;

      const approvals = await prisma.approvalRequest.findMany({
        where,
        include: {
          employee: { select: { id: true, name: true, avatar: true, title: true } },
          reviewer: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(approvals);
    } catch (err) {
      console.warn('[HRController] DB error fetching approvals:', err.message);
    }
  }

  let list = MOCK_APPROVALS;
  if (mine === 'true') list = list.filter(a => a.employeeId === req.user.id);
  if (status) list = list.filter(a => a.status === status);
  return res.json(list);
};

export const createApproval = async (req, res) => {
  if (!requireHR(req, res)) return;
  const { type, title, description, startDate, endDate, amount } = req.body;
  if (!type || !title) return res.status(400).json({ error: 'type and title are required.' });

  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const created = await prisma.approvalRequest.create({
        data: {
          type, title, description, amount: amount ? parseFloat(amount) : null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          employeeId: req.user.id
        },
        include: { employee: { select: { id: true, name: true, avatar: true } } }
      });
      if (req.io) req.io.emit('approval_updated', { action: 'created', approval: created });
      return res.json({ success: true, approval: created });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create approval request.' });
    }
  }

  const newApproval = {
    id: `apr-${Date.now()}`, type, status: 'pending', title, description: description || null,
    startDate: startDate || null, endDate: endDate || null, amount: amount ? parseFloat(amount) : null,
    employeeId: req.user.id, employeeName: req.user.name, employeeAvatar: req.user.avatar,
    reviewerId: null, reviewerName: null, reviewNote: null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  MOCK_APPROVALS.push(newApproval);
  if (req.io) req.io.emit('approval_updated', { action: 'created', approval: newApproval });
  return res.json({ success: true, approval: newApproval });
};

export const reviewApproval = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const { id } = req.params;
  const { status, reviewNote } = req.body;
  if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Status must be approved or rejected.' });

  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const updated = await prisma.approvalRequest.update({
        where: { id },
        data: { status, reviewNote: reviewNote || null, reviewerId: req.user.id },
        include: {
          employee: { select: { id: true, name: true, avatar: true } },
          reviewer: { select: { id: true, name: true } }
        }
      });
      if (req.io) req.io.emit('approval_updated', { action: 'reviewed', approval: updated });
      return res.json({ success: true, approval: updated });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to review approval request.' });
    }
  }

  const idx = MOCK_APPROVALS.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Approval request not found.' });
  MOCK_APPROVALS[idx] = { ...MOCK_APPROVALS[idx], status, reviewNote: reviewNote || null, reviewerId: req.user.id, reviewerName: req.user.name, updatedAt: new Date().toISOString() };
  if (req.io) req.io.emit('approval_updated', { action: 'reviewed', approval: MOCK_APPROVALS[idx] });
  return res.json({ success: true, approval: MOCK_APPROVALS[idx] });
};

// ─── HARDWARE FLEET ──────────────────────────────────────────────────────────

export const getHardware = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const assets = await prisma.hardwareAsset.findMany({
        include: { assignedTo: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(assets);
    } catch (err) {
      console.warn('[HRController] DB error fetching hardware:', err.message);
    }
  }
  return res.json(MOCK_HARDWARE);
};

export const createHardware = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const { name, serialNumber, type, brand, specs, purchasedAt, warrantyUntil, notes } = req.body;
  if (!name || !serialNumber || !type) return res.status(400).json({ error: 'name, serialNumber, and type are required.' });

  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const asset = await prisma.hardwareAsset.create({
        data: {
          name, serialNumber, type, brand: brand || null, specs: specs || null,
          purchasedAt: purchasedAt ? new Date(purchasedAt) : null,
          warrantyUntil: warrantyUntil ? new Date(warrantyUntil) : null,
          notes: notes || null
        }
      });
      return res.json({ success: true, asset });
    } catch (err) {
      if (err.code === 'P2002') return res.status(400).json({ error: 'Serial number already exists.' });
      return res.status(500).json({ error: 'Failed to register hardware asset.' });
    }
  }

  const newAsset = {
    id: `hw-${Date.now()}`, name, serialNumber, type, brand: brand || null, specs: specs || null,
    status: 'available', purchasedAt: purchasedAt || null, warrantyUntil: warrantyUntil || null,
    assignedToId: null, assignedToName: null, assignedAt: null, notes: notes || null,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  MOCK_HARDWARE.push(newAsset);
  return res.json({ success: true, asset: newAsset });
};

export const updateHardware = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const { id } = req.params;
  const { status, assignedToId, notes, warrantyUntil } = req.body;

  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const data = {};
      if (status) data.status = status;
      if (notes !== undefined) data.notes = notes;
      if (warrantyUntil !== undefined) data.warrantyUntil = warrantyUntil ? new Date(warrantyUntil) : null;
      if (assignedToId !== undefined) {
        data.assignedToId = assignedToId || null;
        data.assignedAt = assignedToId ? new Date() : null;
        data.status = assignedToId ? 'assigned' : 'available';
      }
      const updated = await prisma.hardwareAsset.update({
        where: { id },
        data,
        include: { assignedTo: { select: { id: true, name: true, avatar: true } } }
      });
      return res.json({ success: true, asset: updated });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update hardware asset.' });
    }
  }

  const idx = MOCK_HARDWARE.findIndex(h => h.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Asset not found.' });
  MOCK_HARDWARE[idx] = { ...MOCK_HARDWARE[idx], ...req.body, updatedAt: new Date().toISOString() };
  return res.json({ success: true, asset: MOCK_HARDWARE[idx] });
};

// ─── SAAS LICENSES ───────────────────────────────────────────────────────────

export const getSaas = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const licenses = await prisma.saasLicense.findMany({ orderBy: { tool: 'asc' } });
      return res.json(licenses);
    } catch (err) {
      console.warn('[HRController] DB error fetching SaaS:', err.message);
    }
  }
  return res.json(MOCK_SAAS);
};

export const createSaas = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const { tool, category, totalSeats, costPerSeat, renewalDate, notes } = req.body;
  if (!tool) return res.status(400).json({ error: 'tool name is required.' });

  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const license = await prisma.saasLicense.create({
        data: {
          tool, category: category || 'Productivity',
          totalSeats: parseInt(totalSeats) || 0,
          costPerSeat: costPerSeat ? parseFloat(costPerSeat) : null,
          renewalDate: renewalDate ? new Date(renewalDate) : null,
          notes: notes || null
        }
      });
      return res.json({ success: true, license });
    } catch (err) {
      if (err.code === 'P2002') return res.status(400).json({ error: 'SaaS tool already exists.' });
      return res.status(500).json({ error: 'Failed to add SaaS license.' });
    }
  }

  const newLicense = { id: `saas-${Date.now()}`, tool, category: category || 'Productivity', totalSeats: parseInt(totalSeats) || 0, usedSeats: 0, costPerSeat: costPerSeat ? parseFloat(costPerSeat) : null, renewalDate: renewalDate || null, notes: notes || null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  MOCK_SAAS.push(newLicense);
  return res.json({ success: true, license: newLicense });
};

export const updateSaas = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const { id } = req.params;
  const { totalSeats, usedSeats, costPerSeat, renewalDate, notes } = req.body;

  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const data = {};
      if (totalSeats !== undefined) data.totalSeats = parseInt(totalSeats);
      if (usedSeats !== undefined) data.usedSeats = parseInt(usedSeats);
      if (costPerSeat !== undefined) data.costPerSeat = costPerSeat ? parseFloat(costPerSeat) : null;
      if (renewalDate !== undefined) data.renewalDate = renewalDate ? new Date(renewalDate) : null;
      if (notes !== undefined) data.notes = notes;
      const updated = await prisma.saasLicense.update({ where: { id }, data });
      return res.json({ success: true, license: updated });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update SaaS license.' });
    }
  }

  const idx = MOCK_SAAS.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'SaaS license not found.' });
  MOCK_SAAS[idx] = { ...MOCK_SAAS[idx], ...req.body, updatedAt: new Date().toISOString() };
  return res.json({ success: true, license: MOCK_SAAS[idx] });
};

// ─── CERTIFICATIONS ──────────────────────────────────────────────────────────

export const getCertifications = async (req, res) => {
  if (!requireHR(req, res)) return;
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const certs = await prisma.certification.findMany({
        include: { employee: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(certs);
    } catch (err) {
      console.warn('[HRController] DB error fetching certifications:', err.message);
    }
  }
  return res.json(MOCK_CERTIFICATIONS);
};

export const createCertification = async (req, res) => {
  if (!requireHR(req, res)) return;
  const { employeeId, name, issuer, issuedAt, expiresAt, cost, badgeUrl } = req.body;
  const targetEmployee = employeeId || req.user.id;
  if (!name) return res.status(400).json({ error: 'Certification name is required.' });

  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const cert = await prisma.certification.create({
        data: {
          employeeId: targetEmployee, name, issuer: issuer || null,
          issuedAt: issuedAt ? new Date(issuedAt) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          cost: cost ? parseFloat(cost) : null,
          badgeUrl: badgeUrl || null
        },
        include: { employee: { select: { id: true, name: true, avatar: true } } }
      });
      return res.json({ success: true, certification: cert });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to log certification.' });
    }
  }

  const newCert = { id: `cert-${Date.now()}`, employeeId: targetEmployee, employeeName: req.user.name, employeeAvatar: req.user.avatar, name, issuer: issuer || null, issuedAt: issuedAt || null, expiresAt: expiresAt || null, cost: cost ? parseFloat(cost) : null, badgeUrl: badgeUrl || null, createdAt: new Date().toISOString() };
  MOCK_CERTIFICATIONS.push(newCert);
  return res.json({ success: true, certification: newCert });
};

// ─── PEOPLE ANALYTICS ────────────────────────────────────────────────────────

export const getAnalytics = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const [employees, approvals, hardware, saas, certs] = await Promise.all([
        prisma.employee.findMany({ include: { role: true }, where: { isActive: true } }),
        prisma.approvalRequest.findMany(),
        prisma.hardwareAsset.findMany(),
        prisma.saasLicense.findMany(),
        prisma.certification.findMany()
      ]);

      const roleBreakdown = {};
      for (const e of employees) {
        const roleName = e.role?.name || 'Unknown';
        roleBreakdown[roleName] = (roleBreakdown[roleName] || 0) + 1;
      }

      const approvalStats = { pending: 0, approved: 0, rejected: 0 };
      for (const a of approvals) approvalStats[a.status] = (approvalStats[a.status] || 0) + 1;

      const totalSeatCost = saas.reduce((sum, s) => sum + (s.usedSeats * (s.costPerSeat || 0)), 0);
      const totalWastedSeats = saas.reduce((sum, s) => sum + Math.max(0, s.totalSeats - s.usedSeats), 0);

      return res.json({
        headcount: employees.length,
        roleBreakdown,
        approvalStats,
        hardwareStats: {
          total: hardware.length,
          assigned: hardware.filter(h => h.status === 'assigned').length,
          available: hardware.filter(h => h.status === 'available').length
        },
        saasStats: {
          totalTools: saas.length,
          totalSeats: saas.reduce((s, l) => s + l.totalSeats, 0),
          usedSeats: saas.reduce((s, l) => s + l.usedSeats, 0),
          monthlyCost: Math.round(totalSeatCost * 100) / 100,
          wastedSeats: totalWastedSeats
        },
        certifications: certs.length
      });
    } catch (err) {
      console.warn('[HRController] DB error fetching analytics:', err.message);
    }
  }

  // Mock analytics
  const roleBreakdown = { 'System Administrator': 1, 'Software Engineer': 1 };
  return res.json({
    headcount: 2,
    roleBreakdown,
    approvalStats: { pending: 2, approved: 1, rejected: 0 },
    hardwareStats: { total: 3, assigned: 2, available: 1 },
    saasStats: { totalTools: 4, totalSeats: 35, usedSeats: 6, monthlyCost: 86.25, wastedSeats: 29 },
    certifications: MOCK_CERTIFICATIONS.length
  });
};

// ─── DASHBOARD STATS SUMMARY ────────────────────────────────────────────────

export const getHrStats = async (req, res) => {
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const [total, active, onLeave, openPositions, pendingOnboarding] = await Promise.all([
        prisma.employee.count(),
        prisma.employee.count({ where: { isActive: true } }),
        prisma.approvalRequest.count({ where: { type: 'time_off', status: 'approved' } }),
        prisma.approvalRequest.count({ where: { type: 'job_opening', status: 'pending' } }),
        prisma.onboardingChecklist.count({ where: { isComplete: false } })
      ]);
      return res.json({
        totalEmployees: total,
        activeEmployees: active,
        onLeave,
        openPositions,
        pendingOnboarding
      });
    } catch (err) {
      console.warn('[HRController] DB error in getHrStats:', err.message);
    }
  }

  // Mock fallback
  return res.json({
    totalEmployees: 2,
    activeEmployees: 2,
    onLeave: 0,
    openPositions: 1,
    pendingOnboarding: MOCK_ONBOARDING.filter(t => !t.isComplete).length
  });
};


// Get all client inquiries
export const getInquiries = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const inquiries = await getFileRecords('inquiries.json');
  return res.json(inquiries);
};

// Update client inquiry status
export const updateInquiryStatus = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const { id } = req.params;
  const { status } = req.body; // e.g. 'received', 'triaged', 'converted', 'rejected'

  if (!status) return res.status(400).json({ error: 'Status is required.' });

  const inquiries = await getFileRecords('inquiries.json');
  const idx = inquiries.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Inquiry not found.' });

  inquiries[idx].status = status;
  inquiries[idx].updatedAt = new Date().toISOString();
  await saveFileRecords('inquiries.json', inquiries);

  return res.json({ success: true, inquiry: inquiries[idx] });
};

// Get all job applications
export const getApplications = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const applications = await getFileRecords('applications.json');
  return res.json(applications);
};

// Update job application status
export const updateApplicationStatus = async (req, res) => {
  if (!isHRAdmin(req)) return res.status(403).json({ error: 'Forbidden: manage_hr permission required.' });
  const { id } = req.params;
  const { status } = req.body; // e.g. 'pending_review', 'interviewing', 'offered', 'rejected'

  if (!status) return res.status(400).json({ error: 'Status is required.' });

  const applications = await getFileRecords('applications.json');
  const idx = applications.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Application not found.' });

  applications[idx].status = status;
  applications[idx].updatedAt = new Date().toISOString();
  await saveFileRecords('applications.json', applications);

  return res.json({ success: true, application: applications[idx] });
};
