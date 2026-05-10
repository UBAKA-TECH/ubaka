import express from "express";
import {
    getPublicSettings,
    getAllSettings,
    updateTrustBadges,
    updateGeneralSettings,
    updateFooterSettings,
    resetTrustBadges,
    updateSellerAutoApproval,
    updatePayoutSettings,
    updateCommissionRate
} from "../controllers/siteSettingsController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/public", getPublicSettings);

// Admin protected routes
router.get("/", verifyAdmin, getAllSettings);
router.put("/trust-badges", verifyAdmin, updateTrustBadges);
router.put("/general", verifyAdmin, upload.single("logo"), updateGeneralSettings);

router.put("/footer", verifyAdmin, updateFooterSettings);
router.post("/trust-badges/reset", verifyAdmin, resetTrustBadges);

// Seller & Payout settings
router.put("/seller-auto-approval", verifyAdmin, updateSellerAutoApproval);
router.put("/payout", verifyAdmin, updatePayoutSettings);
router.put("/commission", verifyAdmin, updateCommissionRate);

export default router;

