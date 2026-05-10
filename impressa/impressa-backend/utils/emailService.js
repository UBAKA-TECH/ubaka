import nodemailer from "nodemailer";
import { Resend } from 'resend';
import { renderTemplate } from "./emailTemplate.js";

/**
 * Centralized Email Service
 * Handles all transactional emails for the platform
 * Tries Resend (API) first, falls back to Nodemailer (SMTP)
 */

// Initialize Resend
let resend = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
}

// Create transporter for fallback
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

export const sendEmail = async ({ to, subject, text, html, headers }) => {
    const from = process.env.SMTP_FROM || "Abelus <noreply@abelus.rw>";
    
    // 1. Try Resend first if configured
    if (resend) {
        try {
            const { data, error } = await resend.emails.send({
                from: from.includes('<') ? from : `Abelus <${from}>`,
                to,
                subject,
                text,
                html,
                headers
            });

            if (!error) {
                console.log(`[Email-Resend] Sent to ${to}: ${subject}`);
                return { success: true, messageId: data.id };
            }
            console.warn(`[Email-Resend] Error: ${error.message}. Falling back to SMTP.`);
        } catch (error) {
            console.warn(`[Email-Resend] Exception: ${error.message}. Falling back to SMTP.`);
        }
    }

    // 2. Fallback to Nodemailer SMTP
    try {
        const transporter = createTransporter();
        const mailOptions = {
            from: from.includes('<') ? from : `"Abelus" <${process.env.SMTP_USER || from}>`,
            to,
            subject,
            text,
            html,
            headers
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`[Email-SMTP] Sent to ${to}: ${subject}`);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`[Email] All providers failed for ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Email Templates
 */

// Order Confirmation
export const sendOrderConfirmation = async (order) => {
    const html = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;">
        <div style="background-color: #0f172a; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">IMPRESSA</h1>
            <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</p>
        </div>
        <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 20px;">Thank you for your order!</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                Hi ${order.guestInfo?.name || order.customer?.name || 'Customer'}, we've received your order <strong>#${order.publicId}</strong> and it's being processed. We'll notify you as soon as your items are on their way.
            </p>
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Summary</span>
                    <span style="color: #94a3b8; font-size: 12px;">${new Date().toLocaleDateString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span style="color: #64748b; font-size: 14px;">Total Amount</span>
                    <span style="color: #0f172a; font-size: 18px; font-weight: 800;">${order.totals.grandTotal.toLocaleString()} RWF</span>
                </div>
                <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0; font-style: italic;">
                    Payment Method: ${order.payment?.method || 'Standard'}
                </p>
            </div>
            <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.FRONTEND_URL}/orders/${order.publicId}" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; font-size: 16px;">
                    Track My Order
                </a>
            </div>
        </div>
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Abelus. All rights reserved.</p>
        </div>
    </div>`;

    return sendEmail({
        to: order.guestInfo?.email || order.customer?.email,
        subject: `Order Confirmation #${order.publicId} — Abelus`,
        html
    });
};

// Status Update
export const sendStatusUpdate = async (order) => {
    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">📦 Order Update</h2>
        <p>Hi ${order.guestInfo?.name || order.customer?.name || 'Customer'},</p>
        <p>Your order <strong>#${order.publicId}</strong> status has been updated to: <strong>${order.status.toUpperCase()}</strong>.</p>
        <a href="${process.env.FRONTEND_URL}/orders/${order.publicId}" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Track Order
        </a>
    </div>`;

    return sendEmail({
        to: order.guestInfo?.email || order.customer?.email,
        subject: `Order Update #${order.publicId} — Abelus`,
        html
    });
};

// Gift Card Delivery
export const sendGiftCardEmail = async (giftCard, senderName) => {
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; padding: 40px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white;">
        <h1 style="font-size: 32px; margin-bottom: 10px;">Surprise! 🎁</h1>
        <p style="font-size: 18px; margin-bottom: 30px;">${senderName} has sent you an Abelus Gift Card.</p>
        <div style="background: rgba(255, 255, 255, 0.1); border: 2px dashed rgba(255, 255, 255, 0.5); padding: 30px; border-radius: 20px; margin: 40px 0;">
            <p style="text-transform: uppercase; letter-spacing: 4px; font-size: 12px; margin: 0 0 10px 0; opacity: 0.8;">Your Gift Code</p>
            <h2 style="font-size: 36px; margin: 0; font-weight: 900; letter-spacing: 1px;">${giftCard.code}</h2>
            <p style="font-size: 24px; font-weight: 700; margin: 15px 0 0 0;">${giftCard.initialAmount.toLocaleString()} RWF</p>
        </div>
        ${giftCard.message ? `<p style="font-style: italic; margin-bottom: 30px; opacity: 0.9;">"${giftCard.message}"</p>` : ''}
        <p style="font-size: 14px; opacity: 0.8; margin-bottom: 30px;">You can use this code at checkout to get a discount on your next purchase.</p>
        <a href="${process.env.FRONTEND_URL}/shop" style="display: inline-block; background: white; color: #6366f1; text-decoration: none; padding: 15px 40px; border-radius: 12px; font-weight: bold; font-size: 16px;">Shop Now</a>
        <p style="font-size: 12px; margin-top: 40px; opacity: 0.6;">This gift card expires on ${new Date(giftCard.expiryDate).toLocaleDateString()}</p>
    </div>`;

    return sendEmail({
        to: giftCard.recipientEmail,
        subject: `You received a Gift Card from ${senderName}!`,
        html
    });
};

// Seller Approved
export const sendSellerApprovedEmail = async (seller) => {
    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">🎉 Congratulations! Your Seller Account is Approved</h2>
        <p>Hi ${seller.name},</p>
        <p>Great news! Your seller application for <strong>${seller.storeName}</strong> has been approved.</p>
        <a href="${process.env.FRONTEND_URL}/seller/dashboard" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Go to Seller Dashboard
        </a>
    </div>`;

    return sendEmail({
        to: seller.email,
        subject: "🎉 Your Seller Account is Approved - Abelus",
        html
    });
};

// Seller Rejected
export const sendSellerRejectedEmail = async (seller, reason) => {
    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ef4444;">Seller Application Update</h2>
        <p>Hi ${seller.name},</p>
        <p>We've reviewed your seller application for <strong>${seller.storeName || 'your store'}</strong>.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p style="color: #6b7280; margin-top: 24px;">— The Abelus Team</p>
    </div>`;

    return sendEmail({
        to: seller.email,
        subject: "Seller Application Update - Abelus",
        html
    });
};

// Product Approved
export const sendProductApprovedEmail = async (seller, product) => {
    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">✅ Product Approved</h2>
        <p>Hi ${seller.name},</p>
        <p>Your product <strong>"${product.name}"</strong> has been approved and is now live.</p>
        <a href="${process.env.FRONTEND_URL}/product/${product.slug}" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            View Product
        </a>
    </div>`;

    return sendEmail({
        to: seller.email,
        subject: `✅ Product Approved: ${product.name} - Abelus`,
        html
    });
};

// New Order Notification (For Seller)
export const sendNewOrderEmail = async (seller, order) => {
    const sellerItems = order.items.filter(item =>
        item.seller && item.seller.toString() === seller.id.toString()
    );
    const total = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">🛒 New Order Received!</h2>
        <p>Hi ${seller.name},</p>
        <p>You have a new order to fulfill!</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Order ID:</strong> ${order.orderNumber || order.id}</p>
            <p><strong>Items:</strong> ${sellerItems.length}</p>
            <p><strong>Total:</strong> ${total.toLocaleString()} RWF</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/seller/orders/${order.id}" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            View Order Details
        </a>
    </div>`;

    return sendEmail({
        to: seller.email,
        subject: `🛒 New Order: ${order.orderNumber || order.id} - Abelus`,
        html
    });
};

// Payout Sent
export const sendPayoutSentEmail = async (seller, payout) => {
    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #10b981;">💰 Payout Processed</h2>
        <p>Hi ${seller.name},</p>
        <p>Your payout of <strong>${payout.amount.toLocaleString()} RWF</strong> has been processed.</p>
        <p>Payment Method: ${payout.paymentMethod}</p>
    </div>`;

    return sendEmail({
        to: seller.email,
        subject: `💰 Payout Processed: ${payout.amount.toLocaleString()} RWF - Abelus`,
        html
    });
};

// Warning Notice
export const sendWarningEmail = async (seller, violation) => {
    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f59e0b;">⚠️ Account Warning</h2>
        <p>Hi ${seller.name},</p>
        <p><strong>Issue:</strong> ${violation.type.replace(/_/g, ' ')}</p>
        <p>${violation.description}</p>
    </div>`;

    return sendEmail({
        to: seller.email,
        subject: "⚠️ Seller Account Warning - Abelus",
        html
    });
};

// Low Stock Alert
export const sendLowStockEmail = async (seller, products) => {
    const productList = products.map(p =>
        `<li><strong>${p.name}</strong> - ${p.stock} remaining</li>`
    ).join('');

    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">📦 Low Stock Alert</h2>
        <ul style="background: #f3f4f6; padding: 16px 32px; border-radius: 8px;">
            ${productList}
        </ul>
        <a href="${process.env.FRONTEND_URL}/seller/products" 
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
            Manage Inventory
        </a>
    </div>`;

    return sendEmail({
        to: seller.email,
        subject: "📦 Low Stock Alert - Abelus",
        html
    });
};

// Welcome Newsletter Subscriber
export const sendWelcomeEmail = async (email) => {
    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
    const headers = {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    };

    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome to Abelus! 🎉</h2>
        <p>Thank you for subscribing to our newsletter.</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.FRONTEND_URL}/shop" 
               style="display: inline-block; background: #ef4444; color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px;">
                Start Shopping
            </a>
        </div>
    </div>`;

    return sendEmail({
        to: email,
        subject: "Welcome to the Abelus Community! 💌",
        html,
        headers
    });
};

export default {
    sendEmail,
    sendOrderConfirmation,
    sendStatusUpdate,
    sendGiftCardEmail,
    sendSellerApprovedEmail,
    sendSellerRejectedEmail,
    sendProductApprovedEmail,
    sendNewOrderEmail,
    sendPayoutSentEmail,
    sendWarningEmail,
    sendLowStockEmail,
    sendWelcomeEmail
};
