import handlebars from "handlebars";
import prisma from "../prisma.js";
import { sendEmail, DEFAULT_TEMPLATES } from "../utils/emailService.js";

const getMockVariables = () => {
    return {
        customerName: "Jane Doe (Test)",
        orderNumber: "IMP-TEST-9999",
        grandTotal: "45,000",
        paymentMethod: "Mobile Money (Test)",
        date: new Date().toLocaleDateString(),
        trackUrl: "#",
        status: "DELIVERED",
        senderName: "John Smith (Test)",
        code: "GIFT-TEST-CODE",
        amount: "25,000",
        message: "Enjoy your test gift card!",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        shopUrl: "#",
        sellerName: "Store Owner (Test)",
        storeName: "Test Merchant Store",
        dashboardUrl: "#",
        reason: "Missing tax identification number.",
        productName: "Eco Clean Cookstove (Test)",
        productUrl: "#",
        itemCount: 3,
        total: "15,000",
        violationType: "Late Shipment Warning",
        description: "Multiple orders were not shipped within the 48-hour SLA.",
        productList: "<li><strong>Test Product A</strong> - 2 remaining</li><li><strong>Test Product B</strong> - 0 remaining</li>",
        inventoryUrl: "#",
        email: "test@example.com",
        unsubscribeUrl: "#"
    };
};

/**
 * 📧 Send Test Email for Template
 */
export const sendTestEmail = async (req, res, next) => {
    try {
        const { templateName, recipientEmail } = req.body;
        const secret = req.headers['x-ubaka-secret'];

        // Validate shared secret
        if (secret !== (process.env.JWT_SECRET || 'impressa123')) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Invalid shared secret."
            });
        }

        if (!templateName || !recipientEmail) {
            return res.status(400).json({
                success: false,
                message: "templateName and recipientEmail are required."
            });
        }

        // Get template from DB or default fallback
        const dbTemplate = await prisma.emailTemplate.findUnique({
            where: { name: templateName }
        });

        const defaultTemplate = DEFAULT_TEMPLATES[templateName];
        if (!dbTemplate && !defaultTemplate) {
            return res.status(404).json({
                success: false,
                message: `Template '${templateName}' not found.`
            });
        }

        const templateSubject = dbTemplate ? dbTemplate.subject : defaultTemplate.subject;
        const templateHtml = dbTemplate ? dbTemplate.html : defaultTemplate.html;

        // Compile template with mock variables
        const variables = getMockVariables();
        
        const compiledSubject = handlebars.compile(templateSubject)(variables);
        const compiledHtml = handlebars.compile(templateHtml)(variables);

        // Dispatch email
        const result = await sendEmail({
            to: recipientEmail,
            subject: `[Test] ${compiledSubject}`,
            html: compiledHtml
        });

        if (result.success) {
            return res.json({
                success: true,
                message: `Test email for '${templateName}' successfully dispatched to ${recipientEmail}.`,
                messageId: result.messageId
            });
        } else {
            return res.status(500).json({
                success: false,
                message: `Failed to send email: ${result.error}`
            });
        }
    } catch (error) {
        next(error);
    }
};
