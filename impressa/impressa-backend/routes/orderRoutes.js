import express from "express";
import * as orderController from "../controllers/orderController.js";
import * as reportController from "../controllers/reportController.js";
import { authMiddleware, optionalAuth } from "../middleware/authMiddleware.js";
import { reportLimiter, analyticsLimiter } from "../middleware/rateLimiter.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Generate business reports (PDF/CSV)
router.get("/report", authMiddleware(["admin", "owner", "seller"]), reportLimiter, reportController.generateReport);



// Get all orders (admin/staff)
router.get("/", authMiddleware(["admin", "owner", "cashier", "inventory", "delivery"]), orderController.getOrders);

// Customer places an order (supports file upload)
router.post("/", authMiddleware(["customer"]), upload.single("customFile"), orderController.placeOrder);

// Create multi-item order (Cart Checkout)
router.post("/create", optionalAuth, orderController.createOrder); // Guests or Users

// Guest places an order (no auth)
router.post("/public", upload.single("customFile"), orderController.placeOrderGuest);

// Get my orders
router.get("/my-orders", authMiddleware(), orderController.getMyOrders);

// Get Seller Orders
router.get("/seller", authMiddleware(["seller", "admin", "owner"]), orderController.getSellerOrders);

// Order Management (Detail, Status, Items, Notes)
router.get("/:id", authMiddleware(["admin", "owner", "seller", "cashier", "inventory", "delivery"]), orderController.getOrderById);
router.put("/:id/status", authMiddleware(["admin", "owner", "seller", "cashier", "delivery"]), orderController.updateOrderStatus);
router.put("/:id/items", authMiddleware(["admin", "owner"]), orderController.updateOrderItems);
router.post("/:id/notes", authMiddleware(["admin", "owner", "seller", "cashier"]), orderController.addOrderNote);

router.get("/report/logs", authMiddleware(["admin", "owner"]), reportLimiter, orderController.getReportLogs);
router.get("/analytics", authMiddleware(["admin", "owner"]), analyticsLimiter, orderController.getOrderAnalytics);

// Public order tracking
router.get("/track/:id", orderController.trackPublicOrder);

router.post("/report/logs/:id/view", authMiddleware(["admin", "owner"]), orderController.markReportViewed);
router.post("/report/logs/:id/download", authMiddleware(["admin", "owner"]), orderController.markReportDownloaded);

// POS Order (Unified)
router.post("/pos", authMiddleware(["admin", "owner", "seller", "cashier"]), orderController.createPOSOrder);

// Service Inquiry (Print Portal)
router.post("/inquiry", optionalAuth, upload.array("files", 10), orderController.createInquiry);
router.post("/submit-quote", authMiddleware(["admin", "owner", "seller", "cashier"]), orderController.submitPrintQuote);

// Get seller's POS products (inventory for seller/cashier)
router.get("/seller/pos-products", authMiddleware(["admin", "owner", "seller", "cashier"]), orderController.getSellerPOSProducts);

// Get admin/Abelus's POS products (only company inventory)
router.get("/admin/pos-products", authMiddleware(["admin", "owner"]), orderController.getAdminPOSProducts);

// Get seller's orders
router.get("/seller/my-orders", authMiddleware(["admin", "owner", "seller", "cashier"]), orderController.getSellerOrders);

// Barcode lookup for POS scanning
router.get("/pos/lookup", authMiddleware(["admin", "owner", "seller", "cashier"]), orderController.lookupByBarcode);

export default router;