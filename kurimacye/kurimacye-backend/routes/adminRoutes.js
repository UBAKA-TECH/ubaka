import express from "express";
import { verifyAdmin } from "../middleware/authMiddleware.js";
import { createUser } from "../controllers/authController.js";
import { sendTestEmail } from "../controllers/emailTemplateController.js";

const router = express.Router();

router.post("/users", verifyAdmin, createUser); // ✅ Only admins can create users
router.post("/email-templates/test", sendTestEmail); // ✅ Proxy test triggers via MIS secret key

export default router;