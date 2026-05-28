import express from "express";
import {
    getAllTickets,
    getTicketDetails,
    createTicket,
    addMessage,
    updateTicketStatus,
    getMyTickets,
    deleteTicket
} from "../controllers/ticketController.js";
import { verifyAdmin, authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============ ADMIN ROUTES ============
router.get("/admin", verifyAdmin, getAllTickets);
router.get("/admin/:id", verifyAdmin, getTicketDetails);
router.put("/admin/:id/status", verifyAdmin, updateTicketStatus);
router.post("/admin/:id/message", verifyAdmin, addMessage);
router.delete("/admin/:id", verifyAdmin, deleteTicket);

// ============ USER ROUTES (Customer/Seller) ============
router.get("/my-tickets", authMiddleware(["customer", "seller"]), getMyTickets);
router.post("/", authMiddleware(["customer", "seller"]), createTicket);
router.get("/:id", authMiddleware(["customer", "seller", "admin"]), getTicketDetails);
router.post("/:id/message", authMiddleware(["customer", "seller", "admin"]), addMessage);

export default router;
