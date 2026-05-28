import prisma from "../prisma.js";

/**
 * ❤️ Get user's wishlist
 */
export const getWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        let wishlist = await prisma.wishlist.findUnique({
            where: { userId }
        });

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId, productIds: [] }
            });
        }

        // Fetch actual product details for the IDs
        const products = await prisma.product.findMany({
            where: {
                id: { in: wishlist.productIds },
                visibility: 'public'
            },
            select: {
                id: true,
                name: true,
                price: true,
                image: true,
                slug: true,
                stock: true
            }
        });

        res.json({
            success: true,
            data: products,
            productIds: wishlist.productIds
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ❤️ Toggle item in wishlist
 */
export const toggleWishlistItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        let wishlist = await prisma.wishlist.findUnique({
            where: { userId }
        });

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId, productIds: [] }
            });
        }

        let updatedProductIds = [...wishlist.productIds];
        const index = updatedProductIds.indexOf(productId);

        if (index > -1) {
            // Remove
            updatedProductIds.splice(index, 1);
        } else {
            // Add (check if product exists first)
            const product = await prisma.product.findUnique({ where: { id: productId } });
            if (!product) return res.status(404).json({ message: "Product not found" });
            
            updatedProductIds.push(productId);
        }

        const updatedWishlist = await prisma.wishlist.update({
            where: { userId },
            data: { productIds: updatedProductIds }
        });

        res.json({
            success: true,
            message: index > -1 ? "Removed from wishlist" : "Added to wishlist",
            data: updatedWishlist.productIds
        });
    } catch (error) {
        next(error);
    }
};

/**
 * ❤️ Sync localStorage wishlist with server on login
 */
export const syncWishlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productIds } = req.body; // Array from localStorage

        if (!Array.isArray(productIds)) {
            return res.status(400).json({ message: "Invalid productIds format" });
        }

        let wishlist = await prisma.wishlist.findUnique({
            where: { userId }
        });

        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId, productIds: [] }
            });
        }

        // Merge and deduplicate
        const mergedIds = Array.from(new Set([...wishlist.productIds, ...productIds]));

        const updatedWishlist = await prisma.wishlist.update({
            where: { userId },
            data: { productIds: mergedIds }
        });

        res.json({
            success: true,
            message: "Wishlist synced successfully",
            data: updatedWishlist.productIds
        });
    } catch (error) {
        next(error);
    }
};
