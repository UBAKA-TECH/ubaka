import express from "express";
import * as sellerReviewController from "../controllers/sellerReviewController.js";
import { verifySeller } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply verifySeller middleware to all routes in this router
router.use(verifySeller);

router.get("/", sellerReviewController.getSellerProductReviews);
router.post("/:id/reply", sellerReviewController.replyToReview);

export default router;
