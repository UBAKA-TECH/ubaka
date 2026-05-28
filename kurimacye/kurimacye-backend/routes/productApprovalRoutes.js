import express from "express";
import {
    getPendingProducts,
    getProductForReview,
    approveProduct,
    rejectProduct,
    bulkApproveProducts,
    bulkRejectProducts
} from "../controllers/productApprovalController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are admin-protected
router.get("/", verifyAdmin, getPendingProducts);
router.get("/:id", verifyAdmin, getProductForReview);
router.put("/:id/approve", verifyAdmin, approveProduct);
router.put("/:id/reject", verifyAdmin, rejectProduct);
router.post("/bulk-approve", verifyAdmin, bulkApproveProducts);
router.post("/bulk-reject", verifyAdmin, bulkRejectProducts);

export default router;

