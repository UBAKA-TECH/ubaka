import express from "express";
import {
    getAllFlashSales,
    getActiveFlashSales,
    getFlashSaleById,
    createFlashSale,
    updateFlashSale,
    deleteFlashSale,
    addProductToSale,
    removeProductFromSale,
    getFlashSalePriceForProduct
} from "../controllers/flashSaleController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveFlashSales);
router.get("/product/:productId/price", getFlashSalePriceForProduct);

// Protected routes (Admin only)
router.get("/", verifyAdmin, getAllFlashSales);
router.get("/:id", verifyAdmin, getFlashSaleById);
router.post("/", verifyAdmin, createFlashSale);
router.put("/:id", verifyAdmin, updateFlashSale);
router.delete("/:id", verifyAdmin, deleteFlashSale);

// Product management within flash sale
router.post("/:id/products", verifyAdmin, addProductToSale);
router.delete("/:id/products/:productId", verifyAdmin, removeProductFromSale);

export default router;
