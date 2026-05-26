import express from "express";
import jwt from "jsonwebtoken";
import * as cartController from "../controllers/cartController.js";
import { authMiddleware, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public cart routes (works for both guests and authenticated users)
router.get("/", optionalAuth, cartController.getCart);
router.post("/items", optionalAuth, cartController.addToCart);
router.put("/items", optionalAuth, cartController.updateCartItem);
router.delete("/items/:productId", optionalAuth, cartController.removeFromCart);
router.delete("/", optionalAuth, cartController.clearCart);

// Coupon routes
router.post("/coupon", optionalAuth, cartController.applyCoupon);
router.delete("/coupon", optionalAuth, cartController.removeCoupon);

// Merge carts (requires authentication)
router.post("/merge", authMiddleware(["customer", "admin"]), cartController.mergeCarts);

export default router;
