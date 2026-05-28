import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import { addReview, getProductReviews, updateReview, deleteReview } from "../controllers/reviewController.js";

const router = express.Router();

// Public: Get reviews for a product (usually handled via product route, but good to have separate for pagination/loading)
router.get("/product/:id", getProductReviews);

// Customer: Add review to a product
router.post("/product/:id", verifyToken, addReview);

// Customer/Admin: Update/Delete specific review
router.put("/:reviewId", verifyToken, updateReview);
router.delete("/:reviewId", verifyToken, deleteReview);

export default router;
