import express from 'express';
import {
  createInquiry,
  getCareers,
  applyJob,
  getTeam,
  getServices,
  getPricing,
  getRetainers,
  getFaqs,
  debugDb
} from '../controllers/publicController.js';

const router = express.Router();

// Client project inquiries
router.post('/inquiry', createInquiry);

// Job listings & applications
router.get('/careers', getCareers);
router.post('/careers/apply', applyJob);

// Public homepage dynamic content routes
router.get('/team', getTeam);
router.get('/services', getServices);
router.get('/pricing', getPricing);
router.get('/retainers', getRetainers);
router.get('/faqs', getFaqs);
router.get('/debug-db', debugDb);

export default router;
