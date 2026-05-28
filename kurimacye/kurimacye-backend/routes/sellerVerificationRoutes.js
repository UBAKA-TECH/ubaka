import express from "express";
import {
    getSellerTerms,
    submitSellerApplication,
    getPendingVerifications,
    verifySeller,
    getSellerVerificationDetails
} from "../controllers/sellerVerificationController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/terms", getSellerTerms);

// Authenticated user routes
router.post(
    "/apply",
    verifyToken,
    upload.fields([
        { name: 'rdbCertificate', maxCount: 1 },
        { name: 'nationalId', maxCount: 1 }
    ]),
    submitSellerApplication
);

// Admin routes
router.get("/pending", verifyAdmin, getPendingVerifications);
router.get("/:id", verifyAdmin, getSellerVerificationDetails);
router.put("/:id/verify", verifyAdmin, verifySeller);

export default router;
