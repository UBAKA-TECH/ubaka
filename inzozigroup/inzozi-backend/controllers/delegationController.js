import prisma, { isDbConnected } from '../config/db.js';
import { ALL_ROLES, ALL_PERMISSIONS } from '../config/roles.js';
import { MOCK_DELEGATIONS, MOCK_EMPLOYEES } from './authController.js';

// Get all roles and permissions
export const getRolesAndPermissions = async (req, res) => {
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const dbRoles = await prisma.role.findMany({
        include: {
          permissions: {
            include: { permission: true }
          }
        }
      });
      if (dbRoles && dbRoles.length > 0) {
        // Map dbRoles to match ALL_ROLES format
        const roles = dbRoles.map(role => ({
          id: role.id,
          code: role.code,
          name: role.name,
          description: role.description,
          isTechnical: role.isTechnical,
          permissions: role.permissions.map(p => p.permission.code)
        }));
        return res.json({ roles, permissions: ALL_PERMISSIONS });
      }
    } catch (err) {
      console.warn('[DelegationController] DB error fetching roles, falling back to mock:', err.message);
    }
  }

  // Fallback to static mock roles
  return res.json({ roles: ALL_ROLES, permissions: ALL_PERMISSIONS });
};

// Create a new temporary role delegation
export const createDelegation = async (req, res) => {
  const { employeeId, targetRoleCode, startDate, endDate, reason } = req.body;
  const authorizerId = req.user.id; // From protect middleware
  const userPermissions = req.user.permissions || [];

  if (!employeeId || !targetRoleCode || !startDate || !endDate) {
    return res.status(400).json({ error: 'Please provide employeeId, targetRoleCode, startDate, and endDate' });
  }

  // 1. Enforce HR vs. System Admin Boundary
  const targetRole = ALL_ROLES.find(r => r.code === targetRoleCode);
  if (!targetRole) {
    return res.status(404).json({ error: `Role '${targetRoleCode}' not found.` });
  }

  const isAdmin = userPermissions.includes('manage_delegations_admin');
  const isHR = userPermissions.includes('manage_delegations_hr');

  if (!isAdmin && !isHR) {
    return res.status(403).json({ error: 'You do not have permission to manage delegations.' });
  }

  // Check if trying to delegate a technical role without Admin privileges
  if (targetRole.isTechnical && !isAdmin) {
    return res.status(403).json({
      error: `Security Violation: HR managers are restricted from delegating technical roles (like ${targetRole.name}). Please contact a System Administrator.`
    });
  }

  const parsedStart = new Date(startDate);
  const parsedEnd = new Date(endDate);

  if (parsedEnd <= parsedStart) {
    return res.status(400).json({ error: 'End date must be after start date.' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      // Find database ids
      const dbEmployee = await prisma.employee.findUnique({ where: { id: employeeId } });
      const dbTargetRole = await prisma.role.findUnique({ where: { code: targetRoleCode } });

      if (!dbEmployee) return res.status(404).json({ error: 'Employee not found in database' });
      if (!dbTargetRole) return res.status(404).json({ error: 'Role not found in database' });

      const delegation = await prisma.delegation.create({
        data: {
          employeeId: dbEmployee.id,
          targetRoleId: dbTargetRole.id,
          authorizerId,
          startDate: parsedStart,
          endDate: parsedEnd,
          reason: reason || 'Temporary coverage'
        },
        include: {
          employee: true,
          targetRole: true,
          authorizer: true
        }
      });

      return res.status(201).json({
        message: 'Delegation created successfully',
        delegation: {
          id: delegation.id,
          employeeId: delegation.employeeId,
          employeeName: delegation.employee.name,
          targetRoleCode: delegation.targetRole.code,
          targetRoleName: delegation.targetRole.name,
          startDate: delegation.startDate,
          endDate: delegation.endDate,
          reason: delegation.reason,
          isActive: delegation.isActive,
          authorizerName: delegation.authorizer.name
        }
      });
    } catch (err) {
      console.error('[DelegationController] DB error creating delegation, falling back to memory:', err.message);
    }
  }

  // Offline / Mock Mode
  console.log('[DelegationController] Offline Mode - Creating in-memory delegation');
  const mockEmp = MOCK_EMPLOYEES.find(e => e.id === employeeId);
  const mockAuth = MOCK_EMPLOYEES.find(e => e.id === authorizerId) || { name: 'Admin (Mock)' };

  if (!mockEmp) {
    return res.status(404).json({ error: 'Employee not found in mock directory.' });
  }

  const newMockDelegation = {
    id: `mock-del-${Date.now()}`,
    employeeId: mockEmp.id,
    employeeName: mockEmp.name,
    targetRoleCode: targetRole.code,
    targetRoleName: targetRole.name,
    startDate: parsedStart.toISOString(),
    endDate: parsedEnd.toISOString(),
    reason: reason || 'Temporary coverage (Mock)',
    isActive: true,
    authorizerId: mockAuth.id,
    authorizerName: mockAuth.name
  };

  MOCK_DELEGATIONS.push(newMockDelegation);

  return res.status(201).json({
    message: 'Delegation created successfully (Offline Mock Mode)',
    delegation: newMockDelegation
  });
};

// Get all delegations (active, scheduled, past)
export const getDelegations = async (req, res) => {
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const dbDelegations = await prisma.delegation.findMany({
        include: {
          employee: true,
          targetRole: true,
          authorizer: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const formatted = dbDelegations.map(del => ({
        id: del.id,
        employeeId: del.employeeId,
        employeeName: del.employee.name,
        targetRoleCode: del.targetRole.code,
        targetRoleName: del.targetRole.name,
        startDate: del.startDate,
        endDate: del.endDate,
        reason: del.reason,
        isActive: del.isActive,
        authorizerName: del.authorizer.name
      }));

      return res.json(formatted);
    } catch (err) {
      console.warn('[DelegationController] DB error loading delegations, using memory:', err.message);
    }
  }

  // Fallback to in-memory delegations
  return res.json(MOCK_DELEGATIONS);
};

// Revoke a delegation instantly
export const revokeDelegation = async (req, res) => {
  const { id } = req.params;
  const userPermissions = req.user.permissions || [];

  const isAdmin = userPermissions.includes('manage_delegations_admin');
  const isHR = userPermissions.includes('manage_delegations_hr');

  if (!isAdmin && !isHR) {
    return res.status(403).json({ error: 'You do not have permission to manage delegations.' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      // Find delegation to check if it's technical
      const del = await prisma.delegation.findUnique({
        where: { id },
        include: { targetRole: true }
      });

      if (!del) return res.status(404).json({ error: 'Delegation not found' });

      // Enforce boundary on revocation
      if (del.targetRole.isTechnical && !isAdmin) {
        return res.status(403).json({ error: 'Security Violation: Only System Administrators can revoke technical delegations.' });
      }

      await prisma.delegation.update({
        where: { id },
        data: { isActive: false }
      });

      return res.json({ message: 'Delegation revoked successfully' });
    } catch (err) {
      console.error('[DelegationController] DB error revoking delegation, using memory:', err.message);
    }
  }

  // Mock Revocation
  const mockDel = MOCK_DELEGATIONS.find(d => d.id === id);
  if (!mockDel) {
    return res.status(404).json({ error: 'Delegation not found in mock array.' });
  }

  // Check boundary on mock revocation
  const targetRole = ALL_ROLES.find(r => r.code === mockDel.targetRoleCode);
  if (targetRole && targetRole.isTechnical && !isAdmin) {
    return res.status(403).json({ error: 'Security Violation: Only System Administrators can revoke technical delegations.' });
  }

  mockDel.isActive = false;

  return res.json({ message: 'Delegation revoked successfully (Offline Mock Mode)', id });
};
