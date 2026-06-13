// Kuri Macye Home Page - Premium Marketplace Design
// Kuri Macye Home Page - Premium Marketplace Design
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { formatRwf } from "../utils/currency";
import api from "../utils/axiosInstance";
import LandingFooter from "../components/LandingFooter";
import Header from "../components/Header";
import { useWishlist } from "../context/WishlistContext";
import assetUrl from "../utils/assetUrl";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";

// Custom SVG Icons to replace react-icons/fa (saves bundle size on the homepage)
const ArrowRightIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`shrink-0 ${className}`} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

const HeartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className || "w-6 h-6"} aria-hidden="true">
    <path fill="currentColor" fillOpacity="0.15" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className || "w-6 h-6"} aria-hidden="true">
    <path fill="currentColor" fillOpacity="0.15" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ShieldIcon = ({ className, title }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className || "w-6 h-6"} aria-hidden="true">
    {title && <title>{title}</title>}
    <path fill="currentColor" fillOpacity="0.15" d="M12 22s8-4 8-10V5l-8-3v20z" />
    <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 11l2 2 4-4" />
  </svg>
);

const TruckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className || "w-6 h-6"} aria-hidden="true">
    <path fill="currentColor" fillOpacity="0.15" d="M3 4h11v11H3z" />
    <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M14 4H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11V4z" />
    <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M14 8h5.586a1 1 0 0 1 .707.293l2.414 2.414a1 1 0 0 1 .293.707V15a1 1 0 0 1-1 1h-8V8z" />
    <path stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity="0.6" d="M17 8l2.5 2.5H15V8z" />
    <circle cx="6.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth={2} />
    <circle cx="6.5" cy="18.5" r="0.75" fill="currentColor" />
    <circle cx="17.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth={2} />
    <circle cx="17.5" cy="18.5" r="0.75" fill="currentColor" />
  </svg>
);

const UndoIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className || "w-6 h-6"} aria-hidden="true">
    <path fill="currentColor" fillOpacity="0.15" d="M12 8a5 5 0 0 1 5 5v3h-3l4 4 4-4h-3v-3a8 8 0 0 0-8-8 8 8 0 0 0-6.2 3.1L7.3 9.4A5 5 0 0 1 12 8z" />
    <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 14v-4h4" />
    <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 10a8 8 0 1 1 3.54 6.64" />
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
  </svg>
);

const HeadsetIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className || "w-6 h-6"} aria-hidden="true">
    <path fill="currentColor" fillOpacity="0.15" d="M12 3a9 9 0 0 0-9 9v3h2v-3a7 7 0 0 1 14 0v3h2v-3a9 9 0 0 0-9-9z" />
    <path stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M3 14v-2a9 9 0 0 1 18 0v2" />
    <rect x="2" y="13" width="3" height="6" rx="1.5" stroke="currentColor" strokeWidth={2} fill="currentColor" fillOpacity="0.2" />
    <rect x="19" y="13" width="3" height="6" rx="1.5" stroke="currentColor" strokeWidth={2} fill="currentColor" fillOpacity="0.2" />
    <path stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M20 18.5c-2 2-5 2.5-7 2.5" />
    <circle cx="12.5" cy="21" r="1" fill="currentColor" />
  </svg>
);

const PrintIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className || "w-4 h-4"} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.844l9.63-9.63M6 21H18M6 17h12M6 13h12M19.5 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 9.75h13.5A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6a2.25 2.25 0 012.25-2.25z" />
  </svg>
);

const StoreIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className || "w-4 h-4"} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-9v9m16.5-9v9m-16.5-9h16.5M2.25 9l1.35-4.72A.75.75 0 0 1 4.32 3.75h15.36a.75.75 0 0 1 .72.53L21.75 9m-19.5 0h19.5M5.25 14.25a3 3 0 0 0 6 0m0 0a3 3 0 0 0 6 0m-12 0H18" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className || "w-4 h-4"} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Lazy-loaded components for better performance
const AIChatWidget = lazy(() => import("../components/AdminChatBot"));
const FlashSaleBanner = lazy(() => import("../components/FlashSaleBanner"));

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
  'Electronics': { img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&auto=format&fit=crop&q=80', color: 'from-charcoal-600 to-charcoal-700' },
  'Fashion': { img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=300&auto=format&fit=crop&q=80', color: 'from-terracotta-400 to-terracotta-500' },
  'Home & Living': { img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=300&h=300&auto=format&fit=crop&q=80', color: 'from-sand-400 to-sand-500' },
  'Sports': { img: 'https://images.unsplash.com/photo-1461896836934-480c9e5d4c98?w=300&h=300&auto=format&fit=crop&q=80', color: 'from-sage-400 to-sage-500' },
  'Beauty': { img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&auto=format&fit=crop&q=80', color: 'from-terracotta-300 to-terracotta-400' },
  'Accessories': { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&auto=format&fit=crop&q=80', color: 'from-charcoal-500 to-charcoal-600' }
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
  const [lightboxImg, setLightboxImg] = useState(null);

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
            img: cat.image || defaults.img || `https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&h=300&auto=format&fit=crop&q=80`,
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
  }, []);

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
      <SEO />
      <Header />

      <main id="main-content">
        {/* Hero Section - Warm Humanised Design */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal-700 via-charcoal-800 to-charcoal-900 dark:from-charcoal-900 dark:via-black dark:to-charcoal-900"></div>
          <img
            src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&auto=format&fit=crop&q=80"
            srcSet="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&auto=format&fit=crop&q=80 600w,
                    https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&auto=format&fit=crop&q=80 1200w"
            sizes="(max-width: 600px) 600px, 1200px"
            alt="Marketplace background"
            fetchPriority="high"
            width="1200"
            height="400"
            className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
          />

          <div className="relative mx-auto max-w-7xl px-6 pt-5 pb-2 md:pt-7 md:pb-3">
            <div className="max-w-2xl">
              <span className="inline-block bg-terracotta-500/20 text-terracotta-200 px-2.5 py-1 rounded-full text-xs font-semibold mb-2 backdrop-blur-sm border border-terracotta-500/30 uppercase tracking-wider shadow-lg">
                {t('home.hero.badge')}
              </span>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-2 leading-[1.1] tracking-tight">
                {t('home.hero.title_part1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta-300 to-sand-300">{t('home.hero.title_premium')}</span> <br className="hidden md:block" />{t('home.hero.title_part2')}
              </h1>
              <p className="text-sm md:text-base text-cream-300 dark:text-cream-400 mb-4 max-w-lg opacity-90 font-medium leading-relaxed">
                {t('home.hero.description')}
              </p>
              
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/shop" className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-600 hover:to-terracotta-700 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-terracotta-500/25 hover:shadow-terracotta-500/40 flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
                  {t('home.hero.cta_shop')} <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
                <Link to="/daily-deals" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-95 whitespace-nowrap">
                  {t('home.hero.cta_deals')}
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 w-48 h-48 bg-terracotta-500 rounded-full blur-[80px] opacity-25 pointer-events-none"></div>
        </section>



        {/* Categories Section */}
        <section className="pt-3 pb-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-charcoal-800 dark:text-white">{t('home.categories.title')}</h2>
                <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{t('home.categories.description')}</p>
              </div>
              <Link to="/shop" aria-label="View all categories" className="text-terracotta-700 dark:text-terracotta-400 hover:text-terracotta-800 dark:hover:text-terracotta-300 text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
                {t('home.categories.view_all')} <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    className="h-24 sm:h-32 rounded-2xl bg-cream-200 dark:bg-charcoal-700 animate-pulse shadow-sm"
                  />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.slice(0, 6).map((cat, idx) => (
                  <Link
                    to={`/shop?category=${encodeURIComponent(cat.name || cat.slug)}`}
                    key={cat.id || idx}
                    className="group relative h-24 sm:h-32 rounded-2xl overflow-hidden shadow-md"
                  >
                    <img src={cat.img} alt={cat.name} width="300" height="300" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
        {(loading || sellers.length > 0) && (
          <section className="py-8 bg-cream-50 dark:bg-charcoal-800/50 border-b border-cream-200 dark:border-charcoal-700">
            <div className="mx-auto max-w-7xl px-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-charcoal-800 dark:text-white">{t('home.vendors.title', 'Meet Our Verified Vendors')}</h2>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{t('home.vendors.description', 'Shop directly from top-rated local merchants')}</p>
                </div>
              </div>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))'}}>
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 text-center shadow-sm border border-cream-200 dark:border-charcoal-700 flex flex-col h-[288px] animate-pulse">
                      <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-cream-200 dark:bg-charcoal-700 shrink-0" />
                      <div className="h-5 bg-cream-200 dark:bg-charcoal-700 rounded w-3/4 mx-auto mb-2" />
                      <div className="h-3 bg-cream-200 dark:bg-charcoal-700 rounded w-1/2 mx-auto mb-5" />
                      <div className="h-8 bg-cream-200 dark:bg-charcoal-700 rounded-full w-24 mx-auto mt-auto" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4" style={{gridTemplateColumns: `repeat(${Math.min(sellers.length, 4)}, minmax(0, 200px))`}}>
                  {sellers.map((seller) => (
                    <div key={seller.id} className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all border border-cream-200 dark:border-charcoal-700 group flex flex-col h-full">
                      <div
                        className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-4 border-cream-100 dark:border-charcoal-700 bg-cream-100 flex items-center justify-center text-3xl font-bold text-terracotta-500 relative shrink-0 cursor-pointer"
                        onClick={() => seller.storeLogo && setLightboxImg(assetUrl(seller.storeLogo))}
                        title={seller.storeLogo ? 'Click to enlarge' : ''}
                      >
                        {seller.storeLogo ? (
                          <img src={assetUrl(seller.storeLogo)} alt={seller.storeName} width="112" height="112" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          (seller.storeName || seller.name).charAt(0).toUpperCase()
                        )}
                        {seller.storeLogo && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-semibold">🔍</span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                          <ShieldIcon className="text-blue-500 text-sm" title="Verified Seller" />
                        </div>
                      </div>
                      <h3 className="font-bold text-charcoal-800 dark:text-white mb-1 group-hover:text-terracotta-500 transition-colors line-clamp-1">{seller.storeName || seller.name}</h3>
                      <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-4 flex-1">{seller.productCount} Products</p>
                      <Link
                        to={`/store/${seller.storeSlug || seller.id}`}
                        aria-label={`Visit ${seller.storeName || seller.name}'s store`}
                        className="inline-block border border-terracotta-700/40 text-terracotta-700 dark:text-terracotta-400 px-4 py-2 rounded-full text-xs font-semibold hover:bg-terracotta-50 dark:hover:bg-charcoal-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        Visit Store
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
        {/* Logo Lightbox */}
        {lightboxImg && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setLightboxImg(null)}
          >
            <div className="relative max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
              <img src={lightboxImg} alt="Store logo" className="w-full rounded-2xl shadow-2xl object-contain max-h-[80vh]" />
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute -top-3 -right-3 bg-white dark:bg-charcoal-800 rounded-full w-8 h-8 flex items-center justify-center shadow-lg text-charcoal-700 dark:text-white font-bold hover:bg-red-500 hover:text-white transition-colors"
              >✕</button>
            </div>
          </div>
        )}

        {/* Promotional Banner - Dynamic from Admin */}
        {(loading || promoBanner) && (
          <section className="py-8">
            <div className="mx-auto max-w-7xl px-4">
              {loading ? (
                <div className="relative rounded-2xl overflow-hidden h-[200px] bg-cream-200 dark:bg-charcoal-700 animate-pulse" />
              ) : (
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
              )}
            </div>
          </section>
        )}

        <Suspense fallback={
          <section className="py-8">
            <div className="mx-auto max-w-7xl px-4">
              <div className="h-[120px] rounded-2xl bg-cream-200 dark:bg-charcoal-700 animate-pulse shadow-sm" />
            </div>
          </section>
        }>
          <FlashSaleBanner />
        </Suspense>

        {/* Featured Products */}
        <section className="py-16 bg-white dark:bg-charcoal-800 border-y border-cream-200 dark:border-charcoal-700">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-charcoal-800 dark:text-white mb-2">{t('home.featured.title')}</h2>
                <p className="text-charcoal-500 dark:text-charcoal-400">{t('home.featured.description')}</p>
              </div>
              <Link to="/shop?sort=featured" aria-label="View all featured products" className="text-terracotta-700 dark:text-terracotta-400 hover:text-terracotta-800 dark:hover:text-terracotta-300 font-semibold flex items-center gap-1 whitespace-nowrap">
                {t('home.trending.view_all')} <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-charcoal-800 rounded-2xl border border-cream-300 dark:border-charcoal-600 flex flex-col h-[280px] sm:h-[360px] overflow-hidden">
                    <div className="aspect-square bg-cream-200 dark:bg-charcoal-700 w-full"></div>
                    <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
                      <div className="h-4 bg-cream-200 dark:bg-charcoal-700 rounded w-3/4"></div>
                      <div className="h-3 bg-cream-200 dark:bg-charcoal-700 rounded w-1/2"></div>
                      <div className="h-4 bg-cream-200 dark:bg-charcoal-700 rounded w-1/3 mt-auto"></div>
                    </div>
                  </div>
                ))}
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
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
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
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80"
                    alt="Sale"
                    width="224"
                    height="224"
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
                <Link to="/print-portal" className="inline-flex items-center justify-center gap-2 bg-white text-indigo-950 px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:bg-blue-50 transition-all active:scale-95 whitespace-nowrap">
                  {t('home.print.cta')} <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
              <div className="w-full md:w-64 aspect-video md:aspect-square bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-6 flex items-center justify-center relative group">
                <div className="text-6xl text-white/10 group-hover:text-white/20 transition-colors">
                  <PrintIcon />
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
              <Link to="/shop?sort=trending" aria-label="View all trending products" className="text-terracotta-700 dark:text-terracotta-400 hover:text-terracotta-800 dark:hover:text-terracotta-300 font-semibold flex items-center gap-1 whitespace-nowrap">
                {t('home.trending.view_all')} <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-charcoal-800 rounded-2xl border border-cream-300 dark:border-charcoal-600 flex flex-col h-[280px] sm:h-[360px] overflow-hidden">
                    <div className="aspect-square bg-cream-200 dark:bg-charcoal-700 w-full"></div>
                    <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
                      <div className="h-4 bg-cream-200 dark:bg-charcoal-700 rounded w-3/4"></div>
                      <div className="h-3 bg-cream-200 dark:bg-charcoal-700 rounded w-1/2"></div>
                      <div className="h-4 bg-cream-200 dark:bg-charcoal-700 rounded w-1/3 mt-auto"></div>
                    </div>
                  </div>
                ))}
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
                        <StarIcon key={i} className="text-sand-400" />
                      ))}
                    </div>
                    <p className="text-charcoal-600 dark:text-cream-300 mb-6 leading-relaxed">"{testimonial.content || testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      {testimonial.avatar ? (
                        <img src={testimonial.avatar} alt={testimonial.name} width="48" height="48" className="w-12 h-12 rounded-full object-cover" />
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
                        width="120"
                        height="48"
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
                  truck: <TruckIcon className="w-6 h-6" />,
                  shield: <ShieldIcon className="w-6 h-6" />,
                  undo: <UndoIcon className="w-6 h-6" />,
                  headset: <HeadsetIcon className="w-6 h-6" />,
                  clock: <HeadsetIcon className="w-6 h-6" />,
                  star: <StarIcon className="w-6 h-6" />,
                  check: <ShieldIcon className="w-6 h-6" />,
                  heart: <HeartIcon className="w-6 h-6" />
                };
                const featureKeyMap = {
                  star: 'vendors',
                  shield: 'payment',
                  check: 'ebm',
                  truck: 'delivery'
                };
                const key = featureKeyMap[badge.icon];

                return (
                  <div key={badge.id || idx} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-cream-50 dark:hover:bg-charcoal-700/20 transition-all duration-300">
                    <div className="w-12 h-12 bg-terracotta-50 dark:bg-charcoal-700/50 rounded-xl flex items-center justify-center text-terracotta-500 dark:text-terracotta-400 group-hover:scale-110 group-hover:bg-terracotta-500 group-hover:text-white dark:group-hover:bg-terracotta-500/20 dark:group-hover:text-terracotta-300 transition-all duration-300 shadow-sm group-hover:shadow-md">
                      {iconMap[badge.icon] || <ShieldIcon className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal-800 dark:text-cream-100 group-hover:text-terracotta-600 dark:group-hover:text-terracotta-400 transition-colors duration-200">
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
                <span className="inline-block bg-terracotta-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">Sell with us</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Grow Your Business on Kuri Macye</h2>
                <p className="text-charcoal-300 mb-6">Join thousands of verified local merchants reaching customers nationwide. Fast onboarding, secure payments, and lowest fees.</p>
                <div className="flex items-center gap-4 text-sm text-cream-200 mb-6 justify-center md:justify-start">
                  <span className="flex items-center gap-1"><CheckCircleIcon className="text-terracotta-400"/> Daily Payouts</span>
                  <span className="flex items-center gap-1"><CheckCircleIcon className="text-terracotta-400"/> Seller Support</span>
                </div>
                <Link to="/become-seller" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white px-8 py-4 rounded-xl font-bold hover:from-terracotta-600 hover:to-terracotta-700 transition shadow-lg hover:shadow-xl hover:-translate-y-1 whitespace-nowrap">
                  Start Selling Today <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
              <div className="relative z-10 hidden lg:block">
                <div className="w-72 h-72 rounded-full border-8 border-charcoal-700 border-dashed animate-[spin_60s_linear_infinite] flex items-center justify-center">
                   <StoreIcon className="text-6xl text-charcoal-600" />
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
            <p className="text-charcoal-200 mb-8 max-w-md mx-auto">
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
      <Suspense fallback={null}>
        <AIChatWidget endpoint="/chatbot/public" title="Client Support" storageKey="publicChat" />
      </Suspense>
    </div >
  );
}
