import express from "express";
import {
    getActiveProducts,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    reorderProducts,
} from "../controllers/giftCardProductController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getActiveProducts);

// Admin routes
router.get("/admin/all", verifyToken, verifyAdmin, getAllProducts);
router.post("/admin", verifyToken, verifyAdmin, createProduct);
router.put("/admin/:id", verifyToken, verifyAdmin, updateProduct);
router.delete("/admin/:id", verifyToken, verifyAdmin, deleteProduct);
router.put("/admin/reorder", verifyToken, verifyAdmin, reorderProducts);

export default router;
