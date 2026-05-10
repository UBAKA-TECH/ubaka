import express from "express";
import {
    getAttributes,
    getAttributeById,
    createAttribute,
    updateAttribute,
    deleteAttribute,
} from "../controllers/attributeController.js";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getAttributes).post(verifyToken, verifyAdmin, createAttribute);
router
    .route("/:id")
    .get(getAttributeById)
    .put(verifyToken, verifyAdmin, updateAttribute)
    .delete(verifyToken, verifyAdmin, deleteAttribute);

export default router;
