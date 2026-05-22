import express from 'express';
import {
  getProjects,
  getProjectBySlug,
  getPendingImpressaApprovals,
  updateImpressaProductStatus,
  getImpressaTickets,
  getPublicShowcaseProjects
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get public portfolio showcase details for the landing page
router.get('/public/showcase', getPublicShowcaseProjects);

// Get list of all projects managed by Inzozi Group
router.get('/', protect, getProjects);

// Get details of a specific project (e.g. linker, homland, etc.)
router.get('/:slug', protect, getProjectBySlug);

// Impressa integrations (Control plane)
router.get('/impressa/approvals', protect, authorize('admin', 'content_controller'), getPendingImpressaApprovals);
router.put('/impressa/approvals/:id', protect, authorize('admin', 'content_controller'), updateImpressaProductStatus);
router.get('/impressa/tickets', protect, authorize('admin', 'support'), getImpressaTickets);

export default router;
