import express from "express";
import {
    getCommissionSettings,
    updateCommissionSettings,
    getAllEarnings,
    getSellerEarningsSummary,
    getCommissionDashboard
} from "../controllers/commissionController.js";
import {
    requestPayout,
    getMyPayouts,
    getAllPayouts,
    processPayout,
    cancelPayout
} from "../controllers/payoutController.js";
import { verifyAdmin, verifySeller, authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============ ADMIN ROUTES ============

// Commission Settings
router.get("/settings", verifyAdmin, getCommissionSettings);
router.put("/settings", verifyAdmin, updateCommissionSettings);

// Earnings Management
router.get("/earnings", verifyAdmin, getAllEarnings);
router.get("/dashboard", verifyAdmin, getCommissionDashboard);

// Payout Management
router.get("/payouts", verifyAdmin, getAllPayouts);
router.put("/payouts/:id", verifyAdmin, processPayout);

// ============ SELLER ROUTES ============

// Seller earnings summary
router.get("/my-earnings", authMiddleware(["seller", "admin", "cashier"]), getSellerEarningsSummary);

// Seller payout requests
router.post("/my-payouts", authMiddleware(["seller", "admin"]), requestPayout);
router.get("/my-payouts", authMiddleware(["seller", "admin"]), getMyPayouts);
router.delete("/my-payouts/:id", authMiddleware(["seller", "admin"]), cancelPayout);

export default router;
