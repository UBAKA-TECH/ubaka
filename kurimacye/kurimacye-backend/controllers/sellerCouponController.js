import prisma from "../prisma.js";

/**
 * Get all coupons belonging to the logged-in seller
 */
export const getSellerCoupons = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { isActive } = req.query;
    const filter = { sellerId };
    
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const coupons = await prisma.coupon.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single coupon by ID (ensuring it belongs to the logged-in seller)
 */
export const getSellerCouponById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    
    const coupon = await prisma.coupon.findFirst({ 
      where: { id, sellerId } 
    });

    if (!coupon) {
      const error = new Error("Promo code not found or unauthorized");
      error.statusCode = 404;
      return next(error);
    }

    res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a coupon associated with the logged-in seller
 */
export const createSellerCoupon = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const data = { ...req.body, sellerId };

    if (data.validFrom) data.validFrom = new Date(data.validFrom);
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    if (data.value) data.value = Number(data.value);
    if (data.minSpend) data.minSpend = Number(data.minSpend);
    if (data.maxDiscount) data.maxDiscount = Number(data.maxDiscount);
    if (data.usageLimit) data.usageLimit = Number(data.usageLimit);
    if (data.perUserLimit) data.perUserLimit = Number(data.perUserLimit);
    
    delete data.applicableCategories;
    delete data.applicableProducts;

    const coupon = await prisma.coupon.create({ data });

    res.status(201).json({
      success: true,
      message: "Promo code created successfully",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a coupon (ensuring it belongs to the logged-in seller)
 */
export const updateSellerCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;
    
    // First verify owner
    const existing = await prisma.coupon.findFirst({
      where: { id, sellerId }
    });

    if (!existing) {
      const error = new Error("Promo code not found or unauthorized");
      error.statusCode = 404;
      return next(error);
    }

    const data = { ...req.body };
    if (data.validFrom) data.validFrom = new Date(data.validFrom);
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    if (data.value) data.value = Number(data.value);
    if (data.minSpend) data.minSpend = Number(data.minSpend);
    if (data.maxDiscount) data.maxDiscount = Number(data.maxDiscount);
    if (data.usageLimit) data.usageLimit = Number(data.usageLimit);
    if (data.perUserLimit) data.perUserLimit = Number(data.perUserLimit);

    delete data.applicableCategories;
    delete data.applicableProducts;
    delete data.sellerId; // Prevent changing ownership

    const coupon = await prisma.coupon.update({
      where: { id },
      data
    });

    res.json({
      success: true,
      message: "Promo code updated successfully",
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a coupon (ensuring it belongs to the logged-in seller)
 */
export const deleteSellerCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    // Verify ownership
    const existing = await prisma.coupon.findFirst({
      where: { id, sellerId }
    });

    if (!existing) {
      const error = new Error("Promo code not found or unauthorized");
      error.statusCode = 404;
      return next(error);
    }

    await prisma.coupon.delete({ where: { id } });

    res.json({
      success: true,
      message: "Promo code deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get coupon usage stats for the seller
 */
export const getSellerCouponStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const coupon = await prisma.coupon.findFirst({
      where: { id, sellerId }
    });

    if (!coupon) {
      const error = new Error("Promo code not found or unauthorized");
      error.statusCode = 404;
      return next(error);
    }

    const uniqueUsers = Array.isArray(coupon.usedBy) ? coupon.usedBy.length : 0;

    const stats = {
      code: coupon.code,
      usageCount: coupon.usageCount,
      usageLimit: coupon.usageLimit,
      remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.usageCount : "unlimited",
      uniqueUsers,
      isActive: coupon.isActive,
      isExpired: new Date() > new Date(coupon.expiresAt),
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
