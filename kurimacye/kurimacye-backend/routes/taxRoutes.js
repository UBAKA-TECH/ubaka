import express from "express";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";
import {
    getTaxRates,
    createTaxRate,
    updateTaxRate,
    deleteTaxRate,

    calculateTax,
    fetchLiveRates
} from "../controllers/taxController.js";

const router = express.Router();

router.post("/calculate", calculateTax); // Public endpoint for checkout

router.post("/fetch", verifyToken, verifyAdmin, fetchLiveRates);

router.route("/")
    .get(verifyToken, verifyAdmin, getTaxRates)
    .post(verifyToken, verifyAdmin, createTaxRate);

router.route("/:id")
    .put(verifyToken, verifyAdmin, updateTaxRate)
    .delete(verifyToken, verifyAdmin, deleteTaxRate);

export default router;
