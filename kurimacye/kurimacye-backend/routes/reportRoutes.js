import express from "express";
import { generateReport } from "../controllers/reportController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/reports
 * @desc    Generate and download reports (PDF/CSV)
 * @access  Private (Admin/Seller/Cashier)
 */
router.get("/", verifyToken, generateReport);

export default router;