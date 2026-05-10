import express from "express";
import {
    getAllBanners,
    getActiveBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
    toggleBannerStatus
} from "../controllers/bannerController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveBanners);

// Protected routes (Admin only)
router.get("/", verifyAdmin, getAllBanners);
router.get("/:id", verifyAdmin, getBannerById);
router.post("/", verifyAdmin, createBanner);
router.put("/:id", verifyAdmin, updateBanner);
router.delete("/:id", verifyAdmin, deleteBanner);
router.post("/reorder", verifyAdmin, reorderBanners);
router.patch("/:id/toggle", verifyAdmin, toggleBannerStatus);

export default router;
