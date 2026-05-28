import express from "express";
import {
    getAllSellers,
    getSellerDetails,
    updateSellerStatus,
    getSellerProducts,
    deleteSeller,
    getSellerPerformanceReports,
    getStorefront
} from "../controllers/sellerController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/storefront/:slug", getStorefront);

// Admin routes
router.get("/", verifyAdmin, getAllSellers);
router.get("/performance-reports", verifyAdmin, getSellerPerformanceReports);
router.get("/:id", verifyAdmin, getSellerDetails);
router.get("/:id/products", verifyAdmin, getSellerProducts);
router.put("/:id/status", verifyAdmin, updateSellerStatus);
router.delete("/:id", verifyAdmin, deleteSeller);

export default router;
