import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { formatRwf } from "../utils/currency";
import assetUrl from "../utils/assetUrl";

// Custom inline SVG icons to replace react-icons/fa (reduces bundle size)
const HeartIconSolid = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className || "w-4 h-4"} aria-hidden="true">
    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001Z" />
  </svg>
);

const HeartIconOutline = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className || "w-4 h-4"} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={className || "w-4 h-4"} aria-hidden="true">
    <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.784 1.4 8.168L12 18.897l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
  </svg>
);

const StoreIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className || "w-3 h-3"} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V21m-9-9l9-9 9 9m-16.5 0h15" />
  </svg>
);

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
          {isWishlisted ? <HeartIconSolid className="text-terracotta-500" /> : <HeartIconOutline />}
        </button>
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-sm sm:text-base text-charcoal-800 dark:text-cream-100 line-clamp-2 mb-1 group-hover:text-terracotta-500 dark:group-hover:text-terracotta-400 transition">{product.name}</h3>
        </Link>
        {product.seller && (
          <Link to={`/store/${product.seller.storeSlug || product.seller.id}`} className="text-[10px] sm:text-xs text-terracotta-700 hover:text-terracotta-800 dark:text-terracotta-400 font-medium mb-1.5 flex items-center gap-1 w-fit line-clamp-1 mt-auto py-1 pr-1">
            <StoreIcon className="w-3 h-3 shrink-0"/> Sold by: {product.seller.storeName || product.seller.name}
          </Link>
        )}
        <div className="flex items-center gap-1 mb-2 mt-auto">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className={`${i < getRating(product.averageRating)
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
