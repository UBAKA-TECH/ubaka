import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense, lazy } from "react";
import ScrollToTop from "./components/ScrollToTop";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import InstallApp from "./components/InstallApp";
import SellerLayout from "./components/SellerLayout";

import { Toaster } from "react-hot-toast";

// Utility to handle ChunkLoadError after new deployments
const lazyWithRetry = (componentImport) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      throw error;
    }
  });

// Lazy loaded components
const Login = lazyWithRetry(() => import("./pages/Login"));
const Register = lazyWithRetry(() => import("./pages/Register"));
const SellerDashboard = lazyWithRetry(() => import("./pages/SellerDashboard"));
const UserDashboard = lazyWithRetry(() => import("./pages/UserDashboard"));
const AuthSuccess = lazyWithRetry(() => import("./pages/AuthSuccess"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"));
const Logout = lazyWithRetry(() => import("./pages/Logout"));
const Shop = lazyWithRetry(() => import("./pages/Shop"));
const ProductDetail = lazyWithRetry(() => import("./pages/ProductDetail"));
const CartPage = lazyWithRetry(() => import("./pages/Cart"));
const CheckoutPage = lazyWithRetry(() => import("./pages/Checkout"));
const TrackOrder = lazyWithRetry(() => import("./pages/TrackOrder"));
const Home = lazyWithRetry(() => import("./pages/Home"));
const Wishlist = lazyWithRetry(() => import("./pages/Wishlist"));
const About = lazyWithRetry(() => import("./pages/About"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const Blog = lazyWithRetry(() => import("./pages/Blog"));
const BlogPost = lazyWithRetry(() => import("./pages/BlogPost"));
const FAQ = lazyWithRetry(() => import("./pages/FAQ"));
const OrderHistory = lazyWithRetry(() => import("./pages/OrderHistory"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazyWithRetry(() => import("./pages/TermsOfService"));
const DailyDeals = lazyWithRetry(() => import("./pages/DailyDeals"));
const SellerOrders = lazyWithRetry(() => import("./pages/SellerOrders"));
const SellerPrintOrders = lazyWithRetry(() => import("./pages/SellerPrintOrders"));
const SellerPayouts = lazyWithRetry(() => import("./pages/SellerPayouts"));
const SellerProfile = lazyWithRetry(() => import("./pages/SellerProfile"));
const SellerOrderDetails = lazyWithRetry(() => import("./pages/SellerOrderDetails"));
const SellerNotifications = lazyWithRetry(() => import("./pages/SellerNotifications"));
const OrderSuccess = lazyWithRetry(() => import("./pages/OrderSuccess"));
const GiftCards = lazyWithRetry(() => import("./pages/GiftCards"));
const Unsubscribe = lazyWithRetry(() => import("./pages/Unsubscribe"));
const SellerAbonne = lazyWithRetry(() => import("./pages/SellerAbonne"));
const SellerShifts = lazyWithRetry(() => import("./pages/SellerShifts"));
const SellerRegistration = lazyWithRetry(() => import("./pages/SellerRegistration"));
const SellerPOS = lazyWithRetry(() => import("./pages/SellerPOS"));
const SellerProducts = lazyWithRetry(() => import("./pages/SellerProducts"));
const SellerReports = lazyWithRetry(() => import("./pages/SellerReports"));
const SellerTeam = lazyWithRetry(() => import("./pages/SellerTeam"));
const SellerSettings = lazyWithRetry(() => import("./pages/SellerSettings"));
const SellerDiscounts = lazyWithRetry(() => import("./pages/SellerDiscounts"));
const SellerReviews = lazyWithRetry(() => import("./pages/SellerReviews"));
const PrintPortal = lazyWithRetry(() => import("./pages/PrintPortal"));
const Careers = lazyWithRetry(() => import("./pages/Careers"));
const Storefront = lazyWithRetry(() => import("./pages/Storefront"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // Data is fresh for 1 minute
      cacheTime: 300000, // Data stays in memory for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch just because window regained focus
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-terracotta-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
                  Skip to Content
                </a>
                <ScrollToTop />
                <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
                <InstallApp />
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen bg-cream-100 dark:bg-charcoal-900">
                    <div className="w-12 h-12 border-4 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin"></div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success/:id" element={<OrderSuccess />} />
                    <Route path="/track" element={<TrackOrder />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/cookies" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/print-portal" element={<PrintPortal />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/store/:slug" element={<Storefront />} />
                    <Route path="/orders" element={
                      <ProtectedRoute allowedRoles={['customer', 'seller', 'admin', 'cashier', 'owner']}>
                        <OrderHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="/daily-deals" element={<DailyDeals />} />
                    <Route path="/gift-cards" element={<GiftCards />} />
                    <Route path="/unsubscribe" element={<Unsubscribe />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/auth/success" element={<AuthSuccess />} />


                    {/* Seller Routes with Shared Layout */}
                    <Route element={
                      <ProtectedRoute allowedRoles={['seller', 'admin', 'cashier']}>
                        <SellerLayout />
                      </ProtectedRoute>
                    }>
                      <Route path="/seller/dashboard" element={<SellerDashboard />} />
                      <Route path="/seller/pos" element={<SellerPOS />} />
                      <Route path="/seller/products" element={<SellerProducts />} />
                      <Route path="/seller/orders" element={<SellerOrders />} />
                      <Route path="/seller/print-orders" element={<SellerPrintOrders />} />
                      <Route path="/seller/orders/:id" element={<SellerOrderDetails />} />
                      <Route path="/seller/payouts" element={<SellerPayouts />} />
                      <Route path="/seller/profile" element={<SellerProfile />} />
                      <Route path="/seller/abonnes" element={<SellerAbonne />} />
                      <Route path="/seller/reports" element={<SellerReports />} />
                      <Route path="/seller/team" element={<SellerTeam />} />
                      <Route path="/seller/settings" element={<SellerSettings />} />
                      <Route path="/seller/discounts" element={<SellerDiscounts />} />
                      <Route path="/seller/reviews" element={<SellerReviews />} />
                      <Route path="/seller/notifications" element={<SellerNotifications />} />
                      <Route path="/seller/shifts" element={<SellerShifts />} />
                    </Route>

                    <Route path="/become-seller" element={<SellerRegistration />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/logout" element={<Logout />} />

                    <Route path="/dashboard" element={
                      <ProtectedRoute allowedRoles={['customer', 'seller', 'admin', 'cashier', 'owner']}>
                        <UserDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/guest" element={<div>Guest Page</div>} />


                  </Routes>
                </Suspense>

              </Router>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
