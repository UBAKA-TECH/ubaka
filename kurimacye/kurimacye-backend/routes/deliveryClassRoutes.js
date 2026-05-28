import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import {
    getDeliveryClasses,
    createDeliveryClass,
    updateDeliveryClass,
    deleteDeliveryClass,
} from "../controllers/deliveryClassController.js";

const router = express.Router();

router.route("/")
    .get(getDeliveryClasses)
    .post(verifyToken, verifyAdmin, createDeliveryClass);

router.route("/:id")
    .put(verifyToken, verifyAdmin, updateDeliveryClass)
    .delete(verifyToken, verifyAdmin, deleteDeliveryClass);

export default router;
