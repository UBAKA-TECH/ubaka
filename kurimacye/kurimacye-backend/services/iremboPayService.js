import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import logger from "../config/logger.js";

const IREMBO_PAY_API_URL = process.env.IREMBO_PAY_API_URL || "https://api.sandbox.irembopay.com";
const IREMBO_PAY_PUBLIC_KEY = process.env.IREMBO_PAY_PUBLIC_KEY;
const IREMBO_PAY_SECRET_KEY = process.env.IREMBO_PAY_SECRET_KEY;
const IREMBO_ENV = process.env.IREMBO_ENV || "sandbox";

// Create Axios client for IremboPay API
const iremboClient = axios.create({
    baseURL: IREMBO_PAY_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor to inject Secret Key authorization header
iremboClient.interceptors.request.use((config) => {
    if (IREMBO_PAY_SECRET_KEY && !IREMBO_PAY_SECRET_KEY.includes("placeholder")) {
        config.headers.Authorization = `Bearer ${IREMBO_PAY_SECRET_KEY}`;
    }
    return config;
});

/**
 * Create an Invoice/Payment session with IremboPay
 * @param {Object} params - Invoice details
 * @param {number} params.amount - Total amount
 * @param {string} params.currency - Transaction currency (e.g., 'RWF')
 * @param {string} params.description - Details of the purchase
 * @param {string} params.orderId - Kuri Macye local order ID / publicId
 * @param {Object} [params.customer] - Customer metadata
 */
export const createInvoice = async ({ amount, currency = "RWF", description, orderId, customer = {} }) => {
    // If sandbox / simulation environment is active, return mock invoice session details
    if (IREMBO_ENV === "sandbox" || !IREMBO_PAY_SECRET_KEY || IREMBO_PAY_SECRET_KEY.includes("placeholder")) {
        logger.info({ orderId, amount }, "🧪 [IremboPay Service] Simulating Invoice Creation");
        
        const mockInvoiceNumber = `SIM-IREMBO-${Date.now()}`;
        return {
            success: true,
            invoiceNumber: mockInvoiceNumber,
            amount: amount,
            currency: currency,
            status: "PENDING",
            message: "Invoice created successfully (Simulation Mode)",
        };
    }

    try {
        const payload = {
            amount: amount,
            currency: currency,
            description: description || `Payment for Kuri Macye Order #${orderId}`,
            externalId: orderId,
            customer: {
                name: customer.name || "Guest User",
                email: customer.email || "",
                phone: customer.phone || "",
            },
        };

        const response = await iremboClient.post("/api/v1/invoices", payload);
        
        return {
            success: true,
            invoiceNumber: response.data.invoiceNumber || response.data.id,
            status: response.data.status || "PENDING",
            raw: response.data,
        };
    } catch (error) {
        logger.error({ err: error, orderId }, "IremboPay invoice creation failed");
        throw new Error("Failed to initiate payment with IremboPay: " + (error.response?.data?.message || error.message));
    }
};

/**
 * Get the status of an IremboPay invoice
 * @param {string} invoiceNumber - The invoice number to query
 */
export const getInvoiceStatus = async (invoiceNumber) => {
    // Check for simulated invoice prefix
    if (invoiceNumber.startsWith("SIM-IREMBO")) {
        logger.info({ invoiceNumber }, "🧪 [IremboPay Service] Simulating Invoice Status Query");
        
        // For testing/simulation, we return SUCCESSFUL. In a polling loop, this mock allows instantaneous resolution.
        return {
            invoiceNumber,
            status: "SUCCESSFUL",
            amount: 0,
        };
    }

    try {
        const response = await iremboClient.get(`/api/v1/invoices/${invoiceNumber}`);
        
        return {
            invoiceNumber: response.data.invoiceNumber || response.data.id,
            status: response.data.status, // EXPECTED: PENDING, SUCCESSFUL, FAILED
            amount: response.data.amount,
            raw: response.data,
        };
    } catch (error) {
        logger.error({ err: error, invoiceNumber }, "Failed to get IremboPay invoice status");
        throw new Error("Failed to verify IremboPay status");
    }
};

/**
 * Validate signature / webhook authenticity
 */
export const validateIremboWebhook = (req) => {
    if (IREMBO_ENV === "production") {
        // Implement production webhook signature verification here using Irembo secrets if provided
        // e.g. verifying SHA256 HMAC headers
    }
    return true;
};
