import express from "express";
import {
    getAllTestimonials,
    getActiveTestimonials,
    getTestimonialById,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialStatus
} from "../controllers/testimonialController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveTestimonials);

// Protected routes (Admin only)
router.get("/", verifyAdmin, getAllTestimonials);
router.get("/:id", verifyAdmin, getTestimonialById);
router.post("/", verifyAdmin, createTestimonial);
router.put("/:id", verifyAdmin, updateTestimonial);
router.delete("/:id", verifyAdmin, deleteTestimonial);
router.patch("/:id/toggle", verifyAdmin, toggleTestimonialStatus);

export default router;
