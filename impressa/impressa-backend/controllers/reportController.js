import path from "path";
import fs from "fs";
import axios from "axios";
import prisma from "../prisma.js";
import { buildReportData } from "../services/reportBuilders.js";
import { createImpressaPDF } from "../utils/pdfLayout.js";
import convertToCSV from "../utils/csvExporter.js";
import generateAISummary from "../utils/aiSummary.js";
import sendReportEmail from "../utils/sendReportEmail.js";

/**
 * Helper to get logo as buffer for PDFKit
 */
const getLogoBuffer = async (logoUrlOrPath) => {
    try {
        if (!logoUrlOrPath) return null;

        // If it's a URL (Cloudinary)
        if (logoUrlOrPath.startsWith('http')) {
            const response = await axios.get(logoUrlOrPath, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        }

        // If it's a local path
        const fullPath = path.isAbsolute(logoUrlOrPath) ? logoUrlOrPath : path.join(path.resolve(), logoUrlOrPath);
        if (fs.existsSync(fullPath)) {
            return fs.readFileSync(fullPath);
        }
        return null;
    } catch (err) {
        console.warn("Failed to load logo buffer:", err.message);
        return null;
    }
};

/**
 * 📊 Generate and export business reports
 */
export const generateReport = async (req, res) => {
    try {
        const { type, format, ...filters } = req.query;
        const validTypes = ["monthly", "daily", "custom-range", "customer", "status", "revenue", "weekly", "inventory"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: `Invalid report type. Must be one of: ${validTypes.join(", ")}` });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: "User profile not found." });

        // Enforce sellerId for sellers and staff
        if (req.user.role !== "admin" && req.user.role !== "owner") {
            const effectiveSellerId = req.user.role === 'cashier' ? req.user.managedById : req.user.id;
            filters.sellerId = effectiveSellerId;
        }

        // Fetch site settings for logo
        const settings = await prisma.siteSettings.findFirst();

        // Build report data
        let orders, summary;
        try {
            const result = await buildReportData(type, filters);
            orders = result.orders;
            summary = result.summary;
            filters.expenses = result.expenses;
            filters.shifts = result.shifts;
            filters.abonneTransactions = result.abonneTransactions;
            filters.products = result.products; // For inventory reports
        } catch (buildError) {
            console.error("buildReportData error:", buildError);
            return res.status(500).json({ message: `Failed to build report data: ${buildError.message}` });
        }

        const aiSummary = generateAISummary(type, summary);

        // Log report generation
        await prisma.reportLog.create({
            data: {
                type,
                filters: filters || {},
                generatedById: user.id,
                format: format || 'pdf',
                aiSummary,
            }
        });

        // Async email sending
        try {
            await sendReportEmail({
                to: user.email,
                subject: `📊 ${type.charAt(0).toUpperCase() + type.slice(1)} Report Ready`,
                text: `Your report has been generated.\n\nSummary:\n${aiSummary}`,
            });
        } catch (e) {
            console.warn("sendReportEmail failed:", e.message);
        }

        // Export as CSV
        if (format === "csv") {
            const csv = convertToCSV(orders, filters.expenses);
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename=${type}-report.csv`);
            return res.send(csv);
        }

        // Export as PDF with enhanced safety
        let logoBuffer = null;
        try {
            const logoPath = user.storeLogo || settings?.logo || "assets/logo.png";
            logoBuffer = await getLogoBuffer(logoPath);
        } catch (e) {
            console.warn("Logo loading failed, continuing without logo");
        }

        // Better title formatting including dates with safety checks
        let reportDateTitle = "";
        try {
            if (type === "daily" && filters.date) {
                reportDateTitle = ` – ${new Date(filters.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`;
            } else if (type === "monthly" && filters.month && filters.year) {
                reportDateTitle = ` – ${new Date(parseInt(filters.year), parseInt(filters.month) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
            }
        } catch (e) {
            reportDateTitle = "";
        }

        const performanceTitle = type === "inventory" 
            ? "Stock & Inventory Status Report"
            : (filters.month && filters.year)
                ? `Monthly Performance Statement${reportDateTitle}`
                : `Daily Performance Statement${reportDateTitle}`;

        // Drawer Logic Safety: Ensure we don't crash if summary values are missing
        const expectedAmt = summary?.expectedDrawerAmount ?? 0;
        const verificationAmount = req.query.verificationAmount ? Number(req.query.verificationAmount) : expectedAmt;
        const cashDiscrepancy = (verificationAmount - expectedAmt);

        const diffSign = cashDiscrepancy > 0 ? "+" : (cashDiscrepancy < 0 ? "-" : "");
        const diffValue = `${diffSign}RWF ${Math.abs(cashDiscrepancy).toLocaleString()}`;

        const dateStr = new Date().toISOString().split('T')[0];
        // Clean filename (remove special characters that might break headers)
        const cleanTitle = performanceTitle.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, '_');
        const filename = `${cleanTitle}_${dateStr}.pdf`;

        // Dynamic Branding Logic: Prioritize store branding if the user has a shop
        const hasStore = !!(user.storeName);
        const isSellerReport = hasStore; // Treat as seller report if they have a store name
        
        const companyName = isSellerReport ? user.storeName : (settings?.siteName || "IMPRESSA");
        const companySubtitle = isSellerReport ? (user.storeDescription || "Store Performance Report") : "Platform Performance Report";
        
        // Address formatting
        let displayAddress = settings?.contactAddress || "Gicumbi, Rwanda";
        if (isSellerReport && user.billingAddress) {
            const addr = typeof user.billingAddress === 'string' ? JSON.parse(user.billingAddress) : user.billingAddress;
            if (addr.city || addr.street) {
                displayAddress = `${addr.street ? addr.street + ', ' : ''}${addr.city || ''}`;
            }
        }

        const doc = createImpressaPDF({
            title: performanceTitle,
            companyName: companyName,
            subtitle: companySubtitle,
            companyEmail: isSellerReport ? user.email : (settings?.contactEmail || "support@impressa.com"),
            companyPhone: isSellerReport ? (user.storePhone || user.phone) : (settings?.contactPhone || "+250 788 819 878"),
            companyAddress: displayAddress,
            contentBuilder: (pdfDoc, helpers) => {
                // ... (rest of the builder logic)
                if (aiSummary) {
                    helpers.infoBox("Strategic AI Insights", aiSummary);
                }

                if (type === "inventory") {
                    helpers.metricCards([
                        { label: "Total Products", value: (summary?.totalProducts ?? 0).toString(), color: "#1E3A8A" },
                        { label: "Total Stock Cost", value: `RWF ${(summary?.totalCostValue ?? 0).toLocaleString()}`, color: "#1F2937" },
                        { label: "Inventory Value", value: `RWF ${(summary?.totalRetailValue ?? 0).toLocaleString()}`, color: "#059669" }
                    ]);
                } else {
                    helpers.metricCards([
                        { label: "Total Revenue", value: `RWF ${(summary?.totalRevenue ?? 0).toLocaleString()}`, color: "#1E3A8A" },
                        { label: "Total Expenses", value: `RWF ${(summary?.totalExpenses ?? 0).toLocaleString()}`, color: "#1F2937" },
                        { label: "Drawer Amount", value: `RWF ${(verificationAmount ?? 0).toLocaleString()}`, color: "#3B82F6" },
                        { label: "Difference", value: diffValue, color: cashDiscrepancy === 0 ? "#059669" : (cashDiscrepancy > 0 ? "#059669" : "#B91C1C") }
                    ]);
                }

                if (type === "daily" && filters.shifts && filters.shifts.length > 0) {
                    helpers.section("Shift Activity Overview");
                    helpers.table({
                        columns: [
                            { header: "Shift #", key: "index", width: 50 },
                            { header: "Period (Start - End)", key: "period", width: 170 },
                            { header: "Opening Cash", key: "opening", width: 100 },
                            { header: "Closing Cash", key: "closing", width: 100 },
                            { header: "Status", key: "status", width: 70, align: "center" }
                        ],
                        rows: filters.shifts.map((shift, idx) => ({
                            index: idx + 1,
                            period: `${new Date(shift.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kigali' })} - ${shift.endTime ? new Date(shift.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kigali' }) : "STILL OPEN"}`,
                            opening: `RWF ${(shift.startingDrawerAmount ?? 0).toLocaleString()}`,
                            closing: `RWF ${(shift.actualEndingDrawerAmount || shift.expectedEndingDrawerAmount || 0).toLocaleString()}`,
                            status: shift.status
                        }))
                    });
                }

                if (type === "inventory") {
                    helpers.section("Complete Inventory List");
                    helpers.table({
                        columns: [
                            { header: "Product Name", key: "name", width: 170 },
                            { header: "Category", key: "categoryName", width: 100 },
                            { header: "Stock", key: "stock", width: 50, align: "center" },
                            { header: "Price (RWF)", key: "priceStr", width: 80, align: "right" },
                            { header: "Total Value", key: "valueStr", width: 100, align: "right" }
                        ],
                        rows: (filters.products || []).map(p => ({
                            name: p.name,
                            categoryName: p.categories?.[0]?.name || "N/A",
                            stock: p.stock,
                            priceStr: (p.price ?? 0).toLocaleString(),
                            valueStr: ((p.stock ?? 0) * (p.price ?? 0)).toLocaleString()
                        })),
                        totals: {
                            categoryName: "TOTALS",
                            stock: (summary?.totalStock ?? 0).toLocaleString(),
                            valueStr: `RWF ${(summary?.totalRetailValue ?? 0).toLocaleString()}`
                        }
                    });
                } else {
                    helpers.section("Transaction Detail");
                    const flattenedItems = (orders || []).flatMap(o => (o.items || []).map(i => ({
                        ...i,
                        orderDate: new Date(o.createdAt).toLocaleDateString('en-GB', { timeZone: 'Africa/Kigali' }),
                        paymentMethod: String(o.paymentMethod || "cash").toLowerCase()
                    })));

                    helpers.table({
                        columns: [
                            { header: "Date", key: "orderDate", width: 60 },
                            { header: "Item Name", key: "productName", width: 140 },
                            { header: "Qty", key: "quantity", width: 30, align: "center" },
                            { header: "P/U", key: "price", width: 60, align: "right" },
                            { header: "Cash (RWF)", key: "cashTotal", width: 80, align: "right" },
                            { header: "Momo (RWF)", key: "momoTotal", width: 80, align: "right" }
                        ],
                        rows: flattenedItems.map(i => {
                            const isCash = String(i.paymentMethod || "cash").toLowerCase().includes("cash");
                            return {
                                ...i,
                                price: (i.price ?? 0).toLocaleString(),
                                cashTotal: isCash ? (i.subtotal ?? 0).toLocaleString() : "0",
                                momoTotal: !isCash ? (i.subtotal ?? 0).toLocaleString() : "0"
                            }
                        }),
                        totals: {
                            price: "TOTALS",
                            cashTotal: `RWF ${(summary?.cashRevenue ?? 0).toLocaleString()}`,
                            momoTotal: `RWF ${(summary?.momoRevenue ?? 0).toLocaleString()}`
                        }
                    });
                }

                if (filters.expenses && filters.expenses.length > 0) {
                    helpers.section("Business Expenses Breakdown");
                    helpers.table({
                        columns: [
                            { header: "Description", key: "description", width: 150 },
                            { header: "Type", key: "type", width: 70 },
                            { header: "Category", key: "category", width: 95 },
                            { header: "Date", key: "date", width: 80 },
                            { header: "Amount", key: "amount", width: 100, align: "right" }
                        ],
                        rows: filters.expenses.map(e => ({
                            description: e.description,
                            type: e.amount < 0 ? "CASH IN" : "CASH OUT",
                            category: e.category,
                            date: new Date(e.date).toLocaleDateString('en-GB', { timeZone: 'Africa/Kigali' }),
                            amount: e.amount < 0 ? `RWF (${Math.abs(e.amount).toLocaleString()})` : `RWF ${e.amount.toLocaleString()}`
                        }))
                    });
                }

                if (filters.abonneTransactions && filters.abonneTransactions.length > 0) {
                    helpers.section("Client Abonne (Credit/Debt) Transactions");
                    helpers.table({
                        columns: [
                            { header: "Date", key: "date", width: 55 },
                            { header: "Client", key: "client", width: 100 },
                            { header: "Item/Service", key: "designation", width: 100 },
                            { header: "Qty", key: "quantity", width: 30, align: "center" },
                            { header: "Total", key: "pt", width: 60, align: "right" },
                            { header: "Balance", key: "owed", width: 60, align: "right" },
                            { header: "Status", key: "status", width: 50, align: "center" }
                        ],
                        rows: filters.abonneTransactions.map(tx => ({
                            date: new Date(tx.date).toLocaleDateString('en-GB', { timeZone: 'Africa/Kigali' }),
                            client: tx.client?.name || "Unknown",
                            designation: tx.designation,
                            quantity: tx.quantity,
                            pt: `RWF ${(tx.pt ?? 0).toLocaleString()}`,
                            owed: `RWF ${(tx.debtAmount ?? 0).toLocaleString()}`,
                            status: tx.debtAmount <= 0 ? "PAID" : (tx.debtAmount < tx.pt ? "PARTIAL" : "UNPAID")
                        }))
                    });
                }

                pdfDoc.moveDown(3);
                pdfDoc.save().moveTo(pdfDoc.page.margins.left, pdfDoc.y).lineTo(pdfDoc.page.width - pdfDoc.page.margins.right, pdfDoc.y).strokeColor("#E2E8F0").lineWidth(0.5).stroke().restore();
                pdfDoc.moveDown(1);
                pdfDoc.fillColor("#1E293B").fontSize(10).font("Helvetica-Bold").text(`Prepared by: `, { align: "right", continued: true });
                pdfDoc.font("Helvetica").fillColor("#475569").text(user.name);
            },
            logoPath: logoBuffer
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
        doc.pipe(res);
        doc.end();

    } catch (err) {
        console.error(`${req.query.type} report generation failed:`, err);
        if (!res.headersSent) {
            res.status(500).json({
                message: "Failed to generate report.",
                error: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        }
    }
};
