import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getWishlist, toggleWishlistItem, syncWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/", verifyToken, getWishlist);
router.post("/toggle", verifyToken, toggleWishlistItem);
router.post("/sync", verifyToken, syncWishlist);

export default router;
