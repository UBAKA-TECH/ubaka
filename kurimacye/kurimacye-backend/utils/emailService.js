import nodemailer from "nodemailer";
import { Resend } from 'resend';
import handlebars from "handlebars";
import prisma from "../prisma.js";

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
    const from = process.env.SMTP_FROM || "Kuri Macye <noreply@kurimacye.rw>";
    
    // 1. Try Resend first if configured
    if (resend) {
        try {
            const { data, error } = await resend.emails.send({
                from: from.includes('<') ? from : `Kuri Macye <${from}>`,
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
            from: from.includes('<') ? from : `"Kuri Macye" <${process.env.SMTP_USER || from}>`,
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
 * Premium Responsive Layout Wrapper
 */
const getPremiumWrapper = (bodyContent) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kuri Macye Notification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      height: 100% !important;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background-color: #0f172a;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 2px;
    }
    .header p {
      color: #94a3b8;
      margin: 5px 0 0 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .content {
      padding: 40px 35px;
      color: #334155;
      line-height: 1.6;
      font-size: 15px;
    }
    .btn-container {
      text-align: center;
      margin: 35px 0 15px 0;
    }
    .btn {
      display: inline-block;
      background-color: #ea580c;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2);
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px 20px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      color: #94a3b8;
      font-size: 11px;
    }
    .footer a {
      color: #ea580c;
      text-decoration: none;
      font-weight: 600;
    }
    hr {
      border: 0;
      border-top: 1px solid #e2e8f0;
      margin: 25px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>KURI MACYE</h1>
        <p>Marketplace &amp; Hybrid Retail</p>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Kuri Macye. All rights reserved.</p>
        <p>You received this email because you are registered on Kuri Macye. If you wish to stop receiving transactional notifications, please contact support.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

/**
 * Default Code-defined Templates
 */
export const DEFAULT_TEMPLATES = {
    welcome: {
        subject: "Welcome to the Kuri Macye Community! 💌",
        html: getPremiumWrapper(`
            <h2 style="color: #0f172a; margin-top: 0;">Welcome to Kuri Macye! 🎉</h2>
            <p>Thank you for subscribing to our newsletter. We are thrilled to have you as part of our community.</p>
            <p>Discover local vendors, unique creations, and quality items directly from Rwandan SMEs.</p>
            <div class="btn-container">
              <a href="{{shopUrl}}" class="btn">Start Shopping</a>
            </div>
            <hr>
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">If you wish to unsubscribe, please click <a href="{{unsubscribeUrl}}">here</a>.</p>
        `)
    },
    order_confirmation: {
        subject: "Order Confirmation #{{orderNumber}} — Kuri Macye",
        html: getPremiumWrapper(`
            <h2 style="color: #0f172a; margin-top: 0;">Thank you for your order!</h2>
            <p>Hi {{customerName}},</p>
            <p>We've received your order <strong>#{{orderNumber}}</strong> and it's being processed. We'll notify you as soon as your items are on their way.</p>
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; margin: 25px 0;">
                <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px;">
                    <span style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Summary</span>
                    <span style="color: #94a3b8; font-size: 12px; float: right;">{{date}}</span>
                </div>
                <div style="margin-bottom: 12px; font-size: 16px;">
                    <span style="color: #64748b;">Total Amount</span>
                    <span style="color: #0f172a; font-weight: 800; float: right;">{{grandTotal}} RWF</span>
                </div>
                <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0; font-style: italic;">
                    Payment Method: {{paymentMethod}}
                </p>
            </div>
            <div class="btn-container">
              <a href="{{trackUrl}}" class="btn">Track My Order</a>
            </div>
        `)
    },
    status_update: {
        subject: "Order Update #{{orderNumber}} — Kuri Macye",
        html: getPremiumWrapper(`
            <h2 style="color: #0f172a; margin-top: 0;">📦 Order Status Update</h2>
            <p>Hi {{customerName}},</p>
            <p>Your order <strong>#{{orderNumber}}</strong> status has been updated to: <span style="background-color: #ea580c; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase;">{{status}}</span>.</p>
            <div class="btn-container">
              <a href="{{trackUrl}}" class="btn">Track Order Details</a>
            </div>
        `)
    },
    gift_card: {
        subject: "You received a Gift Card from {{senderName}}! 🎁",
        html: getPremiumWrapper(`
            <div style="text-align: center; background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); color: white; padding: 35px 25px; border-radius: 16px; margin-bottom: 25px;">
                <h1 style="font-size: 28px; margin: 0 0 10px 0; color: white;">Surprise! 🎁</h1>
                <p style="font-size: 16px; margin: 0 0 25px 0;">{{senderName}} has sent you a Kuri Macye Gift Card.</p>
                <div style="background: rgba(255, 255, 255, 0.15); border: 2px dashed rgba(255, 255, 255, 0.5); padding: 25px; border-radius: 12px; display: inline-block; width: 80%;">
                    <p style="text-transform: uppercase; letter-spacing: 3px; font-size: 11px; margin: 0 0 8px 0; opacity: 0.9;">Your Gift Code</p>
                    <h2 style="font-size: 32px; margin: 0; font-weight: 900; letter-spacing: 1px; color: white;">{{code}}</h2>
                    <p style="font-size: 22px; font-weight: 700; margin: 10px 0 0 0; color: white;">{{amount}} RWF</p>
                </div>
                {{#if message}}
                <p style="font-style: italic; margin-top: 25px; margin-bottom: 0; opacity: 0.9;">"{{message}}"</p>
                {{/if}}
            </div>
            <p>You can use this code at checkout to get a discount on your next purchase.</p>
            <div class="btn-container">
              <a href="{{shopUrl}}" class="btn" style="background-color: #0f172a; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);">Shop Now</a>
            </div>
            <p style="font-size: 11px; text-align: center; color: #94a3b8; margin-top: 20px;">This gift card expires on {{expiryDate}}</p>
        `)
    },
    seller_approved: {
        subject: "🎉 Congratulations! Your Seller Account is Approved",
        html: getPremiumWrapper(`
            <h2 style="color: #10b981; margin-top: 0;">🎉 Congratulations!</h2>
            <p>Hi {{sellerName}},</p>
            <p>Great news! Your seller application for <strong>{{storeName}}</strong> has been approved. You can now log into your seller portal and list products for sale.</p>
            <div class="btn-container">
              <a href="{{dashboardUrl}}" class="btn">Go to Seller Dashboard</a>
            </div>
        `)
    },
    seller_rejected: {
        subject: "Seller Application Update - Kuri Macye",
        html: getPremiumWrapper(`
            <h2 style="color: #ef4444; margin-top: 0;">Seller Application Update</h2>
            <p>Hi {{sellerName}},</p>
            <p>We've reviewed your seller application for <strong>{{storeName}}</strong>.</p>
            {{#if reason}}
            <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 15px; margin: 20px 0; color: #991b1b;">
                <strong>Reason for Rejection:</strong> {{reason}}
            </div>
            {{/if}}
            <p>If you have any questions or would like to submit additional verification documents, please contact our support team.</p>
        `)
    },
    product_approved: {
        subject: "✅ Product Approved: {{productName}} - Kuri Macye",
        html: getPremiumWrapper(`
            <h2 style="color: #10b981; margin-top: 0;">✅ Product Approved</h2>
            <p>Hi {{sellerName}},</p>
            <p>Your product <strong>"{{productName}}"</strong> has been approved by our content controllers and is now live on the storefront.</p>
            <div class="btn-container">
              <a href="{{productUrl}}" class="btn">View Live Product</a>
            </div>
        `)
    },
    new_order: {
        subject: "🛒 New Order: #{{orderNumber}} - Kuri Macye",
        html: getPremiumWrapper(`
            <h2 style="color: #ea580c; margin-top: 0;">🛒 New Order Received!</h2>
            <p>Hi {{sellerName}},</p>
            <p>You have received a new order to fulfill.</p>
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Order ID:</strong> #{{orderNumber}}</p>
                <p style="margin: 5px 0;"><strong>Items to Pack:</strong> {{itemCount}}</p>
                <p style="margin: 5px 0;"><strong>Your Earnings:</strong> {{total}} RWF</p>
            </div>
            <p>Please log into your dashboard to accept the order and prepare shipment.</p>
            <div class="btn-container">
              <a href="{{dashboardUrl}}" class="btn">View Order Details</a>
            </div>
        `)
    },
    payout_processed: {
        subject: "💰 Payout Processed: {{amount}} RWF - Kuri Macye",
        html: getPremiumWrapper(`
            <h2 style="color: #10b981; margin-top: 0;">💰 Payout Processed</h2>
            <p>Hi {{sellerName}},</p>
            <p>We have successfully processed your payout of <strong>{{amount}} RWF</strong>.</p>
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Amount Transferred:</strong> {{amount}} RWF</p>
                <p style="margin: 5px 0;"><strong>Payout Method:</strong> {{paymentMethod}}</p>
            </div>
            <p>The funds should be available in your account shortly depending on your provider.</p>
        `)
    },
    account_warning: {
        subject: "⚠️ Seller Account Warning - Kuri Macye",
        html: getPremiumWrapper(`
            <h2 style="color: #d97706; margin-top: 0;">⚠️ Account Warning</h2>
            <p>Hi {{sellerName}},</p>
            <p>This is an official notice regarding policy violations detected on your vendor account.</p>
            <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0; color: #92400e;">
                <p style="margin: 5px 0;"><strong>Violation Type:</strong> {{violationType}}</p>
                <p style="margin: 5px 0;"><strong>Details:</strong> {{description}}</p>
            </div>
            <p>Please review our vendor guidelines to avoid account suspension or termination.</p>
        `)
    },
    low_stock: {
        subject: "📦 Low Stock Alert - Kuri Macye",
        html: getPremiumWrapper(`
            <h2 style="color: #ea580c; margin-top: 0;">📦 Low Stock Alert</h2>
            <p>Hi {{sellerName}},</p>
            <p>The following items in your inventory are running low on stock:</p>
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin: 20px 0;">
                <ul style="margin: 0; padding-left: 20px;">
                    {{{productList}}}
                </ul>
            </div>
            <p>Please restock these items soon to prevent missed sales.</p>
            <div class="btn-container">
              <a href="{{inventoryUrl}}" class="btn">Manage Inventory</a>
            </div>
        `)
    }
};

/**
 * Compiles a subject and html body with variables
 */
const getRenderedTemplate = async (templateName, variables, defaultSubject, defaultHtml) => {
    let subject = defaultSubject;
    let html = defaultHtml;

    try {
        const dbTemplate = await prisma.emailTemplate.findUnique({
            where: { name: templateName }
        });

        if (dbTemplate) {
            const subjectTemplate = handlebars.compile(dbTemplate.subject);
            subject = subjectTemplate(variables);

            const htmlTemplate = handlebars.compile(dbTemplate.html);
            html = htmlTemplate(variables);
        } else {
            const subjectTemplate = handlebars.compile(defaultSubject);
            subject = subjectTemplate(variables);

            const htmlTemplate = handlebars.compile(defaultHtml);
            html = htmlTemplate(variables);
        }
    } catch (error) {
        console.error(`[EmailTemplate] Error rendering template ${templateName}:`, error.message);
        try {
            const subjectTemplate = handlebars.compile(defaultSubject);
            subject = subjectTemplate(variables);
            const htmlTemplate = handlebars.compile(defaultHtml);
            html = htmlTemplate(variables);
        } catch (e) {
            // raw fallbacks
        }
    }

    return { subject, html };
};

/**
 * Database Seeder for Default Templates
 */
export const seedEmailTemplates = async () => {
    try {
        const count = await prisma.emailTemplate.count();
        if (count > 0) {
            console.log("✅ Email templates table already seeded.");
            return;
        }

        console.log("🌱 Seeding default email templates to database...");
        for (const [name, data] of Object.entries(DEFAULT_TEMPLATES)) {
            await prisma.emailTemplate.create({
                data: {
                    name,
                    subject: data.subject,
                    html: data.html
                }
            });
        }
        console.log("✅ Default email templates successfully seeded.");
    } catch (err) {
        console.error("❌ Failed to seed email templates:", err.message);
    }
};

/**
 * Order Confirmation
 */
export const sendOrderConfirmation = async (order) => {
    const customerName = order.guestInfo?.name || order.customer?.name || 'Customer';
    const variables = {
        customerName,
        orderNumber: order.publicId,
        grandTotal: order.totals.grandTotal.toLocaleString(),
        paymentMethod: order.payment?.method || 'Standard',
        date: new Date().toLocaleDateString(),
        trackUrl: `${process.env.FRONTEND_URL}/orders/${order.publicId}`
    };

    const { subject, html } = await getRenderedTemplate(
        "order_confirmation",
        variables,
        DEFAULT_TEMPLATES.order_confirmation.subject,
        DEFAULT_TEMPLATES.order_confirmation.html
    );

    return sendEmail({
        to: order.guestInfo?.email || order.customer?.email,
        subject,
        html
    });
};

/**
 * Status Update
 */
export const sendStatusUpdate = async (order) => {
    const customerName = order.guestInfo?.name || order.customer?.name || 'Customer';
    const variables = {
        customerName,
        orderNumber: order.publicId,
        status: order.status.toUpperCase(),
        trackUrl: `${process.env.FRONTEND_URL}/orders/${order.publicId}`
    };

    const { subject, html } = await getRenderedTemplate(
        "status_update",
        variables,
        DEFAULT_TEMPLATES.status_update.subject,
        DEFAULT_TEMPLATES.status_update.html
    );

    return sendEmail({
        to: order.guestInfo?.email || order.customer?.email,
        subject,
        html
    });
};

/**
 * Gift Card Delivery
 */
export const sendGiftCardEmail = async (giftCard, senderName) => {
    const variables = {
        senderName,
        code: giftCard.code,
        amount: giftCard.initialAmount.toLocaleString(),
        message: giftCard.message,
        expiryDate: new Date(giftCard.expiryDate).toLocaleDateString(),
        shopUrl: `${process.env.FRONTEND_URL}/shop`
    };

    const { subject, html } = await getRenderedTemplate(
        "gift_card",
        variables,
        DEFAULT_TEMPLATES.gift_card.subject,
        DEFAULT_TEMPLATES.gift_card.html
    );

    return sendEmail({
        to: giftCard.recipientEmail,
        subject,
        html
    });
};

/**
 * Seller Approved
 */
export const sendSellerApprovedEmail = async (seller) => {
    const variables = {
        sellerName: seller.name,
        storeName: seller.storeName,
        dashboardUrl: `${process.env.FRONTEND_URL}/seller/dashboard`
    };

    const { subject, html } = await getRenderedTemplate(
        "seller_approved",
        variables,
        DEFAULT_TEMPLATES.seller_approved.subject,
        DEFAULT_TEMPLATES.seller_approved.html
    );

    return sendEmail({
        to: seller.email,
        subject,
        html
    });
};

/**
 * Seller Rejected
 */
export const sendSellerRejectedEmail = async (seller, reason) => {
    const variables = {
        sellerName: seller.name,
        storeName: seller.storeName || 'your store',
        reason
    };

    const { subject, html } = await getRenderedTemplate(
        "seller_rejected",
        variables,
        DEFAULT_TEMPLATES.seller_rejected.subject,
        DEFAULT_TEMPLATES.seller_rejected.html
    );

    return sendEmail({
        to: seller.email,
        subject,
        html
    });
};

/**
 * Product Approved
 */
export const sendProductApprovedEmail = async (seller, product) => {
    const variables = {
        sellerName: seller.name,
        productName: product.name,
        productUrl: `${process.env.FRONTEND_URL}/product/${product.slug}`
    };

    const { subject, html } = await getRenderedTemplate(
        "product_approved",
        variables,
        DEFAULT_TEMPLATES.product_approved.subject,
        DEFAULT_TEMPLATES.product_approved.html
    );

    return sendEmail({
        to: seller.email,
        subject,
        html
    });
};

/**
 * New Order Notification (For Seller)
 */
export const sendNewOrderEmail = async (seller, order) => {
    const sellerItems = order.items.filter(item =>
        item.seller && item.seller.toString() === seller.id.toString()
    );
    const total = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const variables = {
        sellerName: seller.name,
        orderNumber: order.orderNumber || order.id,
        itemCount: sellerItems.length,
        total: total.toLocaleString(),
        dashboardUrl: `${process.env.FRONTEND_URL}/seller/orders/${order.id}`
    };

    const { subject, html } = await getRenderedTemplate(
        "new_order",
        variables,
        DEFAULT_TEMPLATES.new_order.subject,
        DEFAULT_TEMPLATES.new_order.html
    );

    return sendEmail({
        to: seller.email,
        subject,
        html
    });
};

/**
 * Payout Sent
 */
export const sendPayoutSentEmail = async (seller, payout) => {
    const variables = {
        sellerName: seller.name,
        amount: payout.amount.toLocaleString(),
        paymentMethod: payout.paymentMethod
    };

    const { subject, html } = await getRenderedTemplate(
        "payout_processed",
        variables,
        DEFAULT_TEMPLATES.payout_processed.subject,
        DEFAULT_TEMPLATES.payout_processed.html
    );

    return sendEmail({
        to: seller.email,
        subject,
        html
    });
};

/**
 * Warning Notice
 */
export const sendWarningEmail = async (seller, violation) => {
    const variables = {
        sellerName: seller.name,
        violationType: violation.type.replace(/_/g, ' '),
        description: violation.description
    };

    const { subject, html } = await getRenderedTemplate(
        "account_warning",
        variables,
        DEFAULT_TEMPLATES.account_warning.subject,
        DEFAULT_TEMPLATES.account_warning.html
    );

    return sendEmail({
        to: seller.email,
        subject,
        html
    });
};

/**
 * Low Stock Alert
 */
export const sendLowStockEmail = async (seller, products) => {
    const productList = products.map(p =>
        `<li><strong>${p.name}</strong> - ${p.stock} remaining</li>`
    ).join('');
    const variables = {
        sellerName: seller.name,
        productList,
        inventoryUrl: `${process.env.FRONTEND_URL}/seller/products`
    };

    const { subject, html } = await getRenderedTemplate(
        "low_stock",
        variables,
        DEFAULT_TEMPLATES.low_stock.subject,
        DEFAULT_TEMPLATES.low_stock.html
    );

    return sendEmail({
        to: seller.email,
        subject,
        html
    });
};

/**
 * Welcome Newsletter Subscriber
 */
export const sendWelcomeEmail = async (email) => {
    const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
    const headers = {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    };

    const variables = {
        email,
        unsubscribeUrl,
        shopUrl: `${process.env.FRONTEND_URL}/shop`
    };

    const { subject, html } = await getRenderedTemplate(
        "welcome",
        variables,
        DEFAULT_TEMPLATES.welcome.subject,
        DEFAULT_TEMPLATES.welcome.html
    );

    return sendEmail({
        to: email,
        subject,
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
    sendWelcomeEmail,
    seedEmailTemplates
};
