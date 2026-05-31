import express from 'express';
import {
  getRooms,
  createRoom,
  getRoomMessages,
  createMessage,
  markRoomAsRead
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/rooms', getRooms);
router.post('/rooms', createRoom);
router.get('/rooms/:roomId/messages', getRoomMessages);
router.post('/rooms/:roomId/messages', createMessage);
router.post('/rooms/:roomId/read', markRoomAsRead);

export default router;
