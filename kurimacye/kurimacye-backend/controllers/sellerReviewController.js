import prisma from "../prisma.js";

/**
 * Get all reviews for the seller's products
 */
export const getSellerProductReviews = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { status, rating, page = 1, limit = 20 } = req.query;

    const where = {
      product: {
        sellerId: sellerId
      }
    };

    if (status && status !== 'all') {
      where.status = status;
    }
    if (rating) {
      where.rating = parseInt(rating);
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        product: { select: { name: true, image: true, slug: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.review.count({ where });

    // Calculate seller review stats
    const stats = {
      total: await prisma.review.count({
        where: { product: { sellerId } }
      }),
      pending: await prisma.review.count({
        where: { product: { sellerId }, status: 'pending' }
      }),
      approved: await prisma.review.count({
        where: { product: { sellerId }, status: 'approved' }
      }),
      rejected: await prisma.review.count({
        where: { product: { sellerId }, status: 'rejected' }
      }),
    };

    // Calculate seller average rating
    const avgRatingResult = await prisma.review.aggregate({
      _avg: { rating: true },
      where: { product: { sellerId }, status: 'approved' }
    });

    stats.averageRating = avgRatingResult._avg.rating ? avgRatingResult._avg.rating.toFixed(1) : 0;

    res.json({
      success: true,
      data: reviews,
      stats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reply to a review on one of the seller's products
 */
export const replyToReview = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params; // Review ID
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Reply text is required" });
    }

    // Verify the review belongs to one of this seller's products
    const review = await prisma.review.findFirst({
      where: {
        id,
        product: {
          sellerId: sellerId
        }
      }
    });

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found or unauthorized" });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        reply: {
          text,
          author: req.user.id,
          authorName: req.user.storeName || req.user.name,
          createdAt: new Date()
        }
      }
    });

    res.json({
      success: true,
      message: "Reply added successfully",
      data: updatedReview
    });
  } catch (error) {
    next(error);
  }
};
