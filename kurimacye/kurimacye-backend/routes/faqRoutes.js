import express from "express";
import {
  getAllFaqs,
  getActiveFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqStatus
} from "../controllers/faqController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveFaqs);

// Protected routes (Admin only)
router.get("/", verifyAdmin, getAllFaqs);
router.get("/:id", verifyAdmin, getFaqById);
router.post("/", verifyAdmin, createFaq);
router.put("/:id", verifyAdmin, updateFaq);
router.delete("/:id", verifyAdmin, deleteFaq);
router.patch("/:id/toggle", verifyAdmin, toggleFaqStatus);

export default router;
