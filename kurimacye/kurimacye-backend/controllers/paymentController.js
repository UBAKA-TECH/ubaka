import prisma from "../prisma.js";
import { requestToPay, getTransactionStatus } from "../services/momoService.js";
import { createInvoice, getInvoiceStatus } from "../services/iremboPayService.js";
import { recordTransaction } from "./financeController.js";
import rraEbmService from "../services/rraEbmService.js";

// Helper to ensure default accounts exist
const ensureAccount = async (name, type, code) => {
  let account = await prisma.account.findUnique({ where: { code } });
  if (!account) {
    account = await prisma.account.create({ data: { name, type, code } });
  }
  return account.id;
};

// Process Payment (Initiate)
export const processPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod, phone } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    if (paymentMethod === "mtn_momo") {
      if (!phone) {
        const error = new Error("Phone number is required for Mobile Money");
        error.statusCode = 400;
        throw error;
      }

      // Initiate MoMo Payment
      // Instant Success for POS (Simulation Mode)
      if (order.orderType === "pos") {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentMethod: "mtn_momo",
            paymentStatus: "completed",
            paidAt: new Date()
          }
        });

        try {
          await rraEbmService.generateEbmReceiptsForOrder(orderId);
        } catch (ebmErr) {
          console.error("Failed to generate POS MoMo EBM receipts:", ebmErr);
        }

        return res.json({
          success: true,
          data: {
            status: "completed",
            message: "MoMo Payment Recorded Successfully (POS Instant Success)",
            transactionId: `POS-MOMO-${Date.now()}`
          },
        });
      }

      // Normal behavior for online orders
      const result = await requestToPay({
        amount: order.grandTotal,
        phone,
        orderId: order.publicId,
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentMethod: "mtn_momo",
          transactionId: result.referenceId,
          paymentStatus: "pending"
        }
      });

      res.json({
        success: true,
        data: {
          status: "pending",
          message: "Payment request sent to your phone. Please approve it.",
          transactionId: result.referenceId,
        },
      });
    } else if (paymentMethod === "irembo_pay") {
      // Initiate IremboPay Payment
      // Instant Success for POS (Simulation Mode)
      if (order.orderType === "pos") {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentMethod: "irembo_pay",
            paymentStatus: "completed",
            paidAt: new Date()
          }
        });

        try {
          await rraEbmService.generateEbmReceiptsForOrder(orderId);
        } catch (ebmErr) {
          console.error("Failed to generate POS IremboPay EBM receipts:", ebmErr);
        }

        return res.json({
          success: true,
          data: {
            status: "completed",
            message: "IremboPay Payment Recorded Successfully (POS Instant Success)",
            transactionId: `POS-IREMBO-${Date.now()}`
          },
        });
      }

      // Normal behavior for online orders
      const result = await createInvoice({
        amount: order.grandTotal,
        orderId: order.publicId,
        description: `Payment for Order #${order.publicId} via IremboPay`,
        customer: {
          name: order.guestInfo?.name || order.customerId || "Customer",
          email: order.guestInfo?.email || "",
          phone: order.guestInfo?.phone || "",
        }
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentMethod: "irembo_pay",
          transactionId: result.invoiceNumber,
          paymentStatus: "pending"
        }
      });

      res.json({
        success: true,
        data: {
          status: "pending",
          message: "IremboPay invoice created. Please complete payment.",
          transactionId: result.invoiceNumber,
        },
      });
    } else {
      // Handle other methods (e.g., Cash, Stripe placeholder)
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentMethod: paymentMethod || "cash",
          paymentStatus: "pending"
        }
      });

      res.json({ success: true, data: { status: "pending", message: "Order placed successfully" } });
    }
  } catch (error) {
    next(error);
  }
};

// Check Payment Status (Polling Endpoint)
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    console.log(`🔍 [checkPaymentStatus] Received request for orderId: "${orderId}"`);
    
    const order = await prisma.order.findUnique({ 
        where: { id: orderId },
        include: { items: true }
    });

    if (!order) {
      console.log(`❌ [checkPaymentStatus] Order with id "${orderId}" NOT found in database!`);
      return res.status(404).json({ message: "Order not found" });
    }
    console.log(`✅ [checkPaymentStatus] Order found in database: publicId=${order.publicId}, current paymentStatus=${order.paymentStatus}`);

    if (order.paymentMethod === "mtn_momo" && order.transactionId) {
      let statusData;
      try {
        statusData = await getTransactionStatus(order.transactionId);

        // --- SANDBOX AUTO-APPROVAL (FOR TESTING) ---
        if (process.env.MOMO_ENV === 'sandbox' && (statusData.status === 'PENDING' || !statusData.status)) {
          console.log("🧪 SANDBOX MODE: Simulating Payment Success...");
          statusData.status = 'SUCCESSFUL'; // Force success for testing
        }
        // -------------------------------------------

      } catch (err) {
        // If resource not found (pending creation or propagation), treat as pending
        const msg = err.message || "";
        if (msg.includes("404") || msg.includes("RESOURCE_NOT_FOUND") || msg.includes("Failed to check")) {
          // --- SANDBOX SIMULATION ON 404 ---
          if (process.env.MOMO_ENV === 'sandbox') {
            console.log(`🧪 SANDBOX MODE: Transaction ${order.transactionId} not found (404) -> SIMULATING SUCCESS`);
            statusData = { status: 'SUCCESSFUL' };
          } else {
            // Production behavior: keep waiting
            console.log(`⚠️ Transaction ${order.transactionId} not found yet (404). Continuing poll...`);
            return res.json({ success: true, status: "pending", systemMessage: "Transaction propagating..." });
          }
          // ---------------------------------
        } else {
          throw err; // Real error
        }
      }

      if (statusData.status === "SUCCESSFUL" && order.paymentStatus !== "completed") {
        const newStatus = order.channel === 'website' ? 'processing' : 'delivered';
        
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: "completed",
                paidAt: new Date(),
                status: newStatus
            }
        });

        try {
          await rraEbmService.generateEbmReceiptsForOrder(orderId);
        } catch (ebmErr) {
          console.error("Failed to generate EBM receipts during checkPaymentStatus:", ebmErr);
        }

        // Record Financial Transaction
        const cashAccountId = await ensureAccount("Cash on Hand", "Asset", "1000");
        const salesAccountId = await ensureAccount("Sales Revenue", "Revenue", "4000");

        // Generate description with product names
        const productNames = order.items.map(i => i.productName).join(", ");
        const description = `POS Sale (MoMo): ${productNames.length > 50 ? productNames.substring(0, 47) + "..." : productNames}`;

        await recordTransaction({
          date: new Date(),
          description: description,
          reference: order.publicId,
          type: "Sales",
          entries: [
            { account: cashAccountId, debit: order.grandTotal },
            { account: salesAccountId, credit: order.grandTotal }
          ],
          createdBy: order.customerId || null 
        });

      } else if (statusData.status === "FAILED") {
        await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: "failed" }
        });
      }

      const latestOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  seller: true
                }
              }
            }
          }
        }
      });
      return res.json({
        success: true,
        status: latestOrder.paymentStatus,
        momoStatus: statusData.status,
        order: latestOrder
      });
    }

    if (order.paymentMethod === "irembo_pay" && order.transactionId) {
      let statusData;
      try {
        statusData = await getInvoiceStatus(order.transactionId);
      } catch (err) {
        console.error("Failed to check IremboPay status:", err);
        return res.json({ success: true, status: "pending", systemMessage: "Error fetching IremboPay status..." });
      }

      if (statusData.status === "SUCCESSFUL" && order.paymentStatus !== "completed") {
        const newStatus = order.channel === 'website' ? 'processing' : 'delivered';
        
        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus: "completed",
                paidAt: new Date(),
                status: newStatus
            }
        });

        try {
          await rraEbmService.generateEbmReceiptsForOrder(orderId);
        } catch (ebmErr) {
          console.error("Failed to generate EBM receipts during checkPaymentStatus (IremboPay):", ebmErr);
        }

        // Record Financial Transaction
        const cashAccountId = await ensureAccount("Cash on Hand", "Asset", "1000");
        const salesAccountId = await ensureAccount("Sales Revenue", "Revenue", "4000");

        // Generate description with product names
        const productNames = order.items.map(i => i.productName).join(", ");
        const description = `POS Sale (IremboPay): ${productNames.length > 50 ? productNames.substring(0, 47) + "..." : productNames}`;

        await recordTransaction({
          date: new Date(),
          description: description,
          reference: order.publicId,
          type: "Sales",
          entries: [
            { account: cashAccountId, debit: order.grandTotal },
            { account: salesAccountId, credit: order.grandTotal }
          ],
          createdBy: order.customerId || null 
        });

      } else if (statusData.status === "FAILED") {
        await prisma.order.update({
            where: { id: orderId },
            data: { paymentStatus: "failed" }
        });
      }

      const latestOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  seller: true
                }
              }
            }
          }
        }
      });
      return res.json({
        success: true,
        status: latestOrder.paymentStatus,
        iremboStatus: statusData.status,
        order: latestOrder
      });
    }

    res.json({ success: true, status: order.paymentStatus });
  } catch (error) {
    next(error);
  }
};

// Webhook Handler
export const handleMomoWebhook = async (req, res) => {
  try {
    const { validateWebhook } = await import("../services/momoService.js");
    if (!validateWebhook(req)) {
      return res.status(401).end();
    }

    const { resourceId, status } = req.body; 

    const order = await prisma.order.findFirst({
        where: { transactionId: resourceId }
    });

    if (order) {
      if (status === "SUCCESSFUL") {
          await prisma.order.update({
              where: { id: order.id },
              data: {
                  paymentStatus: "completed",
                  paidAt: new Date(),
                  status: "processing"
              }
          });

          try {
            await rraEbmService.generateEbmReceiptsForOrder(order.id);
          } catch (ebmErr) {
            console.error("Failed to generate EBM receipts during handleMomoWebhook:", ebmErr);
          }
      } else if (status === "FAILED") {
          await prisma.order.update({
              where: { id: order.id },
              data: { paymentStatus: "failed" }
          });
      }
    }

    res.status(200).end();
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).end();
  }
};

// IremboPay Webhook Handler
export const handleIremboPayWebhook = async (req, res) => {
  try {
    const { validateIremboWebhook } = await import("../services/iremboPayService.js");
    if (!validateIremboWebhook(req)) {
      return res.status(401).end();
    }

    const { invoiceNumber, status } = req.body; 

    const order = await prisma.order.findFirst({
        where: { transactionId: invoiceNumber }
    });

    if (order) {
      if (status === "SUCCESSFUL") {
          await prisma.order.update({
              where: { id: order.id },
              data: {
                  paymentStatus: "completed",
                  paidAt: new Date(),
                  status: "processing"
              }
          });

          try {
            await rraEbmService.generateEbmReceiptsForOrder(order.id);
          } catch (ebmErr) {
            console.error("Failed to generate EBM receipts during handleIremboPayWebhook:", ebmErr);
          }
      } else if (status === "FAILED") {
          await prisma.order.update({
              where: { id: order.id },
              data: { paymentStatus: "failed" }
          });
      }
    }

    res.status(200).end();
  } catch (error) {
    console.error("IremboPay Webhook error:", error);
    res.status(500).end();
  }
};

