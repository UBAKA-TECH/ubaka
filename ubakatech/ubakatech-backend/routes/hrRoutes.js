import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getOnboarding, addOnboardingTask, updateOnboardingTask, deleteOnboardingTask,
  getApprovals, createApproval, reviewApproval,
  getHardware, createHardware, updateHardware,
  getSaas, createSaas, updateSaas,
  getCertifications, createCertification,
  getAnalytics,
  getHrStats,
  getInquiries, updateInquiryStatus,
  getApplications, updateApplicationStatus
} from '../controllers/hrController.js';

const router = express.Router();

// All HR routes require a valid session
router.use(protect);

// ─── Onboarding ────────────────────────────────────────────────────────────
router.get('/onboarding', getOnboarding);
router.post('/onboarding/:employeeId/tasks', addOnboardingTask);
router.put('/onboarding/tasks/:taskId', updateOnboardingTask);
router.delete('/onboarding/tasks/:taskId', deleteOnboardingTask);

// ─── Approvals ─────────────────────────────────────────────────────────────
router.get('/approvals', getApprovals);
router.post('/approvals', createApproval);
router.put('/approvals/:id', reviewApproval);

// ─── Hardware Fleet ────────────────────────────────────────────────────────
router.get('/hardware', getHardware);
router.post('/hardware', createHardware);
router.put('/hardware/:id', updateHardware);

// ─── SaaS Licenses ─────────────────────────────────────────────────────────
router.get('/saas', getSaas);
router.post('/saas', createSaas);
router.put('/saas/:id', updateSaas);

// ─── Certifications ────────────────────────────────────────────────────────
router.get('/certifications', getCertifications);
router.post('/certifications', createCertification);

// ─── People Analytics ────────────────────────────────────────────────
router.get('/analytics', getAnalytics);
router.get('/stats', getHrStats);

// ─── Client Inquiries & Job Applications Triage ──────────────────────────────
router.get('/inquiries', getInquiries);
router.put('/inquiries/:id', updateInquiryStatus);
router.get('/applications', getApplications);
router.put('/applications/:id', updateApplicationStatus);

export default router;
