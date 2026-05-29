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

// Lazy loaded components
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AuthSuccess = lazy(() => import("./pages/AuthSuccess"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Logout = lazy(() => import("./pages/Logout"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const CartPage = lazy(() => import("./pages/Cart"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Home = lazy(() => import("./pages/Home"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const FAQ = lazy(() => import("./pages/FAQ"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const DailyDeals = lazy(() => import("./pages/DailyDeals"));
const SellerOrders = lazy(() => import("./pages/SellerOrders"));
const SellerPrintOrders = lazy(() => import("./pages/SellerPrintOrders"));
const SellerPayouts = lazy(() => import("./pages/SellerPayouts"));
const SellerProfile = lazy(() => import("./pages/SellerProfile"));
const SellerOrderDetails = lazy(() => import("./pages/SellerOrderDetails"));
const SellerNotifications = lazy(() => import("./pages/SellerNotifications"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const GiftCards = lazy(() => import("./pages/GiftCards"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const SellerAbonne = lazy(() => import("./pages/SellerAbonne"));
const SellerShifts = lazy(() => import("./pages/SellerShifts"));
const SellerRegistration = lazy(() => import("./pages/SellerRegistration"));
const SellerPOS = lazy(() => import("./pages/SellerPOS"));
const SellerProducts = lazy(() => import("./pages/SellerProducts"));
const SellerReports = lazy(() => import("./pages/SellerReports"));
const SellerTeam = lazy(() => import("./pages/SellerTeam"));
const SellerSettings = lazy(() => import("./pages/SellerSettings"));
const SellerDiscounts = lazy(() => import("./pages/SellerDiscounts"));
const SellerReviews = lazy(() => import("./pages/SellerReviews"));
const PrintPortal = lazy(() => import("./pages/PrintPortal"));
const Careers = lazy(() => import("./pages/Careers"));

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
