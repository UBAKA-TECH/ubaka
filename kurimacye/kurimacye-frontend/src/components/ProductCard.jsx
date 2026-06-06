import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaStar, FaStore } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { formatRwf } from "../utils/currency";
import assetUrl from "../utils/assetUrl";

const getRating = (rating) => {
  if (!rating) return 0;
  if (Array.isArray(rating)) {
    if (rating.length === 0) return 0;
    const sum = rating.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / rating.length;
  }
  return Number(rating);
};

export default function ProductCard({ product }) {
  const { ids, toggle } = useWishlist();
  const isWishlisted = ids.includes(product.id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <div className="group bg-white dark:bg-charcoal-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-cream-300 dark:border-charcoal-600 flex flex-col h-full">
      <div className="relative aspect-square bg-cream-100 dark:bg-charcoal-900 overflow-hidden">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          {(product.image || product.images?.[0]) ? (
            <img
              src={assetUrl(product.image || product.images?.[0])}
              alt={product.name}
              width="300"
              height="300"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal-300 dark:text-charcoal-500">No Image</div>
          )}
        </Link>
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-charcoal-700 transition text-charcoal-400 hover:text-terracotta-500"
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          {isWishlisted ? <FaHeart className="text-terracotta-500" /> : <FaRegHeart />}
        </button>
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-sm sm:text-base text-charcoal-800 dark:text-cream-100 line-clamp-2 mb-1 group-hover:text-terracotta-500 dark:group-hover:text-terracotta-400 transition">{product.name}</h3>
        </Link>
        {product.seller && (
          <Link to={`/store/${product.seller.storeSlug || product.seller.id}`} className="text-[10px] sm:text-xs text-terracotta-700 hover:text-terracotta-800 dark:text-terracotta-400 font-medium mb-1.5 flex items-center gap-1 w-fit line-clamp-1 mt-auto">
            <FaStore className="text-[10px] shrink-0"/> Sold by: {product.seller.storeName || product.seller.name}
          </Link>
        )}
        <div className="flex items-center gap-1 mb-2 mt-auto">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={`${i < getRating(product.averageRating)
              ? "text-sand-400" : "text-charcoal-200 dark:text-charcoal-700"} text-[10px] sm:text-xs`} />
          ))}
          <span className="text-[10px] sm:text-xs text-charcoal-600 dark:text-charcoal-300 ml-1">({getRating(product.averageRating).toFixed(1)})</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {product.flashSaleInfo ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold text-terracotta-500">{formatRwf(product.flashSaleInfo.flashSalePrice)}</span>
                <span className="text-xs text-charcoal-600 dark:text-charcoal-300 line-through">{formatRwf(product.price)}</span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-terracotta-800 bg-terracotta-100 px-1.5 py-0.5 rounded w-fit mt-0.5">Flash Sale</span>
            </div>
          ) : (
            <span className="text-lg sm:text-xl font-bold text-charcoal-900 dark:text-white">{formatRwf(product.price)}</span>
          )}
          <Link
            to={`/product/${product.id}`}
            className="text-terracotta-700 dark:text-terracotta-400 hover:text-terracotta-800 dark:hover:text-terracotta-300 text-[11px] sm:text-sm font-semibold mt-1 inline-block"
            aria-label={`View details of ${product.name}`}
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
