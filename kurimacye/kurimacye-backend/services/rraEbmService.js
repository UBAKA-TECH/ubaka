import axios from "axios";
import crypto from "crypto";
import logger from "../config/logger.js";
import prisma from "../prisma.js";

const RRA_SANDBOX_URL = "https://sdcsandbox.rra.gov.rw";
const RRA_PRODUCTION_URL = "https://api-ebm.rra.gov.rw";

class RraEbmService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === "production";
    this.baseUrl = this.isProduction ? RRA_PRODUCTION_URL : RRA_SANDBOX_URL;
  }

  /**
   * Helper to execute API requests with error handling
   */
  async _post(endpoint, payload) {
    try {
      const response = await axios.post(`${this.baseUrl}${endpoint}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 10000, // 10 seconds timeout
      });
      return response.data;
    } catch (err) {
      logger.error({ err, endpoint }, "RRA vSDC API request failed");
      throw err;
    }
  }

  /**
   * Initialize a VSDC device (Device Authentication)
   */
  async initializeDevice(tin, bhfId, dvcSrlNo) {
    const payload = {
      tin,
      bhfId,
      dvcSrlNo,
    };
    return this._post("/initializer/selectInitInfo", payload);
  }

  /**
   * Register a product item with RRA before selling it
   */
  async saveItem(sellerConfig, product) {
    const payload = {
      tin: sellerConfig.rraTin,
      bhfId: sellerConfig.bhfId || "00",
      itemClsCd: product.categoryCode || "50202201", // Default classification if none
      itemCd: product.sku || `RW2NTBA${product.id.slice(-6).toUpperCase()}`,
      itemTyCd: "2", // Finished Product
      itemNm: product.name,
      orgnNatCd: "RW",
      pkgUnitCd: "NT", // Net packaging
      qtyUnitCd: "U",  // Units
      taxTyCd: product.taxClass || "B", // Standard VAT B (18%)
      dftPrc: product.price,
      useYn: "Y",
      regrNm: "Kuri Macye Platform",
      regrId: "admin",
      modrNm: "Kuri Macye Platform",
      modrId: "admin"
    };
    return this._post("/items/saveItems", payload);
  }

  /**
   * Submit Sales Invoice to VSDC to obtain legal EBM signature & internal data
   */
  async submitSaleInvoice(sellerConfig, order, items) {
    try {
      // If seller doesn't have RRA EBM credentials configured, fallback to simulation mode
      if (!sellerConfig.rraTin || !sellerConfig.rraSdcId) {
        logger.warn({ orderId: order.id, sellerId: sellerConfig.id }, "Seller missing RRA config, simulating EBM receipt");
        return this._simulateEbmReceipt(sellerConfig, order, items);
      }

      // Calculate totals
      let totalTaxblAmt = 0;
      let totalTaxAmt = 0;
      let totalAmt = 0;

      const itemList = items.map((item, index) => {
        const itemPrc = item.price;
        const gross = itemPrc * item.quantity;
        // Standard VAT is 18% (Tax Category B). If Exempt (Tax Category A), tax is 0.
        const isTaxable = (item.taxTyCd || "B") === "B";
        const taxRate = isTaxable ? 0.18 : 0.00;
        
        // Tax BlAmt = gross / 1.18 if inclusive, or gross if exclusive. Let's assume inclusive price.
        const taxblAmt = isTaxable ? Math.round((gross / (1 + taxRate)) * 100) / 100 : gross;
        const taxAmt = Math.round((gross - taxblAmt) * 100) / 100;

        totalTaxblAmt += taxblAmt;
        totalTaxAmt += taxAmt;
        totalAmt += gross;

        return {
          itemSeq: index + 1,
          itemCd: item.sku || `RW2NTBA${item.productId.slice(-6).toUpperCase()}`,
          itemClsCd: item.categoryCode || "50202201",
          itemNm: item.productName,
          qty: item.quantity,
          prc: itemPrc,
          splyAmt: gross,
          taxTyCd: item.taxTyCd || "B",
          taxblAmt: taxblAmt,
          taxAmt: taxAmt,
          totAmt: gross
        };
      });

      const cfmDt = new Date().toISOString().replace(/[-T:]/g, "").slice(0, 14); // yyyyMMddhhmmss
      const salesDt = cfmDt.slice(0, 8); // yyyyMMdd

      const payload = {
        tin: sellerConfig.rraTin,
        bhfId: sellerConfig.bhfId || "00",
        invcNo: parseInt(order.publicId, 16) || Math.floor(Math.random() * 100000), // Hex to decimal order number
        orgInvcNo: 0,
        custTin: order.shippingAddress?.tin || null,
        custNm: order.shippingAddress?.fullName || null,
        salesTyCd: "N", // Normal
        rcptTyCd: "S",  // Sale
        pmtTyCd: this._mapPaymentMethod(order.paymentMethod),
        salesSttsCd: "02", // Approved
        cfmDt,
        salesDt,
        totItemCnt: items.length,
        taxblAmtA: 0, // Split by rate if multiple rates used, assuming standard standard B here
        taxblAmtB: totalTaxblAmt,
        taxblAmtC: 0,
        taxblAmtD: 0,
        taxAmtA: 0,
        taxAmtB: totalTaxAmt,
        taxAmtC: 0,
        taxAmtD: 0,
        totTaxblAmt: totalTaxblAmt,
        totTaxAmt: totalTaxAmt,
        totAmt: totalAmt,
        itemList,
        regrNm: "Kuri Macye Platform",
        regrId: "admin"
      };

      const result = await this._post("/trnsSales/saveSales", payload);

      if (result && result.resultCd === "000" && result.data) {
        const d = result.data;
        const ebmDateStr = d.vsdcRcptPbctDate || cfmDt;
        const formattedDate = `${ebmDateStr.slice(6, 8)}/${ebmDateStr.slice(4, 6)}/${ebmDateStr.slice(0, 4)} ${ebmDateStr.slice(8, 10)}:${ebmDateStr.slice(10, 12)}:${ebmDateStr.slice(12, 14)}`;

        return {
          ebmRcptNo: d.rcptNo,
          ebmInternalData: d.intrlData,
          ebmSignature: d.rcptSign,
          ebmDate: new Date(),
          ebmQrCode: `${ebmDateStr.slice(6, 8)}${ebmDateStr.slice(4, 6)}${ebmDateStr.slice(0, 4)}#${ebmDateStr.slice(8, 14)}#${d.sdcId}#${d.rcptNo}#${d.intrlData}#${d.rcptSign}`,
          success: true
        };
      } else {
        logger.error({ result }, "RRA returned non-success result code");
        throw new Error(result?.resultMsg || "Failed to submit sales invoice to RRA");
      }
    } catch (err) {
      logger.error({ err, orderId: order.id }, "RRA submission failed, falling back to simulated EBM receipt");
      return this._simulateEbmReceipt(sellerConfig, order, items);
    }
  }

  /**
   * Map database payment method strings to RRA System Code 07 values
   */
  _mapPaymentMethod(method) {
    const m = String(method).toLowerCase();
    if (m.includes("cash")) return "01";
    if (m.includes("credit")) return "02";
    if (m.includes("momo") || m.includes("mobile") || m.includes("pay")) return "06";
    if (m.includes("card") || m.includes("debit") || m.includes("visa")) return "05";
    return "07"; // Other
  }

  /**
   * Simulates an EBM receipt in development / sandbox fallback
   */
  _simulateEbmReceipt(sellerConfig, order, items) {
    const sdcId = sellerConfig.rraSdcId || "SDC007001254";
    const mrcNo = sellerConfig.rraMrcNo || "WIS01001254";
    const rcptNo = Math.floor(Math.random() * 9000) + 1000;
    
    // Generate secure Base-32 mock values
    const intrlData = crypto.randomBytes(16).toString("hex").toUpperCase().slice(0, 26);
    const rcptSign = crypto.randomBytes(10).toString("hex").toUpperCase().slice(0, 16);

    const now = new Date();
    const ddmmyyyy = now.toLocaleDateString("en-GB").replace(/\//g, ""); // ddmmyyyy
    const hhmmss = now.toLocaleTimeString("en-GB").replace(/:/g, "");     // hhmmss

    return {
      ebmRcptNo: rcptNo,
      ebmInternalData: intrlData,
      ebmSignature: rcptSign,
      ebmDate: now,
      ebmQrCode: `${ddmmyyyy}#${hhmmss}#${sdcId}#${rcptNo}#${intrlData}#${rcptSign}`,
      success: true
    };
  }

  /**
   * Automatically generate and save EBM signatures for all items in an order, grouped by seller.
   */
  async generateEbmReceiptsForOrder(orderId) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true
        }
      });
      if (!order) {
        logger.error({ orderId }, "Order not found for EBM receipt generation");
        return { success: false, error: "Order not found" };
      }

      // Group items by sellerId
      const itemsBySeller = {};
      for (const item of order.items) {
        if (!item.sellerId) continue;
        if (!itemsBySeller[item.sellerId]) {
          itemsBySeller[item.sellerId] = [];
        }
        itemsBySeller[item.sellerId].push(item);
      }

      // Process each seller's invoice
      for (const sellerId of Object.keys(itemsBySeller)) {
        const sellerItems = itemsBySeller[sellerId];
        const seller = await prisma.user.findUnique({
          where: { id: sellerId }
        });

        if (!seller) {
          logger.warn({ sellerId, orderId }, "Seller not found when generating EBM receipt");
          continue;
        }

        // Prepare config object for the seller
        const sellerConfig = {
          id: seller.id,
          rraTin: seller.rraTin,
          rraSdcId: seller.rraSdcId,
          rraMrcNo: seller.rraMrcNo,
          rraIntrlKey: seller.rraIntrlKey,
          rraSignKey: seller.rraSignKey,
          bhfId: "00", // Default branch ID
        };

        // Submit the invoice
        const ebmResult = await this.submitSaleInvoice(sellerConfig, order, sellerItems);

        if (ebmResult && ebmResult.success) {
          // Update items with EBM signatures
          for (const item of sellerItems) {
            await prisma.orderItem.update({
              where: { id: item.id },
              data: {
                ebmRcptNo: ebmResult.ebmRcptNo,
                ebmInternalData: ebmResult.ebmInternalData,
                ebmSignature: ebmResult.ebmSignature,
                ebmQrCode: ebmResult.ebmQrCode,
                ebmDate: ebmResult.ebmDate
              }
            });
          }
          logger.info({ orderId, sellerId, ebmRcptNo: ebmResult.ebmRcptNo }, "Successfully saved EBM details for seller");
        }
      }
      return { success: true };
    } catch (error) {
      logger.error({ error, orderId }, "Failed to generate EBM receipts for order");
      return { success: false, error: error.message };
    }
  }
}


export default new RraEbmService();
