import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import LandingFooter from '../components/LandingFooter';
import { FaClock, FaFire, FaShoppingCart, FaPercent, FaStar, FaBoxOpen } from 'react-icons/fa';
import { formatRwf } from '../utils/currency';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import axiosInstance from '../utils/axiosInstance';

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

export default function DailyDeals() {
    const { t } = useTranslation();
    const [flashSales, setFlashSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [activeSale, setActiveSale] = useState(null);
    const [serverTimeOffset, setServerTimeOffset] = useState(0);
    const { addItem } = useCart();

    const fetchFlashSales = async () => {
        try {
            const res = await axiosInstance.get('/flash-sales/active');
            const data = res.data;

            if (data.success && data.data) {
                setFlashSales(data.data);
                if (data.data.length > 0) {
                    setActiveSale(data.data[0]);
                } else {
                    setActiveSale(null);
                }
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and time sync
    useEffect(() => {
        const syncTimeAndFetch = async () => {
            try {
                // Fetch server time using axiosInstance
                const timeRes = await axiosInstance.get('/time');
                if (timeRes.data.success) {
                    const offset = timeRes.data.timestamp - Date.now();
                    setServerTimeOffset(offset);
                }
            } catch (err) {
            }
            await fetchFlashSales();
        };

        syncTimeAndFetch();

        // Polling for updates every 30 seconds
        const pollInterval = setInterval(fetchFlashSales, 30000);
        return () => clearInterval(pollInterval);
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!activeSale) return;

        const endTime = new Date(activeSale.endDate).getTime();

        const timer = setInterval(() => {
            const now = Date.now() + serverTimeOffset;
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                // Trigger a refresh when a sale ends
                fetchFlashSales();
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [activeSale, serverTimeOffset]);

    const handleAddToCart = async (product) => {
        try {
            await addItem(product, { quantity: 1 });
            // addItem already handles success toast via its internal logic or caller
        } catch (error) {
        }
    };

    // Get all products from all active sales
    const allProducts = flashSales.flatMap(sale =>
        sale.products.map(p => ({
            ...p,
            saleName: sale.name,
            saleEndDate: sale.endDate
        }))
    );

    return (
        <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
            <Header />

            {/* Hero Section with Countdown */}
            <section
                className="relative py-10 md:py-14 overflow-hidden"
                style={{
                    background: activeSale
                        ? `linear-gradient(135deg, ${activeSale.bannerColor?.split(' ')[1] || '#ef4444'} 0%, ${activeSale.bannerColor?.split(' ')[3] || '#f97316'} 100%)`
                        : 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
                }}
            >
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
                <div className="relative mx-auto max-w-7xl px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white font-bold text-xs mb-5 animate-bounce">
                        <FaFire /> <span>{t('daily_deals.sale_badge')}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        {activeSale ? activeSale.name : t('daily_deals.title')}
                    </h1>
                    <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
                        {activeSale
                            ? activeSale.description || t('daily_deals.default_desc')
                            : t('daily_deals.subtitle')
                        }
                    </p>

                    {/* Countdown Timer */}
                    {activeSale && (
                        <div className="space-y-8">
                            <div className="flex justify-center flex-wrap gap-3 md:gap-5 mb-8">
                                {[
                                    { label: t('home.flash_sale.days'), value: timeLeft.days },
                                    { label: t('home.flash_sale.hours'), value: timeLeft.hours },
                                    { label: t('home.flash_sale.mins'), value: timeLeft.minutes },
                                    { label: t('home.flash_sale.secs'), value: timeLeft.seconds }
                                ].map((box, i) => (
                                    <div key={i} className="bg-white dark:bg-charcoal-800 rounded-2xl p-4 md:p-5 min-w-[72px] md:min-w-[96px] shadow-lg transform hover:scale-105 transition-transform duration-300 border border-white/50 dark:border-charcoal-700">
                                        <div className="text-2xl md:text-4xl font-black text-terracotta-500 dark:text-terracotta-400 leading-none mb-1">
                                            {String(box.value).padStart(2, '0')}
                                        </div>
                                        <div className="text-[10px] md:text-xs font-bold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-widest">{box.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-center gap-2 text-white/90 font-bold text-xs bg-black/10 backdrop-blur-sm inline-flex px-5 py-2 rounded-xl mx-auto border border-white/10">
                                <FaClock className="animate-pulse" />
                                <span>{t('daily_deals.hurry_ends')} {new Date(activeSale.endDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Deals Grid */}
            <section className="mx-auto max-w-7xl px-4 py-10">
                {loading ? (
                    <div className="py-12 text-center">
                        <div className="w-12 h-12 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm font-bold text-charcoal-500 dark:text-charcoal-400">{t('daily_deals.loading')}</p>
                    </div>
                ) : allProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {allProducts.map((product, index) => {
                            const isAvailable = product.isAvailable;
                            const imageUrl = assetUrl(product.image || product.images?.[0]);

                            return (
                                <div key={`${product.id}-${index}`} className="group bg-white dark:bg-charcoal-800 rounded-3xl shadow-sm hover:shadow-2xl border border-cream-200 dark:border-charcoal-700 transition-all duration-500 overflow-hidden flex flex-col h-full transform hover:-translate-y-2">
                                    <div className="relative">
                                        {product.discount > 0 && (
                                            <div className="absolute top-3 left-3 z-10 bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-lg shadow-red-500/20">
                                                <FaPercent className="text-[10px]" />
                                                {product.discount}% {t('daily_deals.sale_tag')}
                                            </div>
                                        )}

                                        {product.remaining !== null && product.remaining > 0 && isAvailable && (
                                            <div className="absolute top-3 right-3 z-10 bg-amber-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-lg shadow-amber-500/20">
                                                {t('daily_deals.only_left', { count: product.remaining })}
                                            </div>
                                        )}

                                        {!isAvailable && (
                                            <div className="absolute inset-0 z-20 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center p-4">
                                                <span className="bg-white/90 dark:bg-charcoal-800/90 text-charcoal-800 dark:text-white px-6 py-2.5 rounded-xl font-black text-base uppercase tracking-widest shadow-xl rotate-[-10deg]">{t('daily_deals.sold_out')}</span>
                                            </div>
                                        )}

                                            <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden bg-cream-100 dark:bg-charcoal-900 flex items-center justify-center relative">
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name}
                                                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isAvailable ? 'grayscale opacity-50' : ''}`}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="absolute inset-0 hidden items-center justify-center text-charcoal-400">
                                                    <FaBoxOpen size={64} />
                                                </div>
                                            </Link>
                                    </div>

                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} className={`${i < getRating(product.averageRating) ? "text-sand-400" : "text-charcoal-200 dark:text-charcoal-700"} text-xs`} />
                                            ))}
                                            <span className="text-xs text-charcoal-400 ml-1">({getRating(product.averageRating).toFixed(1)})</span>
                                        </div>

                                        <Link to={`/product/${product.id}`} className="block mb-1.5 group/title">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover/title:text-red-500 transition-colors">{product.name}</h3>
                                        </Link>

                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-base font-black text-terracotta-500 dark:text-terracotta-400">{formatRwf(product.flashSalePrice)}</span>
                                            {product.originalPrice && product.originalPrice > product.flashSalePrice && (
                                                <span className="text-xs text-charcoal-400 dark:text-charcoal-500 line-through font-bold">{formatRwf(product.originalPrice)}</span>
                                            )}
                                        </div>

                                        {product.remaining !== null && (
                                            <div className="space-y-1.5 mb-4">
                                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-charcoal-400 dark:text-charcoal-500">
                                                    <span>{product.soldCount} {t('daily_deals.sold')}</span>
                                                    <span>{product.remaining} {t('daily_deals.left')}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-cream-200 dark:bg-charcoal-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-terracotta-500 to-sand-400"
                                                        style={{ width: `${(product.soldCount / (product.soldCount + product.remaining)) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-auto">
                                            {isAvailable ? (
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="w-full py-2.5 bg-charcoal-800 dark:bg-white text-white dark:text-charcoal-800 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all hover:bg-terracotta-500 dark:hover:bg-terracotta-500 hover:text-white shadow-md group/btn active:scale-95"
                                                >
                                                    <FaShoppingCart className="transition-transform group-hover/btn:-translate-y-0.5" />
                                                    {t('shop.add_to_cart')}
                                                </button>
                                            ) : (
                                                <button className="w-full py-2.5 bg-cream-200 dark:bg-charcoal-700 text-charcoal-400 dark:text-charcoal-500 rounded-xl font-black text-xs cursor-not-allowed" disabled>
                                                    {t('daily_deals.sold_out')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="max-w-md mx-auto text-center py-12 px-6 bg-white dark:bg-charcoal-800 rounded-3xl shadow-xl border border-cream-200 dark:border-charcoal-700">
                        <div className="w-16 h-16 bg-terracotta-50 dark:bg-terracotta-900/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-terracotta-500 shadow-inner">
                            <FaFire className="text-2xl" />
                        </div>
                        <h2 className="text-2xl font-black text-charcoal-800 dark:text-white mb-3">{t('daily_deals.no_deals_title')}</h2>
                        <p className="text-charcoal-500 dark:text-charcoal-400 mb-6 text-sm leading-relaxed">
                            {t('daily_deals.no_deals_desc')}
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 bg-charcoal-800 dark:bg-white text-white dark:text-charcoal-800 px-6 py-3 rounded-xl font-black text-sm transition-all hover:bg-terracotta-500 dark:hover:bg-terracotta-500 hover:text-white shadow-lg"
                        >
                            {t('daily_deals.browse_all')}
                        </Link>
                    </div>
                )}
            </section>

            <LandingFooter />
        </div>
    );
}
