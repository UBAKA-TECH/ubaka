// Kuri Macye Home Page - Premium Marketplace Design
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FaArrowRight, FaHeart, FaRegHeart, FaStar, FaShieldAlt, FaTruck, FaUndo, FaHeadset, FaPrint, FaStore, FaCheckCircle
} from "react-icons/fa";
import { formatRwf } from "../utils/currency";
import api from "../utils/axiosInstance";
import LandingFooter from "../components/LandingFooter";
import Header from "../components/Header";
import { useWishlist } from "../context/WishlistContext";
import AIChatWidget from "../components/AdminChatBot"; // Using the generic Chatbot
import FlashSaleBanner from "../components/FlashSaleBanner";
import assetUrl from "../utils/assetUrl";
import { supabase } from "../utils/supabaseClient";
import ProductCard from "../components/ProductCard";

const getRating = (rating) => {
  if (!rating) return 0;
  if (Array.isArray(rating)) {
    if (rating.length === 0) return 0;
    const sum = rating.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return sum / rating.length;
  }
  return Number(rating);
};


// Default category images and colors for fallback
const categoryDefaults = {
  'Electronics': { img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop', color: 'from-charcoal-600 to-charcoal-700' },
  'Fashion': { img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&fit=crop', color: 'from-terracotta-400 to-terracotta-500' },
  'Home & Living': { img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=300&h=300&fit=crop', color: 'from-sand-400 to-sand-500' },
  'Sports': { img: 'https://images.unsplash.com/photo-1461896836934-480c9e5d4c98?w=300&h=300&fit=crop', color: 'from-sage-400 to-sage-500' },
  'Beauty': { img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop', color: 'from-terracotta-300 to-terracotta-400' },
  'Accessories': { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop', color: 'from-charcoal-500 to-charcoal-600' }
};

const defaultColors = [
  'from-terracotta-400 to-terracotta-500',
  'from-sage-400 to-sage-500',
  'from-sand-400 to-sand-500',
  'from-charcoal-500 to-charcoal-600',
  'from-terracotta-300 to-terracotta-400',
  'from-sage-500 to-sage-600'
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const isRw = i18n.language === 'rw';
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState([]);
  const [brandPartners, setBrandPartners] = useState([]);
  const [trustBadges, setTrustBadges] = useState([]);

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ loading: false, message: '', type: '' });

  const [promoBanner, setPromoBanner] = useState(null);
  const [hasPrintingServices, setHasPrintingServices] = useState(false);

  const fetchData = async () => {
    try {
      const [featuredRes, trendingRes, categoriesRes, bannersRes, testimonialsRes, brandPartnersRes, siteSettingsRes, printingRes, sellersRes] = await Promise.all([
        api.get('/products/featured/list'),
        api.get('/products/trending'),
        api.get('/categories'),
        api.get('/banners/active?position=hero'),
        api.get('/testimonials/active?limit=6'),
        api.get('/brand-partners/active'),
        api.get('/site-settings/public'),
        api.get('/products?tags=printing_service'),
        api.get('/sellers/public?limit=8')
      ]);

      const featuredData = featuredRes.data;
      const trendingData = trendingRes.data;
      const categoriesData = categoriesRes.data;
      const bannersData = bannersRes.data;
      const testimonialsData = testimonialsRes.data;
      const brandPartnersData = brandPartnersRes.data;
      const siteSettingsData = siteSettingsRes.data;
      const sellersData = sellersRes.data;

      if (sellersData && sellersData.success) {
        setSellers(sellersData.data);
      }

      if (Array.isArray(featuredData)) {
        setFeatured(featuredData.filter(item => item && item.id));
      } else if (featuredData.success && Array.isArray(featuredData.products)) {
        setFeatured(featuredData.products.filter(item => item && item.id));
      }

      if (Array.isArray(trendingData)) {
        setTrending(trendingData.filter(item => item && item.id));
      }

      // Process categories with fallback images/colors
      if (categoriesData.success && Array.isArray(categoriesData.data)) {
        const processedCategories = categoriesData.data.map((cat, idx) => {
          const defaults = categoryDefaults[cat.name] || {};
          return {
            ...cat,
            img: cat.image || defaults.img || `https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&h=300&fit=crop`,
            color: cat.color || defaults.color || defaultColors[idx % defaultColors.length]
          };
        });
        setCategories(processedCategories);
      }

      // No longer need to set active flash sale here manually

      // Set promotional banner
      if (bannersData.success && bannersData.data && bannersData.data.length > 0) {
        setPromoBanner(bannersData.data[0]);
      }

      // Set testimonials
      if (testimonialsData.success && testimonialsData.data) {
        setTestimonials(testimonialsData.data);
      }

      // Set brand partners
      if (brandPartnersData.success && brandPartnersData.data) {
        setBrandPartners(brandPartnersData.data);
      }

      // Set trust badges
      if (siteSettingsData.success && siteSettingsData.data?.trustBadges) {
        setTrustBadges(siteSettingsData.data.trustBadges);
      }

      // Check printing services
      const printingData = printingRes.data;
      if (printingData.success && Array.isArray(printingData.data)) {
        setHasPrintingServices(printingData.data.length > 0);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // No longer need internal countdown

  // Initial fetch
  useEffect(() => {
    // Handle auth errors in hash (redirect to login)
    if (window.location.hash.includes('error=')) {
      window.location.href = `/login${window.location.hash}`;
      return;
    }

    fetchData();

    // Subscribe to Product changes to update hasPrintingServices dynamically
    const channel = supabase
      .channel('home-product-tag-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Product'
        },
        async () => {
          try {
            const res = await api.get('/products?tags=printing_service');
            if (res.data && res.data.success && Array.isArray(res.data.data)) {
              setHasPrintingServices(res.data.data.length > 0);
            }
          } catch (err) {}
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
      <Header />

      <main id="main-content">
        {/* Hero Section - Warm Humanised Design */}
        <section className="relative overflow-hidden max-h-[340px] md:max-h-[320px]">
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal-700 via-charcoal-800 to-charcoal-900 dark:from-charcoal-900 dark:via-black dark:to-charcoal-900"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>

          <div className="relative mx-auto max-w-7xl px-6 pt-8 pb-2 md:pt-10 md:pb-4">
            <div className="max-w-2xl">
              <span className="inline-block bg-terracotta-500/20 text-terracotta-200 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 backdrop-blur-sm border border-terracotta-500/30 uppercase tracking-wider shadow-lg">
                {t('home.hero.badge')}
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-[1.1] tracking-tight">
                {t('home.hero.title_part1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta-300 to-sand-300">{t('home.hero.title_premium')}</span> <br className="hidden md:block" />{t('home.hero.title_part2')}
              </h1>
              <p className="text-base md:text-lg text-cream-300 dark:text-cream-400 mb-8 max-w-lg opacity-90 font-medium leading-relaxed">
                {t('home.hero.description')}
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Link to="/shop" className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-600 hover:to-terracotta-700 text-white px-6 py-3 rounded-full font-bold text-base transition-all shadow-lg shadow-terracotta-500/25 hover:shadow-terracotta-500/40 flex items-center gap-2 active:scale-95">
                  {t('home.hero.cta_shop')} <FaArrowRight className="text-sm" />
                </Link>
                <Link to="/daily-deals" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold text-base transition-all backdrop-blur-md border border-white/20 active:scale-95">
                  {t('home.hero.cta_deals')}
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 w-48 h-48 bg-terracotta-500 rounded-full blur-[80px] opacity-25 pointer-events-none"></div>
        </section>



        {/* Categories Section */}
        <section className="pt-3 pb-8">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-charcoal-800 dark:text-white">{t('home.categories.title')}</h2>
                <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{t('home.categories.description')}</p>
              </div>
              <Link to="/shop" className="text-terracotta-500 dark:text-terracotta-400 hover:text-terracotta-600 dark:hover:text-terracotta-300 text-sm font-semibold flex items-center gap-1">
                {t('home.categories.view_all')} <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.slice(0, 6).map((cat, idx) => (
                  <Link
                    to={`/shop?category=${encodeURIComponent(cat.name || cat.slug)}`}
                    key={cat.id || idx}
                    className="group relative h-24 sm:h-32 rounded-2xl overflow-hidden shadow-md"
                  >
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60 group-hover:opacity-70 transition`}></div>
                    <div className="absolute inset-0 flex items-end p-2">
                      <span className="text-white font-bold text-sm drop-shadow-lg">{cat.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-charcoal-400 dark:text-charcoal-500">
                <p>No categories available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* Meet Our Verified Vendors Section */}
        {sellers.length > 0 && (
          <section className="py-16 bg-cream-50 dark:bg-charcoal-800/50 border-b border-cream-200 dark:border-charcoal-700">
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-charcoal-800 dark:text-white mb-2">{t('home.vendors.title', 'Meet Our Verified Vendors')}</h2>
                  <p className="text-charcoal-500 dark:text-charcoal-400">{t('home.vendors.description', 'Shop directly from top-rated local merchants')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {sellers.map((seller) => (
                  <Link key={seller.id} to={`/store/${seller.storeSlug || seller.id}`} className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all border border-cream-200 dark:border-charcoal-700 group flex flex-col h-full">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-4 border-cream-100 dark:border-charcoal-700 bg-cream-100 flex items-center justify-center text-2xl font-bold text-terracotta-500 relative shrink-0">
                      {seller.storeLogo ? (
                        <img src={assetUrl(seller.storeLogo)} alt={seller.storeName} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        (seller.storeName || seller.name).charAt(0).toUpperCase()
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        <FaShieldAlt className="text-blue-500 text-sm" title="Verified Seller" />
                      </div>
                    </div>
                    <h3 className="font-bold text-charcoal-800 dark:text-white mb-1 group-hover:text-terracotta-500 transition-colors line-clamp-1">{seller.storeName || seller.name}</h3>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-4 flex-1">{seller.productCount} Products</p>
                    <span className="inline-block border border-terracotta-500/30 text-terracotta-600 dark:text-terracotta-400 px-4 py-1.5 rounded-full text-xs font-semibold group-hover:bg-terracotta-50 dark:group-hover:bg-charcoal-700 transition-colors">
                      Visit Store
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Promotional Banner - Dynamic from Admin */}
        {promoBanner && (
          <section className="py-8">
            <div className="mx-auto max-w-7xl px-4">
              <div
                className="relative rounded-2xl overflow-hidden min-h-[200px] flex items-center"
                style={{
                  background: promoBanner.backgroundImage
                    ? `url(${promoBanner.backgroundImage}) center/cover`
                    : `linear-gradient(135deg, ${promoBanner.gradientFrom}, ${promoBanner.gradientTo})`
                }}
              >
                {/* Overlay pattern */}
                <div className="absolute inset-0 opacity-10 bg-black"></div>
                {/* Large decorative text */}
                <div className="absolute right-0 top-0 bottom-0 flex items-center opacity-20 pointer-events-none overflow-hidden">
                  <span className="text-[200px] font-black text-white whitespace-nowrap -mr-20">SALE</span>
                </div>
                {/* Content */}
                <div className="relative z-10 p-8 md:p-12">
                  {(isRw ? (promoBanner.badgeRw || promoBanner.badge) : promoBanner.badge) && (
                    <span className="inline-block bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm">
                      {isRw ? (promoBanner.badgeRw || promoBanner.badge) : promoBanner.badge}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
                    {isRw ? (promoBanner.titleRw || promoBanner.title) : promoBanner.title}
                  </h2>
                  {(isRw ? (promoBanner.subtitleRw || promoBanner.subtitle) : promoBanner.subtitle) && (
                    <p className="text-white/90 text-lg mb-6 max-w-lg">
                      {isRw ? (promoBanner.subtitleRw || promoBanner.subtitle) : promoBanner.subtitle}
                    </p>
                  )}
                  <Link
                    to={promoBanner.buttonLink || '/shop'}
                    className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg"
                  >
                    {isRw ? (promoBanner.buttonTextRw || promoBanner.buttonText || 'Gura ubu') : (promoBanner.buttonText || 'Shop Now')}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        <FlashSaleBanner />

        {/* Featured Products */}
        <section className="py-16 bg-white dark:bg-charcoal-800 border-y border-cream-200 dark:border-charcoal-700">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-charcoal-800 dark:text-white mb-2">{t('home.featured.title')}</h2>
                <p className="text-charcoal-500 dark:text-charcoal-400">{t('home.featured.description')}</p>
              </div>
              <Link to="/shop?sort=featured" className="text-terracotta-500 dark:text-terracotta-400 hover:text-terracotta-600 dark:hover:text-terracotta-300 font-semibold flex items-center gap-1">
                {t('home.trending.view_all')} <FaArrowRight className="text-sm" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                {featured.slice(0, 12).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Banner Section */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-terracotta-500 to-terracotta-600">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1920')] bg-cover bg-center opacity-20"></div>
              <div className="relative px-8 md:px-12 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <span className="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-xs font-medium mb-3">
                    {t('home.promo_banner.badge')}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    {t('home.promo_banner.title')}
                  </h2>
                  <p className="text-white/80 text-base mb-6 max-w-md">
                    {t('home.promo_banner.description')}
                  </p>
                  <Link to="/daily-deals" className="inline-block bg-white text-terracotta-600 px-6 py-2.5 rounded-full font-bold hover:bg-cream-100 transition shadow-lg active:scale-95">
                    {t('home.promo_banner.cta')}
                  </Link>
                </div>
                <div className="hidden md:block">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400"
                    alt="Sale"
                    className="w-56 h-56 object-cover rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Print Portal Promotion */}
        {hasPrintingServices && (
          <section className="py-10 bg-indigo-900/95 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex-1 text-center md:text-left">
                <span className="inline-block bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border border-blue-500/30">
                  {t('home.print.badge')}
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {t('home.print.title_part1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-emerald-300">{t('home.print.title_highlight')}</span> {t('home.print.title_part2')}
                </h2>
                <p className="text-blue-100 text-base mb-6 opacity-75 max-w-lg font-medium">
                  {t('home.print.description')}
                </p>
                <Link to="/print-portal" className="inline-flex items-center gap-2 bg-white text-indigo-950 px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:bg-blue-50 transition-all active:scale-95">
                  {t('home.print.cta')} <FaArrowRight className="text-sm" />
                </Link>
              </div>
              <div className="w-full md:w-64 aspect-video md:aspect-square bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-6 flex items-center justify-center relative group">
                <div className="text-6xl text-white/10 group-hover:text-white/20 transition-colors">
                  <FaPrint />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-terracotta-500 text-white px-4 py-2 rounded-xl shadow-xl transform -rotate-3">
                  <span className="block text-lg font-bold">{t('home.print.speed')}</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">{t('home.print.turnaround')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Trending Products */}
        <section className="py-16 bg-white dark:bg-charcoal-800 border-y border-cream-200 dark:border-charcoal-700">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-charcoal-800 dark:text-white mb-2">{t('home.trending.title')}</h2>
                <p className="text-charcoal-500 dark:text-charcoal-400">{t('home.trending.description')}</p>
              </div>
              <Link to="/shop?sort=trending" className="text-terracotta-500 dark:text-terracotta-400 hover:text-terracotta-600 dark:hover:text-terracotta-300 font-semibold flex items-center gap-1">
                {t('home.trending.view_all')} <FaArrowRight className="text-sm" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                {trending.slice(0, 12).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <section className="py-20 bg-cream-100 dark:bg-charcoal-900">
            <div className="mx-auto max-w-7xl px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-charcoal-800 dark:text-white mb-2">{t('home.testimonials.title')}</h2>
                <p className="text-charcoal-500 dark:text-charcoal-400">{t('home.testimonials.description')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.slice(0, 6).map((testimonial, idx) => (
                  <div key={testimonial.id || idx} className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <FaStar key={i} className="text-sand-400" />
                      ))}
                    </div>
                    <p className="text-charcoal-600 dark:text-cream-300 mb-6 leading-relaxed">"{testimonial.content || testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta-400 to-terracotta-500 flex items-center justify-center text-white font-bold text-lg">
                          {testimonial.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-charcoal-800 dark:text-cream-100">{testimonial.name}</h4>
                        <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Brand Logos / Trusted By */}
        {brandPartners.length > 0 && (
          <section className="py-12 bg-white dark:bg-charcoal-800 border-y border-cream-200 dark:border-charcoal-700">
            <div className="mx-auto max-w-7xl px-4">
              <p className="text-center text-charcoal-400 text-sm uppercase tracking-wider mb-8">{t('home.brands.title')}</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 dark:opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                {brandPartners.map((partner, idx) => (
                  partner.logo ? (
                    <a
                      key={partner.id || idx}
                      href={partner.websiteUrl || '#'}
                      target={partner.websiteUrl ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="hover:opacity-100 transition-opacity"
                    >
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="h-10 md:h-12 w-auto object-contain"
                      />
                    </a>
                  ) : (
                    <div
                      key={partner.id || idx}
                      className="text-2xl font-bold text-charcoal-400 dark:text-charcoal-500 hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors cursor-pointer"
                    >
                      {partner.name}
                    </div>
                  )
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trust Badges */}
        <section className="bg-white dark:bg-charcoal-800 border-b border-cream-200 dark:border-charcoal-700">
          <div className="mx-auto max-w-7xl px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {(trustBadges.length > 0 ? trustBadges : [
                { icon: 'star', title: t('home.features.vendors.title'), description: t('home.features.vendors.description') },
                { icon: 'shield', title: t('home.features.payment.title'), description: t('home.features.payment.description') },
                { icon: 'check', title: t('home.features.ebm.title'), description: t('home.features.ebm.description') },
                { icon: 'truck', title: t('home.features.delivery.title'), description: t('home.features.delivery.description') }
              ]).map((badge, idx) => {
                const iconMap = {
                  truck: <FaTruck className="text-2xl" />,
                  shield: <FaShieldAlt className="text-2xl" />,
                  undo: <FaUndo className="text-2xl" />,
                  headset: <FaHeadset className="text-2xl" />,
                  clock: <FaHeadset className="text-2xl" />,
                  star: <FaStar className="text-2xl" />,
                  check: <FaShieldAlt className="text-2xl" />,
                  heart: <FaHeart className="text-2xl" />
                };
                const featureKeyMap = {
                  star: 'vendors',
                  shield: 'payment',
                  check: 'ebm',
                  truck: 'delivery'
                };
                const key = featureKeyMap[badge.icon];

                return (
                  <div key={badge.id || idx} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-terracotta-50 dark:bg-charcoal-700 rounded-xl flex items-center justify-center text-terracotta-500 dark:text-terracotta-400">
                      {iconMap[badge.icon] || <FaShieldAlt className="text-2xl" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal-800 dark:text-cream-100">
                        {key ? t(`home.features.${key}.title`) : badge.title}
                      </h4>
                      <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                        {key ? t(`home.features.${key}.description`) : badge.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sell on Kuri Macye CTA */}
        <section className="py-16 bg-cream-100 dark:bg-charcoal-900">
          <div className="mx-auto max-w-7xl px-4">
            <div className="bg-gradient-to-r from-charcoal-800 to-charcoal-900 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta-500 rounded-full blur-[100px] opacity-20"></div>
              <div className="relative z-10 md:max-w-xl text-center md:text-left">
                <span className="inline-block bg-terracotta-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">Sell with us</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Grow Your Business on Kuri Macye</h2>
                <p className="text-charcoal-300 mb-6">Join thousands of verified local merchants reaching customers nationwide. Fast onboarding, secure payments, and lowest fees.</p>
                <div className="flex items-center gap-4 text-sm text-cream-200 mb-6 justify-center md:justify-start">
                  <span className="flex items-center gap-1"><FaCheckCircle className="text-terracotta-400"/> Daily Payouts</span>
                  <span className="flex items-center gap-1"><FaCheckCircle className="text-terracotta-400"/> Seller Support</span>
                </div>
                <Link to="/become-seller" className="inline-flex items-center gap-2 bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white px-8 py-4 rounded-xl font-bold hover:from-terracotta-600 hover:to-terracotta-700 transition shadow-lg hover:shadow-xl hover:-translate-y-1">
                  Start Selling Today <FaArrowRight />
                </Link>
              </div>
              <div className="relative z-10 hidden lg:block">
                <div className="w-72 h-72 rounded-full border-8 border-charcoal-700 border-dashed animate-[spin_60s_linear_infinite] flex items-center justify-center">
                   <FaStore className="text-6xl text-charcoal-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 bg-charcoal-700 dark:bg-charcoal-900">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.community.title')}
            </h2>
            <p className="text-charcoal-300 mb-8 max-w-md mx-auto">
              {t('home.community.description')}
            </p>
            <form
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newsletterEmail || !newsletterEmail.includes('@')) {
                  setNewsletterStatus({ loading: false, message: 'Please enter a valid email', type: 'error' });
                  return;
                }
                setNewsletterStatus({ loading: true, message: '', type: '' });
                try {
                  const { data } = await api.post('/newsletter/subscribe', {
                    email: newsletterEmail,
                    source: 'homepage'
                  });
                  if (data.success) {
                    setNewsletterStatus({ loading: false, message: data.message, type: 'success' });
                    setNewsletterEmail('');
                  } else {
                    setNewsletterStatus({ loading: false, message: data.message, type: 'error' });
                  }
                } catch (err) {
                  const errorMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
                  setNewsletterStatus({ loading: false, message: errorMsg, type: 'error' });
                }
              }}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                {t('home.community.placeholder')}
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder={t('home.community.placeholder')}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 bg-charcoal-600 dark:bg-charcoal-800 border border-charcoal-500 rounded-full px-6 py-3 text-white placeholder-charcoal-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                disabled={newsletterStatus.loading}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white px-8 py-3 rounded-full font-semibold hover:from-terracotta-600 hover:to-terracotta-700 transition disabled:opacity-50"
                disabled={newsletterStatus.loading}
              >
                {newsletterStatus.loading ? t('home.community.button_loading') : t('home.community.button')}
              </button>
            </form>
            {newsletterStatus.message && (
              <p className={`mt-4 text-sm ${newsletterStatus.type === 'success' ? 'text-sage-400' : 'text-terracotta-400'}`}>
                {newsletterStatus.message}
              </p>
            )}
          </div>
        </section>
      </main>

      <LandingFooter />
      <AIChatWidget endpoint="/chatbot/public" title="Client Support" storageKey="publicChat" />
    </div >
  );
}
