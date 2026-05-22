import express from 'express';
import { protect, authorizePermission } from '../middleware/authMiddleware.js';
import {
  getRolesAndPermissions,
  createDelegation,
  getDelegations,
  revokeDelegation
} from '../controllers/delegationController.js';

const router = express.Router();

// Fetch roles and permissions details (all logged-in employees can read this for selection lists)
router.get('/roles', protect, getRolesAndPermissions);

// Fetch all active/past delegations (requires HR or Admin permission)
router.get('/', protect, authorizePermission('manage_delegations_hr', 'manage_delegations_admin'), getDelegations);

// Create a new delegation (requires HR or Admin permission)
router.post('/', protect, authorizePermission('manage_delegations_hr', 'manage_delegations_admin'), createDelegation);

// Revoke a delegation (requires HR or Admin permission)
router.delete('/:id', protect, authorizePermission('manage_delegations_hr', 'manage_delegations_admin'), revokeDelegation);

export default router;
