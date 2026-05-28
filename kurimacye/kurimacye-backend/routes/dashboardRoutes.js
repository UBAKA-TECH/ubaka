import express from "express";
import {
  getDashboardAnalytics,
  getForecast,
  getProductRecommendations,
  getAnomalies,
  handleChatbotQueryLLM // ✅ use only this
} from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/analytics", authMiddleware(["admin", "owner", "seller", "cashier"]), getDashboardAnalytics);
router.get("/forecast", authMiddleware(["admin", "owner", "seller", "cashier"]), getForecast);
router.get("/recommendations", authMiddleware(["admin", "owner", "seller", "cashier"]), getProductRecommendations);
router.get("/anomalies", authMiddleware(["admin", "owner", "seller", "cashier"]), getAnomalies);

router.post("/chatbot", authMiddleware(["admin", "owner", "seller"]), handleChatbotQueryLLM); // ✅ single chatbot route

export default router;