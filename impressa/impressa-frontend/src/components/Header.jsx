import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useWishlist } from "../context/WishlistContext";
import {
  LuSearch,
  LuShoppingCart,
  LuHeart,
  LuMoon,
  LuSun,
  LuTruck,
  LuChevronDown,
  LuUser,
  LuLogOut,
  LuMenu,
  LuX,
  LuGift,
  LuLayoutDashboard,
  LuShieldAlert
} from "react-icons/lu";
import RoleSwitcher from "./RoleSwitcher";
import api from "../utils/axiosInstance";
import assetUrl from "../utils/assetUrl";
import { formatRwf } from "../utils/currency";
import { supabase } from "../utils/supabaseClient";

export default function Header() {
  const { items = [] } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { ids: wishlist = [] } = useWishlist();

  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const currentLang = i18n.language || 'en';
    const newLang = currentLang.startsWith('rw') ? 'en' : 'rw';
    i18n.changeLanguage(newLang);
    setSettingsDropdownOpen(false);
  };

  const isSellerOrAdminView = location.pathname.startsWith('/seller') || location.pathname.startsWith('/admin');

  useEffect(() => {
    setCategoryDropdownOpen(false);
    setSettingsDropdownOpen(false);
    setShowSuggestions(false);
  }, [location]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        const data = res.data;
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();

    // Set up Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Category'
        },
        () => {
          console.log('Categories changed, re-fetching...');
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/products/suggestions?q=${encodeURIComponent(searchQuery)}`);
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsSearching(false);
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    logout();
    setSettingsDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-charcoal-800 text-white shadow-xl border-b border-charcoal-700">
      <div className="mx-auto max-w-7xl px-3 md:px-6 h-16 flex items-center justify-between gap-1 md:gap-2 lg:gap-4 xl:gap-6">

        {/* Mobile Menu Button - Left */}
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setMobileMenuOpen(true)}
        >
          <LuMenu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src="/Impressa.jpeg" alt="Impressa" className="h-10 w-auto object-contain rounded-md" />
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            Impressa
          </span>
        </Link>


        {/* Navigation - DESKTOP ONLY */}
        {!isSellerOrAdminView && (
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {t('common.categories')} <LuChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setCategoryDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-2 w-60 bg-charcoal-800 border border-charcoal-600 rounded-xl shadow-2xl z-40 overflow-hidden">
                    <Link
                      to="/shop"
                      onClick={() => setCategoryDropdownOpen(false)}
                      className="block px-4 py-3 text-sm text-terracotta-400 font-semibold hover:bg-charcoal-700 transition-colors"
                    >
                      {t('nav.all_products')}
                    </Link>
                    <div className="h-px bg-charcoal-700 mx-2" />
                    <div className="max-h-80 overflow-y-auto p-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/shop?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => setCategoryDropdownOpen(false)}
                          className="block px-4 py-2.5 text-sm text-cream-300 hover:text-white hover:bg-charcoal-700 rounded-lg transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link to="/shop" className="px-2 xl:px-3 py-2 text-sm font-medium text-cream-300 hover:text-white transition-colors">{t('nav.shop')}</Link>
            <Link to="/print-portal" className="px-2 xl:px-3 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap">{t('nav.print_portal')}</Link>
            <Link to="/daily-deals" className="px-2 xl:px-3 py-2 text-sm font-medium text-sand-400 hover:text-sand-300 transition-colors whitespace-nowrap">{t('nav.deals')}</Link>
            <Link to="/gift-cards" className="px-2 xl:px-3 py-2 text-sm font-medium text-terracotta-400 hover:text-terracotta-300 transition-colors whitespace-nowrap">{t('nav.gift_cards')}</Link>
            <Link to="/track" className="flex items-center gap-1 px-2 xl:px-3 py-2 text-sm font-medium text-cream-300 hover:text-white transition-colors whitespace-nowrap">
              <LuTruck className="w-4 h-4" /> {t('nav.track')}
            </Link>
            <Link to="/blog" className="px-2 xl:px-3 py-2 text-sm font-medium text-cream-300 hover:text-white transition-colors">{t('nav.blog')}</Link>
          </nav>
        )}

        {/* Search Bar - DESKTOP ONLY */}
        {!isSellerOrAdminView && (
          <div className="hidden md:block flex-1 max-w-sm xl:max-w-md px-2 xl:px-4">
            <div className="relative w-full group">
              <form onSubmit={handleSearchSubmit}>
                <input
                  id="search-input-desktop"
                  name="q"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  placeholder={t('common.search')}
                  className="w-full h-10 pl-4 pr-10 rounded-full bg-charcoal-700/50 border border-charcoal-600 focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 text-sm text-white placeholder-charcoal-400 outline-none transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 group-focus-within:text-terracotta-400 transition-colors">
                  <LuSearch className="w-5 h-5" />
                </button>
              </form>

              {showSuggestions && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowSuggestions(false)} />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-charcoal-800 border border-charcoal-600 rounded-2xl shadow-xl z-40 overflow-hidden">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-charcoal-400">{t('common.loading')}</div>
                    ) : suggestions.length > 0 ? (
                      <div className="py-1">
                        {suggestions.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSuggestionClick(item.id)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-charcoal-700 cursor-pointer transition-colors"
                          >
                            <img src={assetUrl(item.image)} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-charcoal-700" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-cream-200 truncate">{item.name}</div>
                              <div className="text-xs text-terracotta-400 font-semibold">{formatRwf(item.price)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Icons & Auth - ALWAYS VISIBLE */}
        <div className="flex items-center gap-1 md:gap-3">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-charcoal-300 hover:text-white transition-colors"
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'light' ? <LuMoon className="w-5 h-5" /> : <LuSun className="w-5 h-5" />}
          </button>

          {/* Role Switcher (Admin Only) */}
          <RoleSwitcher user={user} theme={theme} />

          {!isSellerOrAdminView && (
            <>
              {/* Wishlist */}
              <Link to="/wishlist" className="p-2.5 text-charcoal-300 hover:text-white transition-colors relative group">
                <LuHeart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {wishlist?.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-charcoal-800">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2.5 text-charcoal-300 hover:text-white transition-colors group">
                <LuShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {items.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white border-2 border-charcoal-800">
                    {items.length}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* Account & Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
              className={`flex items-center gap-2 p-1.5 rounded-full transition-all border ${settingsDropdownOpen ? 'bg-charcoal-700 border-terracotta-500/50' : 'hover:bg-charcoal-700 border-charcoal-700'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isAuthenticated ? 'bg-gradient-to-tr from-terracotta-500 to-terracotta-600 shadow-lg' : 'bg-charcoal-700 text-charcoal-400'}`}>
                {isAuthenticated ? (
                  <span className="text-xs font-black text-white">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                ) : (
                  <LuUser className="w-5 h-5" />
                )}
              </div>
              <LuChevronDown className={`w-4 h-4 text-charcoal-400 transition-transform ${settingsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {settingsDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setSettingsDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-charcoal-800 border border-charcoal-600 rounded-2xl shadow-2xl z-40 overflow-hidden animate-in fade-in zoom-in duration-200">
                  {/* Language Section */}
                  <div className="p-4 border-b border-charcoal-700 bg-charcoal-900/20">
                    <p className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest mb-3 px-1">Language / Ururimi</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { i18n.changeLanguage('en'); setSettingsDropdownOpen(false); }}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${i18n.language?.startsWith('en') ? 'bg-terracotta-500/10 border-terracotta-500 text-terracotta-400 shadow-inner' : 'bg-charcoal-700/50 border-transparent text-charcoal-400 hover:text-white hover:bg-charcoal-700'}`}
                      >
                        <span className="text-xs font-bold">English</span>
                        <span className="text-[8px] opacity-60 uppercase tracking-tighter">Default</span>
                      </button>
                      <button
                        onClick={() => { i18n.changeLanguage('rw'); setSettingsDropdownOpen(false); }}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${i18n.language?.startsWith('rw') ? 'bg-terracotta-500/10 border-terracotta-500 text-terracotta-400 shadow-inner' : 'bg-charcoal-700/50 border-transparent text-charcoal-400 hover:text-white hover:bg-charcoal-700'}`}
                      >
                        <span className="text-xs font-bold">Kinyarwanda</span>
                        <span className="text-[8px] opacity-60 uppercase tracking-tighter">Native</span>
                      </button>
                    </div>
                  </div>

                  {/* Account / Auth Section */}
                  <div className="p-2">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 border-b border-charcoal-700/50 mb-1 bg-charcoal-900/10 rounded-xl">
                          <p className="text-[10px] text-charcoal-500 uppercase font-black tracking-widest mb-1">Authenticated</p>
                          <p className="text-sm font-bold text-white truncate">{user?.name || user?.email}</p>
                          <p className="text-[10px] text-terracotta-400 font-bold uppercase tracking-tighter mt-1">{user?.role}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                          <Link 
                            to={user?.role === 'customer' ? "/dashboard" : "/seller/dashboard"} 
                            onClick={() => setSettingsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-charcoal-300 hover:text-white hover:bg-charcoal-700 rounded-xl transition-all"
                          >
                            <LuLayoutDashboard className="w-4 h-4 text-terracotta-400" /> {t('nav.blog')} Dashboard
                          </Link>
                          <Link 
                            to="/orders" 
                            onClick={() => setSettingsDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-charcoal-300 hover:text-white hover:bg-charcoal-700 rounded-xl transition-all"
                          >
                            <LuTruck className="w-4 h-4 text-terracotta-400" /> {t('nav.track')}
                          </Link>
                          <div className="h-px bg-charcoal-700 my-1 mx-2" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-terracotta-400 hover:bg-terracotta-500/10 rounded-xl transition-all text-left font-bold"
                          >
                            <LuLogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-2 flex flex-col gap-2">
                        <Link
                          to="/login"
                          onClick={() => setSettingsDropdownOpen(false)}
                          className="flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-400 hover:to-terracotta-500 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-terracotta-900/40"
                        >
                          {t('auth.sign_in')}
                        </Link>
                        <div className="py-2 text-center">
                          <p className="text-[10px] text-charcoal-500 uppercase font-bold tracking-widest mb-1">New to Impressa?</p>
                          <Link 
                            to="/register" 
                            onClick={() => setSettingsDropdownOpen(false)}
                            className="text-xs text-terracotta-400 hover:text-terracotta-300 font-black uppercase tracking-widest hover:underline"
                          >
                            Create Account
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {
        mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-charcoal-900/95 backdrop-blur-sm lg:hidden overflow-y-auto">
            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-charcoal-400 hover:text-white"
                >
                  <LuX className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Language Switcher */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-charcoal-800 border border-charcoal-700">
                <span className="text-sm font-bold text-charcoal-400 uppercase tracking-widest">Language / Ururimi</span>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-charcoal-700 text-xs font-black uppercase tracking-widest"
                >
                  <span className={i18n.language?.startsWith('en') ? 'text-terracotta-400' : 'text-cream-200'}>EN</span>
                  <span className="opacity-30">|</span>
                  <span className={i18n.language?.startsWith('rw') ? 'text-terracotta-400' : 'text-cream-200'}>RW</span>
                </button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={(e) => {
                handleSearchSubmit(e);
                setMobileMenuOpen(false);
              }} className="relative">
                <input
                  id="search-input-mobile"
                  name="q"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-12 pl-4 pr-10 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder-charcoal-500 focus:border-terracotta-500 outline-none"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                  <LuSearch className="w-5 h-5" />
                </button>
              </form>

              <nav className="flex flex-col gap-2">
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-4 rounded-xl bg-charcoal-800 text-cream-200 font-medium hover:bg-charcoal-700"
                >
                  {t('nav.shop')}
                </Link>
                <Link
                  to="/print-portal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-4 rounded-xl bg-charcoal-800 text-blue-400 font-medium hover:bg-charcoal-700 flex items-center gap-2"
                >
                  <LuSearch className="w-4 h-4" /> {t('nav.print_portal')}
                </Link>
                <Link
                  to="/daily-deals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-4 rounded-xl bg-charcoal-800 text-sand-400 font-medium hover:bg-charcoal-700"
                >
                  {t('nav.deals')}
                </Link>
                <Link
                  to="/gift-cards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-4 rounded-xl bg-charcoal-800 text-terracotta-400 font-medium hover:bg-charcoal-700 flex items-center gap-2"
                >
                  <LuGift className="w-4 h-4" /> {t('nav.gift_cards')}
                </Link>
                <Link
                  to="/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-4 rounded-xl bg-charcoal-800 text-cream-200 font-medium hover:bg-charcoal-700 flex items-center gap-2"
                >
                  <LuTruck className="w-4 h-4" /> {t('nav.track')}
                </Link>
                <Link
                  to="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-4 rounded-xl bg-charcoal-800 text-cream-200 font-medium hover:bg-charcoal-700"
                >
                  {t('nav.blog')}
                </Link>

                <div className="h-px bg-charcoal-800 my-2" />

                <div className="text-xs font-bold text-charcoal-500 uppercase tracking-wider px-2 mb-2">{t('common.categories')}</div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 8).map(cat => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${encodeURIComponent(cat.name)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-3 rounded-lg bg-charcoal-800/50 text-sm text-charcoal-300 hover:text-white hover:bg-charcoal-700 truncate"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        )
      }
    </header>
  );
}
