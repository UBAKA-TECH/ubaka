import express from 'express';
import {
  createInquiry,
  getCareers,
  applyJob
} from '../controllers/publicController.js';

const router = express.Router();

// Client project inquiries
router.post('/inquiry', createInquiry);

// Job listings & applications
router.get('/careers', getCareers);
router.post('/careers/apply', applyJob);

export default router;
