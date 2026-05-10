import express from "express";
import {
    getAllBrandPartners,
    getActiveBrandPartners,
    getBrandPartnerById,
    createBrandPartner,
    updateBrandPartner,
    deleteBrandPartner,
    reorderBrandPartners,
    toggleBrandPartnerStatus
} from "../controllers/brandPartnerController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveBrandPartners);

// Protected routes (Admin only)
router.get("/", verifyAdmin, getAllBrandPartners);
router.get("/:id", verifyAdmin, getBrandPartnerById);
router.post("/", verifyAdmin, upload.single("logo"), createBrandPartner);
router.put("/:id", verifyAdmin, upload.single("logo"), updateBrandPartner);
router.delete("/:id", verifyAdmin, deleteBrandPartner);
router.post("/reorder", verifyAdmin, reorderBrandPartners);
router.patch("/:id/toggle", verifyAdmin, toggleBrandPartnerStatus);

export default router;
