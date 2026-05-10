import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import logger from "../config/logger.js";

/**
 * MTN Mobile Money (MoMo) Payment Service
 */
const MOMO_API_URL = process.env.MOMO_API_URL || "https://sandbox.momodeveloper.mtn.com";
const MOMO_SUBSCRIPTION_KEY = process.env.MOMO_SUBSCRIPTION_KEY;
const MOMO_API_USER = process.env.MOMO_API_USER;
const MOMO_API_KEY = process.env.MOMO_API_KEY;
const MOMO_CALLBACK_URL = process.env.MOMO_CALLBACK_URL || `${process.env.FRONTEND_URL}/api/payments/webhook/momo`;
const MOMO_ENV = process.env.MOMO_ENV || "sandbox";

// Create axios instance
const momoClient = axios.create({
    baseURL: MOMO_API_URL,
    headers: {
        "Ocp-Apim-Subscription-Key": MOMO_SUBSCRIPTION_KEY,
        "X-Target-Environment": MOMO_ENV,
    },
});

let cachedToken = null;
let tokenExpiry = null;

/**
 * Get OAuth access token
 */
export const getMomoToken = async () => {
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const authString = Buffer.from(`${MOMO_API_USER}:${MOMO_API_KEY}`).toString("base64");

        const response = await momoClient.post(
            "/collection/token/",
            {},
            {
                headers: {
                    Authorization: `Basic ${authString}`,
                },
            }
        );

        cachedToken = response.data.access_token;
        const expiresIn = response.data.expires_in || 3600;
        tokenExpiry = new Date(new Date().getTime() + (expiresIn - 60) * 1000);

        return cachedToken;
    } catch (error) {
        logger.error({ err: error }, "Failed to get MTN MoMo access token");
        throw new Error("Failed to authenticate with MTN MoMo");
    }
};

/**
 * Request to Pay (Collections)
 */
export const requestToPay = async ({ amount, currency = "RWF", phone, orderId }) => {
    try {
        const token = await getMomoToken();
        const referenceId = uuidv4();

        const payload = {
            amount: amount.toString(),
            currency,
            externalId: orderId.toString(),
            payer: {
                partyIdType: "MSISDN",
                partyId: phone,
            },
            payerMessage: `Payment for Order #${orderId}`,
            payeeNote: "Abelus Payment",
        };

        const response = await momoClient.post("/collection/v1_0/requesttopay", payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Reference-Id": referenceId,
                "X-Callback-Url": MOMO_CALLBACK_URL,
            },
        });

        return {
            success: true,
            referenceId,
            status: "PENDING",
            message: "Payment request sent to user's phone",
        };
    } catch (error) {
        logger.error({ err: error }, "MTN MoMo payment request failed");
        throw new Error("Failed to initiate MoMo payment: " + (error.response?.data?.message || error.message));
    }
};

/**
 * Get transaction status
 */
export const getTransactionStatus = async (referenceId) => {
    try {
        const token = await getMomoToken();

        const response = await momoClient.get(`/collection/v1_0/requesttopay/${referenceId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            return { status: "NOT_FOUND" };
        }
        logger.error({ err: error, referenceId }, "Failed to get transaction status");
        throw new Error("Failed to check payment status");
    }
};

/**
 * Check account balance
 */
export const getAccountBalance = async () => {
    try {
        const token = await getMomoToken();
        const response = await momoClient.get("/collection/v1_0/account/balance", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        logger.error({ err: error }, "Failed to get account balance");
        throw new Error("Failed to fetch account balance");
    }
};

/**
 * Validate account holder (Check if phone has MoMo)
 */
export const validateAccountHolder = async (phoneNumber) => {
    try {
        const token = await getMomoToken();
        const response = await momoClient.get(`/collection/v1_0/accountholder/msisdn/${phoneNumber}/active`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { isActive: response.data.result === true, phoneNumber };
    } catch (error) {
        logger.error({ err: error, phoneNumber }, "Failed to validate account holder");
        return { isActive: false, phoneNumber };
    }
};

/**
 * Webhook validation placeholder (Add production IP checks here)
 */
export const validateWebhook = (req) => {
    if (MOMO_ENV === "production") {
        // Implement IP whitelisting or specific header validation here
        // MTN usually doesn't sign webhooks, but IP checks are recommended.
    }
    return true;
};
