import express from "express";
import {
    checkBalance,
    validateGiftCard,
    createGiftCard,
    redeemGiftCard,
    getAllGiftCards,
    updateGiftCardStatus,
    deleteGiftCard,
} from "../controllers/giftCardController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/check/:code", checkBalance);

// Protected routes (Logged in users)
router.post("/validate", validateGiftCard);
router.post("/redeem", verifyToken, redeemGiftCard);

// Admin / Internal only
router.post("/create", verifyToken, verifyAdmin, createGiftCard);
router.get("/admin/all", verifyToken, verifyAdmin, getAllGiftCards);
router.put("/admin/update/:id", verifyToken, verifyAdmin, updateGiftCardStatus);
router.delete("/admin/:id", verifyToken, verifyAdmin, deleteGiftCard);

export default router;
