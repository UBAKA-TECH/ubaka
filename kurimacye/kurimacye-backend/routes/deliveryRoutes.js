import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import {
    getZones,
    createZone,
    updateZone,
    deleteZone,
    calculateDelivery,
} from "../controllers/deliveryController.js";

const router = express.Router();

router.post("/calculate", calculateDelivery); // Public or protected? Likely public for guest checkout

router.route("/")
    .get(verifyToken, verifyAdmin, getZones)
    .post(verifyToken, verifyAdmin, createZone);

router.route("/:id")
    .put(verifyToken, verifyAdmin, updateZone)
    .delete(verifyToken, verifyAdmin, deleteZone);

export default router;
