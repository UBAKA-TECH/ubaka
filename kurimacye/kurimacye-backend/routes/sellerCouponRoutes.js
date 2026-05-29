import express from "express";
import * as sellerCouponController from "../controllers/sellerCouponController.js";
import { verifySeller } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply verifySeller middleware to all routes in this router
router.use(verifySeller);

router.get("/", sellerCouponController.getSellerCoupons);
router.post("/", sellerCouponController.createSellerCoupon);
router.get("/:id", sellerCouponController.getSellerCouponById);
router.put("/:id", sellerCouponController.updateSellerCoupon);
router.delete("/:id", sellerCouponController.deleteSellerCoupon);
router.get("/:id/stats", sellerCouponController.getSellerCouponStats);

export default router;
