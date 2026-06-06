import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaPhone, FaBox, FaCalendarAlt, FaCheckCircle, FaStar, FaHeart, FaRegHeart, FaShoppingCart, FaStore } from "react-icons/fa";
import api from "../utils/axiosInstance";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import { formatRwf } from "../utils/currency";
import assetUrl from "../utils/assetUrl";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useTranslation } from "react-i18next";
import { useToast } from "../context/ToastContext";

const getRating = (rating) => {
  if (!rating) return 0;
  if (Array.isArray(rating)) {
    if (rating.length === 0) return 0;
    const sum = rating.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / rating.length;
  }
  return Number(rating);
};

const WishlistButton = ({ product }) => {
  const { ids, toggle } = useWishlist();
  const isWishlisted = ids.includes(product.id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <button
      onClick={toggleWishlist}
      className="absolute top-4 right-4 w-10 h-10 bg-white/95 dark:bg-charcoal-800/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 z-10 group/heart"
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isWishlisted ? (
        <FaHeart className="text-terracotta-500 text-lg group-hover/heart:scale-110 transition-transform" />
      ) : (
        <FaRegHeart className="text-charcoal-400 group-hover/heart:text-terracotta-500 text-lg transition-colors" />
      )}
    </button>
  );
};

export default function Storefront() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { addItem } = useCart();
  const { showError } = useToast();
  
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/sellers/storefront/${slug}?limit=100`);
        if (data.success) {
          setStoreData(data.data.seller);
          setProducts(data.data.products);
          setTotalProducts(data.data.pagination?.total || data.data.products.length);
          document.title = `${data.data.seller.storeName || data.data.seller.name} | Kuri Macye`;
        } else {
          setError("Store not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error loading store");
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [slug]);

  const handleAddToCart = async (product) => {
    if (product.customizable) {
      window.location.href = `/product/${product.id}`;
      return;
    }
    try {
      await addItem(product, { quantity: 1 });
    } catch (err) {
      showError("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center py-32">
          <div className="w-16 h-16 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin"></div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <FaStore className="text-6xl text-charcoal-300 mb-4" />
          <h2 className="text-2xl font-bold text-charcoal-800 dark:text-white mb-2">Store Not Found</h2>
          <p className="text-charcoal-500 dark:text-charcoal-400 mb-6">{error || "The store you are looking for does not exist or is currently inactive."}</p>
          <Link to="/shop" className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-3 rounded-xl font-bold transition">
            Continue Shopping
          </Link>
        </div>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 transition-colors duration-300">
      <Header />
      
      {/* Store Banner */}
      <div className="bg-gradient-to-br from-charcoal-800 to-charcoal-900 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557821552-17105176677c?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {storeData.storeLogo ? (
            <img 
              src={assetUrl(storeData.storeLogo)} 
              alt={storeData.storeName || storeData.name} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-2xl border-4 border-white/10"
            />
          ) : (
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-terracotta-400 to-terracotta-600 shadow-2xl border-4 border-white/10 flex items-center justify-center text-4xl font-bold">
              {(storeData.storeName || storeData.name).charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-black">{storeData.storeName || storeData.name}</h1>
              <FaCheckCircle className="text-blue-400 text-xl" title="Verified Seller" />
            </div>
            
            <p className="text-charcoal-300 text-lg mb-6 max-w-2xl">
              {storeData.storeDescription || "A trusted seller on Kuri Macye Marketplace."}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm font-medium">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                <FaBox className="text-terracotta-400" />
                <span>{totalProducts} Products</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                <FaCalendarAlt className="text-sage-400" />
                <span>Joined {new Date(storeData.createdAt).getFullYear()}</span>
              </div>
              {storeData.storePhone && (
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <FaPhone className="text-blue-400" />
                  <span>{storeData.storePhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Store Products */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-charcoal-800 dark:text-white">All Products</h2>
          <span className="text-charcoal-500 dark:text-charcoal-400">{totalProducts} items</span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white dark:bg-charcoal-800 rounded-3xl p-16 text-center shadow-sm border border-cream-200 dark:border-charcoal-700">
            <h3 className="text-xl font-bold text-charcoal-800 dark:text-white mb-2">No products yet</h3>
            <p className="text-charcoal-500 dark:text-charcoal-400">This store has not listed any public products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {products.map(p => (
              <div
                key={p.id}
                className="group bg-white dark:bg-charcoal-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-cream-200 dark:border-charcoal-700 flex flex-col"
              >
                <div className="relative aspect-square bg-cream-100 dark:bg-charcoal-700 overflow-hidden">
                  <Link to={`/product/${p.id}`} className="block h-full">
                    {(p.image || p.images?.[0]) ? (
                      <img
                        src={assetUrl(p.image || p.images?.[0])}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-terracotta-100 to-terracotta-200 dark:from-charcoal-700 dark:to-charcoal-600">
                        <FaBox className="text-5xl text-terracotta-300 dark:text-terracotta-600" />
                      </div>
                    )}
                  </Link>

                  <WishlistButton product={p} />

                  <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
                    <div className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                      {formatRwf(p.price)}
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={(e) => { e.preventDefault(); handleAddToCart(p); }}
                      className="bg-white text-charcoal-800 px-5 py-2.5 rounded-full font-bold shadow-xl flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform duration-300 hover:bg-terracotta-500 hover:text-white text-sm"
                    >
                      {p.customizable ? "Shop" : <><FaShoppingCart /> Add</>}
                    </button>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <Link to={`/product/${p.id}`}>
                    <h3 className="font-bold text-charcoal-800 dark:text-white mb-1 line-clamp-1 group-hover:text-terracotta-500 dark:group-hover:text-terracotta-400 transition-colors text-sm">
                      {p.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 mt-auto">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < getRating(p.averageRating) ? "text-sand-400 text-[10px]" : "text-charcoal-200 dark:text-charcoal-700 text-[10px]"} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <LandingFooter />
    </div>
  );
}
