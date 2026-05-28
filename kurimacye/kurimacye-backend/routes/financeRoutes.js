import express from "express";
import {
    createTransaction,
    getAccounts,
    createAccount,
    getLedger,
    getFinancialSummary
} from "../controllers/financeController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all finance routes with admin auth
router.use(authMiddleware(["admin"]));

router.post("/transactions", createTransaction);
router.get("/accounts", getAccounts);
router.post("/accounts", createAccount);
router.get("/ledger/:accountId", getLedger);
router.get("/summary", getFinancialSummary);

export default router;
