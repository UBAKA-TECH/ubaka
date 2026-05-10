import prisma from "../prisma.js";
import crypto from "crypto";
import logger from "../config/logger.js";

const calculateCartTotals = (cart, discountAmount = 0) => {
  let subtotal = 0;
  cart.items.forEach(item => {
    let price = 0;
    if (item.product) {
      price = item.product.price;
      if (item.variationId && item.product.variations) {
        const variation = item.product.variations.find(v => v.id === item.variationId || v.sku === item.variationId);
        if (variation) price = variation.price;
      }
    }
    subtotal += price * item.quantity;
  });
  
  const tax = 0;
  const shipping = 0;
  const total = Math.max(0, subtotal - discountAmount + tax + shipping);
  
  return { subtotal, discount: discountAmount, tax, shipping, total };
};

/**
 * Create order from cart (checkout)
 */
export const createOrderFromCart = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      billingAddress,
      sameAsShipping = true,
      paymentMethod = "pending",
      shippingMethod,
      couponCode // Pass it explicitly since it's not saved to Cart in Postgres anymore
    } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1) {
      const error = new Error("Shipping address is required");
      error.statusCode = 400;
      return next(error);
    }

    const sessionToken = req.cookies?.cartSession || req.headers["x-cart-session"];
    const userId = req.user?.id;
    
    let cart = null;
    if (userId) {
        cart = await prisma.cart.findUnique({ 
            where: { userId }, 
            include: { items: { include: { product: { include: { variations: true } } } } } 
        });
    }
    if (!cart && sessionToken) {
        const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(sessionToken);
        if (isUUID) {
            cart = await prisma.cart.findUnique({ 
                where: { id: sessionToken }, 
                include: { items: { include: { product: { include: { variations: true } } } } } 
            });
        }
    }

    if (!cart || cart.items.length === 0) {
      const error = new Error("Cart is empty");
      error.statusCode = 400;
      return next(error);
    }

    // 🔒 Atomic transaction: stock validation + decrement + order creation
    const order = await prisma.$transaction(async (tx) => {
      // Validate stock availability (inside transaction for consistency)
      for (const item of cart.items) {
        const product = item.product;
        if (!product) {
          throw Object.assign(new Error(`Product not found`), { statusCode: 404 });
        }

        if (product.visibility !== "public") {
          throw Object.assign(new Error(`Product ${product.name} is not available`), { statusCode: 400 });
        }
      }

      // Validate Coupon
      let discountAmount = 0;
      let validCouponCode = null;
      
      if (couponCode) {
          const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
          if (coupon && coupon.isActive && new Date() <= new Date(coupon.expiresAt)) {
              let tempSubtotal = 0;
              cart.items.forEach(i => {
                  let price = i.product?.price || 0;
                  tempSubtotal += price * i.quantity;
              });
              
              if (!coupon.minSpend || tempSubtotal >= coupon.minSpend) {
                  if (coupon.type === "fixed") {
                      discountAmount = coupon.value;
                  } else if (coupon.type === "percentage") {
                      discountAmount = tempSubtotal * (coupon.value / 100);
                      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) discountAmount = coupon.maxDiscount;
                  }
                  validCouponCode = coupon.code;
              }
          }
      }

      const totals = calculateCartTotals(cart, discountAmount);

      const orderItems = cart.items.map((item) => {
        let price = item.product.price;
        if (item.variationId && item.product.variations) {
            const variation = item.product.variations.find(v => v.id === item.variationId || v.sku === item.variationId);
            if (variation) price = variation.price;
        }
        return {
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.image,
          sku: item.product.sku,
          quantity: item.quantity,
          price: price,
          subtotal: price * item.quantity,
          customizations: item.customizations || {},
        };
      });

      const publicId = crypto.randomBytes(4).toString("hex").toUpperCase();

      const orderData = {
        publicId,
        customerId: userId || null,
        guestInfo: userId ? null : { name: shippingAddress.fullName, email: shippingAddress.email, phone: shippingAddress.phone },
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        
        subtotal: totals.subtotal,
        shippingCost: totals.shipping || 0,
        tax: totals.tax || 0,
        discount: totals.discount || 0,
        grandTotal: totals.total,
        
        paymentMethod,
        status: "pending",
        
        items: {
            create: orderItems
        }
      };

      const createdOrder = await tx.order.create({
        data: orderData,
        include: { items: true }
      });

      // Update coupon usage inside transaction
      if (validCouponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: validCouponCode } });
        if (coupon) {
            const usedByList = Array.isArray(coupon.usedBy) ? [...coupon.usedBy] : [];
            usedByList.push({
                user: userId || null,
                email: req.user?.email || shippingAddress.email,
                orderId: createdOrder.id
            });
            await tx.coupon.update({
                where: { id: coupon.id },
                data: {
                    usageCount: { increment: 1 },
                    usedBy: usedByList
                }
            });
        }
      }

      // Atomic stock decrement (uses WHERE to prevent overselling)
      for (const item of cart.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: {
              stock: { decrement: item.quantity },
              salesCount: { increment: item.quantity }
          }
        });
        if (updated.count === 0) {
          throw Object.assign(
            new Error(`Insufficient stock for ${item.product.name}. Please refresh and try again.`),
            { statusCode: 400 }
          );
        }
      }

      // Clear cart inside transaction
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrder;
    }); // End $transaction

    logger.info({ orderId: order.id, publicId }, "Order created from cart");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order.id,
        publicId: order.publicId,
        total: order.grandTotal,
        status: order.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate shipping cost (placeholder - implement actual logic later)
 */
export const calculateShipping = async (req, res, next) => {
  try {
    const { address, items } = req.body;
    if (!address || !address.country) {
      return res.status(400).json({ message: "Address with country is required" });
    }

    const zones = await prisma.shippingZone.findMany({ where: { isActive: true } });
    
    // Find matching zone
    const matchedZone = zones.find(zone => {
      const regions = Array.isArray(zone.regions) ? zone.regions : [];
      return regions.some(r => 
        r.country === "*" || r.country === address.country ||
        (r.country === address.country && (r.state === "*" || r.state === address.state))
      );
    }) || zones.find(z => z.name === "Rest of World" || z.name === "Default");

    if (!matchedZone) {
      return res.status(404).json({ message: "No shipping zone found for this address" });
    }

    const methods = Array.isArray(matchedZone.methods) ? matchedZone.methods : [];
    // For now, take the first method or a specific one if provided
    const method = methods[0] || { name: "Standard Shipping", cost: 0, type: "flat_rate" };

    res.json({
      success: true,
      data: {
        zoneName: matchedZone.name,
        methodName: method.name,
        cost: method.cost || 0,
        currency: "RWF",
        estimatedDays: matchedZone.name.includes("Rwanda") ? "2-3" : "7-14",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate tax (placeholder - implement actual logic later)
 */
export const calculateTax = async (req, res, next) => {
  try {
    const { subtotal, address } = req.body;
    if (!address) return res.status(400).json({ message: "Address is required" });

    // Fetch all applicable tax rates
    const rates = await prisma.taxRate.findMany({
      where: {
        OR: [
          { province: "*" },
          { province: address.state || address.province || "*" }
        ]
      },
      orderBy: { priority: "asc" }
    });

    let totalTaxRate = 0;
    rates.forEach(r => {
      // Basic matching logic (can be expanded for district/sector)
      if (r.province === "*" || r.province === (address.state || address.province)) {
        totalTaxRate += r.rate;
      }
    });

    const taxAmount = subtotal * (totalTaxRate / 100);

    res.json({
      success: true,
      data: {
        taxRate: totalTaxRate,
        taxAmount,
        currency: "RWF",
      },
    });
  } catch (error) {
    next(error);
  }
};
