import express from "express";
import {
    getAllReviews,
    getReviewDetails,
    approveReview,
    rejectReview,
    replyToReview,
    deleteReview,
    clearReport
} from "../controllers/reviewsAdminController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are admin-protected
router.get("/", verifyAdmin, getAllReviews);
router.get("/:id", verifyAdmin, getReviewDetails);
router.put("/:id/approve", verifyAdmin, approveReview);
router.put("/:id/reject", verifyAdmin, rejectReview);
router.post("/:id/reply", verifyAdmin, replyToReview);
router.put("/:id/clear-report", verifyAdmin, clearReport);
router.delete("/:id", verifyAdmin, deleteReview);

export default router;
