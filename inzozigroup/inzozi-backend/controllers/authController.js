import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma, { isDbConnected } from '../config/db.js';
import { ALL_ROLES, ALL_PERMISSIONS } from '../config/roles.js';

const JWT_SECRET = process.env.JWT_SECRET || 'inzozi_group_super_secret_jwt_key_12345';

// Dynamic mock delegations stored in memory for offline mode
export let MOCK_DELEGATIONS = [];

// Hardcoded mock users updated with the full Tech Company Roles
export const MOCK_EMPLOYEES = [
  {
    id: 'mock-admin-id',
    name: 'Inzozi Admin',
    email: 'admin@inzozi.com',
    passwordHash: '$2a$10$U9Hk2V.L6t9xR1WwS5i6zO.gM/1X5X6B1nKzP9fW4l1r.3D7E8lJy', // admin123
    role: 'sysadmin',
    title: 'System Administrator',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin'
  },
  {
    id: 'mock-dev-id',
    name: 'Benit Gilbert',
    email: 'dev@inzozi.com',
    passwordHash: '$2a$10$i/R114w.eD3yN5k8Y8R0h.7L9.JkP7U2D/g7TzK6lB6aD9f2Gkpyq', // dev123
    role: 'software_engineer',
    title: 'Software Engineer (Impressa Dev)',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit'
  },
  {
    id: 'mock-manager-id',
    name: 'HR Manager',
    email: 'manager@inzozi.com',
    passwordHash: '$2a$10$N2Gk.b2y.R1d5k8Y8R0h.2V9.JkP7U2D/g7TzK6lB6aD9f2Gkpyq', // manager123
    role: 'hr_manager',
    title: 'Human Resources Director',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=manager'
  },
  {
    id: 'mock-content-id',
    name: 'Gaju E-Commerce Moderator',
    email: 'content@inzozi.com',
    passwordHash: '$2a$10$K7Gk.b2y.R1d5k8Y8R0h.3V9.JkP7U2D/g7TzK6lB6aD9f2Gkpyq', // content123
    role: 'content_controller',
    title: 'Impressa Content Controller',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=content'
  },
  {
    id: 'mock-marketer-id',
    name: 'Growth Marketer',
    email: 'marketer@inzozi.com',
    passwordHash: '$2a$10$O8Gk.b2y.R1d5k8Y8R0h.4V9.JkP7U2D/g7TzK6lB6aD9f2Gkpyq', // marketer123
    role: 'growth_marketer',
    title: 'Digital Marketing Lead',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=marketer'
  },
  {
    id: 'mock-support-id',
    name: 'Support Agent',
    email: 'support@inzozi.com',
    passwordHash: '$2a$10$P9Gk.b2y.R1d5k8Y8R0h.5V9.JkP7U2D/g7TzK6lB6aD9f2Gkpyq', // support123
    role: 'customer_support',
    title: 'Customer Experience agent',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=support'
  },
  {
    id: 'mock-pm-id',
    name: 'Product Manager',
    email: 'pm@inzozi.com',
    passwordHash: '$2a$10$i/R114w.eD3yN5k8Y8R0h.7L9.JkP7U2D/g7TzK6lB6aD9f2Gkpyq', // dev123 (mapped to pm)
    role: 'product_manager',
    title: 'Senior Product Manager',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=pm'
  }
];

// Helper to resolve dynamic effective roles and permissions
export const resolveEffectiveUser = async (employee) => {
  const dbActive = await isDbConnected();
  let primaryRole = null;
  let activeDelegation = null;
  const effectivePermissions = new Set();
  
  if (dbActive) {
    try {
      // 1. Fetch employee and primary role with its permissions
      const dbEmp = await prisma.employee.findUnique({
        where: { id: employee.id },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          }
        }
      });
      
      if (dbEmp && dbEmp.role) {
        primaryRole = dbEmp.role;
        dbEmp.role.permissions.forEach(rp => {
          if (rp.permission) {
            effectivePermissions.add(rp.permission.code);
          }
        });
      }
      
      // 2. Fetch active delegations matching current date
      const now = new Date();
      const delegation = await prisma.delegation.findFirst({
        where: {
          employeeId: employee.id,
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now }
        },
        include: {
          targetRole: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          },
          authorizer: true
        }
      });
      
      if (delegation && delegation.targetRole) {
        activeDelegation = {
          id: delegation.id,
          targetRoleCode: delegation.targetRole.code,
          targetRoleName: delegation.targetRole.name,
          reason: delegation.reason,
          endDate: delegation.endDate,
          authorizerName: delegation.authorizer.name
        };
        
        delegation.targetRole.permissions.forEach(rp => {
          if (rp.permission) {
            effectivePermissions.add(rp.permission.code);
          }
        });
      }
    } catch (err) {
      console.warn('[AuthController] DB error resolving permissions, using memory:', err.message);
    }
  }
  
  // Fallback to Mock Mode
  if (!primaryRole) {
    const mockEmp = MOCK_EMPLOYEES.find(
      u => u.id === employee.id || u.email.toLowerCase() === employee.email.toLowerCase()
    );
    const mockUserRoleCode = mockEmp ? mockEmp.role : 'software_engineer';
    
    // Get mock role configuration
    const mockRoleConfig = ALL_ROLES.find(r => r.code === mockUserRoleCode);
    if (mockRoleConfig) {
      primaryRole = {
        code: mockRoleConfig.code,
        name: mockRoleConfig.name,
        isTechnical: mockRoleConfig.isTechnical
      };
      mockRoleConfig.permissions.forEach(p => effectivePermissions.add(p));
    }
    
    // Check in-memory MOCK_DELEGATIONS
    const now = new Date();
    const mockDelegation = MOCK_DELEGATIONS.find(d => 
      d.employeeId === employee.id &&
      d.isActive &&
      new Date(d.startDate) <= now &&
      new Date(d.endDate) >= now
    );
    
    if (mockDelegation) {
      const delegatedRoleConfig = ALL_ROLES.find(r => r.code === mockDelegation.targetRoleCode || r.id === mockDelegation.targetRoleId);
      const targetCode = delegatedRoleConfig ? delegatedRoleConfig.code : mockDelegation.targetRoleCode;
      const targetName = delegatedRoleConfig ? delegatedRoleConfig.name : 'Unknown Role';
      
      const authorizer = MOCK_EMPLOYEES.find(u => u.id === mockDelegation.authorizerId) || { name: 'Admin (Mock)' };
      
      activeDelegation = {
        id: mockDelegation.id,
        targetRoleCode: targetCode,
        targetRoleName: targetName,
        reason: mockDelegation.reason,
        endDate: mockDelegation.endDate,
        authorizerName: authorizer.name
      };
      
      if (delegatedRoleConfig) {
        delegatedRoleConfig.permissions.forEach(p => effectivePermissions.add(p));
      }
    }
  }
  
  return {
    primaryRole: primaryRole ? (primaryRole.code || primaryRole.name) : 'software_engineer',
    roleName: primaryRole ? primaryRole.name : 'Software Engineer',
    activeDelegation,
    permissions: Array.from(effectivePermissions)
  };
};

// Helper to sign JWT
const generateToken = (user, resolvedData) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      role: resolvedData.primaryRole,
      roleName: resolvedData.roleName,
      permissions: resolvedData.permissions,
      activeDelegation: resolvedData.activeDelegation
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email and password' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const user = await prisma.employee.findUnique({ where: { email } });
      if (user && (await bcrypt.compare(password, user.password))) {
        const resolved = await resolveEffectiveUser(user);
        return res.json({
          token: generateToken(user, resolved),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: resolved.primaryRole,
            roleName: resolved.roleName,
            title: user.title,
            avatar: user.avatar,
            permissions: resolved.permissions,
            activeDelegation: resolved.activeDelegation,
            dbMode: 'production'
          }
        });
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    } catch (dbError) {
      console.warn('[AuthController] DB Query error, falling back to mock authentication:', dbError.message);
    }
  }

  // Fallback Mock authentication if database is not active
  console.log('[AuthController] Operating in DB-Disconnected Mock Mode');
  const mockUser = MOCK_EMPLOYEES.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (mockUser) {
    const passMatch = await bcrypt.compare(password, mockUser.passwordHash);
    if (passMatch) {
      const resolved = await resolveEffectiveUser(mockUser);
      return res.json({
        token: generateToken(mockUser, resolved),
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: resolved.primaryRole,
          roleName: resolved.roleName,
          title: mockUser.title,
          avatar: mockUser.avatar,
          permissions: resolved.permissions,
          activeDelegation: resolved.activeDelegation,
          dbMode: 'mocked'
        }
      });
    }
  }

  return res.status(401).json({ error: 'Invalid email or password' });
};

// Register new user (employees)
export const register = async (req, res) => {
  const { name, email, password, role, title } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please fill out all required fields (name, email, password)' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const exists = await prisma.employee.findUnique({ where: { email } });
      if (exists) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

      // Resolve roleId if standard role is supplied
      const dbRole = await prisma.role.findFirst({
        where: { code: role || 'software_engineer' }
      });

      const user = await prisma.employee.create({
        data: {
          name,
          email,
          password: hashedPassword,
          roleId: dbRole ? dbRole.id : null,
          title: title || 'Software Engineer',
          avatar
        }
      });

      const resolved = await resolveEffectiveUser(user);

      return res.status(201).json({
        token: generateToken(user, resolved),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: resolved.primaryRole,
          roleName: resolved.roleName,
          title: user.title,
          avatar: user.avatar,
          permissions: resolved.permissions,
          activeDelegation: resolved.activeDelegation,
          dbMode: 'production'
        }
      });
    } catch (err) {
      console.error('[AuthController] Error saving user to database:', err.message);
      return res.status(500).json({ error: 'Failed to create user on database server' });
    }
  }

  return res.status(503).json({
    error: 'Database server is currently unavailable. Registrations are disabled in offline mode.'
  });
};

// Get current logged-in employee profile
export const getProfile = async (req, res) => {
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const user = await prisma.employee.findUnique({ where: { id: req.user.id } });
      if (user) {
        const resolved = await resolveEffectiveUser(user);
        return res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: resolved.primaryRole,
          roleName: resolved.roleName,
          title: user.title,
          avatar: user.avatar,
          permissions: resolved.permissions,
          activeDelegation: resolved.activeDelegation,
          dbMode: 'production'
        });
      }
    } catch (err) {
      console.warn('[AuthController] DB error during getProfile:', err.message);
    }
  }

  // Fallback
  const mockUser = MOCK_EMPLOYEES.find(u => u.id === req.user.id);
  if (mockUser) {
    const resolved = await resolveEffectiveUser(mockUser);
    return res.json({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: resolved.primaryRole,
      roleName: resolved.roleName,
      title: mockUser.title,
      avatar: mockUser.avatar,
      permissions: resolved.permissions,
      activeDelegation: resolved.activeDelegation,
      dbMode: 'mocked'
    });
  }

  // If not found in mocks but token is valid, return req.user decodes
  return res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    dbMode: 'mocked_unverified'
  });
};

// Get all employees (directory)
export const getEmployees = async (req, res) => {
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const users = await prisma.employee.findMany({
        include: { role: true },
        orderBy: { name: 'asc' }
      });
      const formatted = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role ? u.role.code : 'software_engineer',
        roleName: u.role ? u.role.name : 'Software Engineer',
        title: u.title,
        avatar: u.avatar,
        isActive: u.isActive
      }));
      return res.json(formatted);
    } catch (err) {
      console.warn('[AuthController] DB error listing employees, falling back to mock:', err.message);
    }
  }

  // Mock Mode
  const formattedMocks = MOCK_EMPLOYEES.map(u => {
    const roleConfig = ALL_ROLES.find(r => r.code === u.role);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      roleName: roleConfig ? roleConfig.name : 'Software Engineer',
      title: u.title,
      avatar: u.avatar,
      isActive: true
    };
  });
  return res.json(formattedMocks);
};
