import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../utils/supabaseClient";
import { FaEnvelope, FaLock, FaArrowRight, FaShieldAlt, FaArrowLeft, FaGoogle } from "react-icons/fa";
import TrendingProductsSidebar from "../components/TrendingProductsSidebar";
import SEO from "../components/SEO";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mergeCart } = useCart();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle hash errors (like otp_expired) or recovery redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const errorCode = params.get('error_code');
      const errorDescription = params.get('error_description');
      const type = params.get('type');

      if (errorCode === 'otp_expired') {
        setError("Your email link has expired. Please try signing in below; if your email isn't confirmed, we'll help you resend the link.");
      } else if (errorDescription) {
        setError(errorDescription.replace(/\+/g, ' '));
      } else if (type === 'recovery') {
        // Clear hash before redirecting to keep clean URL
        window.history.replaceState(null, null, window.location.pathname);
        navigate("/dashboard", { state: { showPasswordReset: true }, replace: true });
        return;
      }
      
      // Clean up hash to avoid showing error on refresh
      window.history.replaceState(null, null, window.location.pathname);
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    // Note: Google login via Supabase
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setError(error.message);
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      
      // Cart merging
      try { await mergeCart(); } catch (e) { }

      // Smart redirection based on role
      const from = location.state?.from?.pathname;
      const role = localStorage.getItem('userRole') || 'customer';

      if (from) {
        navigate(from, { replace: true });
      } else if (role === "admin" || role === "owner") {
        navigate("/dashboard");
      } else if (role === "seller" || role === "cashier") {
        navigate("/seller/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes('email not confirmed')) {
        setError(
          <div className="flex flex-col gap-2">
            <span>Your email is not confirmed yet.</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: form.email,
                    options: {
                      emailRedirectTo: `${window.location.origin}/login`
                    }
                  });
                  if (error) throw error;
                  setError("A new verification link has been sent to your email!");
                } catch (resendErr) {
                  setError("Failed to resend link: " + resendErr.message);
                }
              }}
              className="text-terracotta-500 underline text-left hover:text-terracotta-400 transition-colors"
            >
              Click here to resend the verification link
            </button>
          </div>
        );
      } else {
        setError(err.message || "Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-charcoal-900 transition-colors duration-300">
      <SEO title="Login" noindex={true} />
      {/* Left Side - Trending Products */}
      <TrendingProductsSidebar />

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-charcoal-900 relative overflow-hidden">
        {/* Decorative background elements for dark mode clipped inside */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta-500/5 dark:bg-terracotta-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sand-500/5 dark:bg-sand-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Fixed Top Navigation Bar */}
        <div className="w-full px-8 py-6 flex items-center justify-between shrink-0 z-20">
          <Link
            to="/"
            className="flex items-center gap-2 text-charcoal-500 dark:text-charcoal-400 font-bold hover:text-terracotta-500 dark:hover:text-terracotta-400 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
        </div>

        {/* Form Centered Container with inner scrolling */}
        <div className="flex-1 overflow-y-auto z-10 min-h-0 w-full">
          <div className="min-h-full w-full flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16 py-8">
            <div className="w-full max-w-md space-y-4">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-charcoal-800 dark:text-white tracking-tight mb-1">
                  Welcome Back
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-500 dark:text-charcoal-400 font-medium">
                  Sign in to access your dashboard.
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-terracotta-50 dark:bg-terracotta-900/10 border-l-4 border-terracotta-500 rounded-r-2xl flex items-start gap-3 animate-head-shake">
                  <FaShieldAlt className="text-terracotta-500 mt-1 shrink-0" />
                  <p className="text-xs sm:text-sm text-terracotta-700 dark:text-terracotta-400 font-bold leading-tight">{error}</p>
                </div>
              )}

              <form className="space-y-3.5" onSubmit={handleCredentialsSubmit}>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-700 dark:text-charcoal-300 ml-1">Email address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-400 group-focus-within:text-terracotta-500 transition-colors">
                      <FaEnvelope />
                    </div>
                    <input
                      name="email"
                      type="email"
                      required
                      className="block w-full pl-12 pr-4 py-2 bg-cream-100 dark:bg-charcoal-800 border border-cream-200 dark:border-charcoal-700 rounded-2xl text-charcoal-800 dark:text-white placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all shadow-inner text-sm"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-charcoal-700 dark:text-charcoal-300 ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-400 group-focus-within:text-terracotta-500 transition-colors">
                      <FaLock />
                    </div>
                    <input
                      name="password"
                      type="password"
                      required
                      className="block w-full pl-12 pr-4 py-2 bg-cream-100 dark:bg-charcoal-800 border border-cream-200 dark:border-charcoal-700 rounded-2xl text-charcoal-800 dark:text-white placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all shadow-inner text-sm"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-1 py-1">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-terracotta-500 focus:ring-terracotta-500 border-charcoal-300 rounded cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-charcoal-800 dark:text-charcoal-300 cursor-pointer">
                      Remember me
                    </label>
                  </div>

                  <Link to="/forgot-password" size="sm" className="text-xs font-bold text-terracotta-500 dark:text-terracotta-400 hover:text-terracotta-400 transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <div className="pt-1.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 py-2.5 px-6 bg-terracotta-500 text-white rounded-2xl font-black text-sm hover:bg-terracotta-600 transition-all shadow-lg shadow-terracotta-500/10 dark:shadow-none active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                    {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
                  </button>

                  <div className="relative my-3 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-cream-200 dark:border-charcoal-700"></div>
                    </div>
                    <div className="relative bg-white dark:bg-charcoal-900 px-4 inline-block">
                      <span className="text-sm font-bold text-charcoal-400 uppercase tracking-widest text-[9px]">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-6 bg-white dark:bg-charcoal-800 border border-cream-200 dark:border-charcoal-700 rounded-2xl text-charcoal-700 dark:text-charcoal-300 font-bold hover:bg-cream-100 dark:hover:bg-charcoal-700/50 transition-all active:scale-[0.99] shadow-sm text-xs"
                  >
                    <FaGoogle className="text-terracotta-500 text-base" />
                    Continue with Google
                  </button>
                </div>

                <p className="mt-3 text-center text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-black text-terracotta-500 dark:text-terracotta-400 hover:text-terracotta-400 transition-colors">
                    Create one now
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
