import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import upload from "../middleware/uploadMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Allow admin to upload single image
router.post("/", authMiddleware(["admin"]), upload.single("image"), uploadImage);

export default router;
