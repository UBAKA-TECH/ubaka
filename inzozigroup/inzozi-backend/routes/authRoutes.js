import express from 'express';
import { login, register, getProfile, getEmployees } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/me', protect, getProfile);
router.get('/employees', protect, getEmployees);

export default router;
