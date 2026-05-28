import express from 'express';
import { getViolations, updateViolationStatus, generateSampleViolations } from '../controllers/violationController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyAdmin, getViolations);
router.put('/:id/status', verifyAdmin, updateViolationStatus);
router.post('/generate-sample', verifyAdmin, generateSampleViolations);

export default router;
