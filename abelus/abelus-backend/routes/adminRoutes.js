import express from "express";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { createUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/users", verifyAdmin, createUser); // ✅ Only admins can create users

export default router;