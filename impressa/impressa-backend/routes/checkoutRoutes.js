import express from "express";
import * as checkoutController from "../controllers/checkoutController.js";
import { checkoutLimiter } from "../middleware/rateLimiter.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Checkout routes
router.post("/order", checkoutLimiter, optionalAuth, checkoutController.createOrderFromCart);
router.post("/shipping/calculate", checkoutController.calculateShipping);
router.post("/tax/calculate", checkoutController.calculateTax);

export default router;
