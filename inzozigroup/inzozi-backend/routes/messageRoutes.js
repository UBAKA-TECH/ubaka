import express from 'express';
import { getMessagesByChannel, createMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/channel/:channel', protect, getMessagesByChannel);
router.post('/', protect, createMessage);

export default router;
