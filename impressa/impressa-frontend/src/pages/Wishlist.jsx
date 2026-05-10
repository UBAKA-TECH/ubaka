import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTrashAlt, FaShoppingCart, FaHeart, FaArrowRight, FaTshirt } from "react-icons/fa";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import api from "../utils/axiosInstance";
import assetUrl from "../utils/assetUrl";
import { formatRwf } from "../utils/currency";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";



export default function Wishlist() {
  const { ids, remove } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!ids.length) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/products/by-ids", { params: { ids: ids.join(",") } });
        setProducts(res.data || []);
      } catch (e) {
        console.error("Failed to load wishlist products", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [ids]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-pink-200 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-violet-200 dark:bg-violet-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-200 dark:bg-blue-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-4">
              <FaHeart className="text-pink-500" /> Your Wishlist
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Save your favorite items for later and keep track of what you love.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 md:py-16 -mt-8 relative z-10">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-xl border border-gray-100 dark:border-slate-800 text-center">
              <div className="animate-pulse space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full mx-auto" />
                <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-48 mx-auto" />
              </div>
              <div className="mt-8 text-xl font-bold text-gray-400 dark:text-gray-500">Loading your favorites...</div>
            </div>
          ) : ids.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-xl border border-gray-100 dark:border-slate-800 text-center max-w-lg mx-auto transform transition-all hover:scale-[1.01]">
              <div className="w-24 h-24 bg-pink-50 dark:bg-pink-900/10 rounded-full flex items-center justify-center mx-auto mb-8 text-pink-500">
                <FaHeart className="text-5xl" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Your wishlist is empty</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg leading-relaxed">Looks like you haven't added any items yet. Start exploring our shop to find your next favorite thing!</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-2xl font-black text-lg transition-all hover:bg-violet-600 dark:hover:bg-violet-400 hover:scale-105 shadow-xl shadow-gray-200 dark:shadow-none"
              >
                Start Shopping <FaArrowRight />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((p) => (
                <div key={p.id} className="group bg-white dark:bg-slate-900 rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 dark:border-slate-800 transition-all duration-500 overflow-hidden flex flex-col h-full transform hover:-translate-y-2">
                  <Link to={`/product/${p.id}`} className="relative block aspect-square overflow-hidden bg-gray-50 dark:bg-slate-950">
                    {p.image ? (
                      <img
                        src={assetUrl(p.image)}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-800 bg-gray-100 dark:bg-slate-800">
                        <FaTshirt className="text-6xl" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        remove(p.id);
                      }}
                      className="absolute top-4 right-4 p-3 bg-white/90 dark:bg-slate-900/90 rounded-2xl text-red-500 shadow-lg backdrop-blur-sm transition-all hover:bg-red-500 hover:text-white transform hover:rotate-12 active:scale-90 z-20"
                      title="Remove from wishlist"
                    >
                      <FaTrashAlt className="text-lg" />
                    </button>
                  </Link>

                  <div className="p-6 flex flex-col flex-grow">
                    <Link to={`/product/${p.id}`} className="block group/title">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover/title:text-pink-500 transition-colors">{p.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed flex-grow">{p.description}</p>

                    <div className="pt-6 border-t border-gray-50 dark:border-slate-800 flex items-center justify-between mb-6">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">{formatRwf(p.price)}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (p.customizable || p.type === 'variable') {
                          window.location.href = `/product/${p.id}`;
                        } else {
                          addItem(p, { quantity: 1 });
                        }
                      }}
                      className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:bg-pink-600 dark:hover:bg-pink-500 hover:text-white shadow-lg active:scale-95 group/btn"
                    >
                      <FaShoppingCart className="transition-transform group-hover/btn:-translate-y-1" />
                      {p.customizable || p.type === 'variable' ? 'Customize' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
