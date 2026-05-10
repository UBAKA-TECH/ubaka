import express from "express";
import { verifyToken, optionalAuth } from "../middleware/authMiddleware.js";
import { processPayment, checkPaymentStatus, handleMomoWebhook } from "../controllers/paymentController.js";
import { paymentLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/process", paymentLimiter, optionalAuth, processPayment);
router.get("/status/:orderId", paymentLimiter, optionalAuth, checkPaymentStatus);
router.post("/webhook/momo", handleMomoWebhook); // Public endpoint for MTN

export default router;
