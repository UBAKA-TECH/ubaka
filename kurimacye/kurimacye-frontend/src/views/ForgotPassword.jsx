import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Link } from "react-router-dom";
import { FaEnvelope, FaKey, FaArrowRight, FaArrowLeft, FaSpinner, FaLock } from "react-icons/fa";
import TrendingProductsSidebar from "../components/TrendingProductsSidebar";
import SEO from "../components/SEO";

function ForgotPassword() {
  const [step, setStep] = useState("request"); // "request" or "reset"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setSuccess("Reset code sent! Please check your email for the 6-digit code.");
      setStep("reset");
    } catch (err) {
      setError(err.message || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 1. Verify the OTP code
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'recovery'
      });
      if (verifyError) throw verifyError;

      // 2. Update the password (now authenticated)
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      if (updateError) throw updateError;

      setSuccess("Password reset successfully! Redirecting you to login...");
      setTimeout(() => {
        // Clear local storage session and redirect
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError(err.message || "Password reset failed. Please verify your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      <SEO title="Reset Password" noindex={true} />
      {/* Left Side - Trending Products Sidebar */}
      <TrendingProductsSidebar />

      {/* Right Side - Forgot Password Form */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 relative overflow-hidden">
        {/* Animated Background Blobs clipped */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Fixed Top Navigation Bar */}
        <div className="w-full px-8 py-6 flex items-center justify-between shrink-0 z-20">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:text-violet-600 dark:hover:text-violet-400 transition-colors group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>
        </div>

        {/* Form Centered Container with inner scrolling */}
        <div className="flex-1 overflow-y-auto z-10 min-h-0 w-full">
          <div className="min-h-full w-full flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16 py-8">
            <div className="w-full max-w-md space-y-4">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
                  Reset Password
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {step === "request" 
                    ? "Enter your email to receive a reset code." 
                    : `Enter the code sent to ${email} and your new password.`}
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-2xl flex items-start gap-3 animate-head-shake">
                  <FaEnvelope className="text-red-500 mt-1 shrink-0" />
                  <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 font-bold leading-tight">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/10 border-l-4 border-emerald-500 rounded-r-2xl flex items-start gap-3">
                  <FaKey className="text-emerald-500 mt-1 shrink-0" />
                  <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-bold leading-tight">{success}</p>
                </div>
              )}

              {step === "request" ? (
                <form className="space-y-4" onSubmit={handleRequest}>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-violet-600 transition-colors">
                        <FaEnvelope />
                      </div>
                      <input
                        name="email"
                        type="email"
                        required
                        className="block w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all shadow-inner text-sm"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-violet-600 text-white rounded-2xl font-black text-base hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/10 dark:shadow-none active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                      {loading ? <FaSpinner className="animate-spin text-lg" /> : "Send Reset Code"}
                      {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <Link to="/login" className="text-xs font-black text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors flex items-center justify-center gap-2">
                      <FaArrowLeft className="text-xs" /> Back to Login
                    </Link>
                  </div>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleResetSubmit}>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Reset Code</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-violet-600 transition-colors">
                        <FaKey />
                      </div>
                      <input
                        name="code"
                        type="text"
                        required
                        maxLength={6}
                        className="block w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all shadow-inner text-sm tracking-widest font-black text-center"
                        placeholder="123456"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-violet-600 transition-colors">
                        <FaLock />
                      </div>
                      <input
                        name="password"
                        type="password"
                        required
                        className="block w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all shadow-inner text-sm"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Confirm New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-violet-600 transition-colors">
                        <FaLock />
                      </div>
                      <input
                        name="confirmPassword"
                        type="password"
                        required
                        className="block w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all shadow-inner text-sm"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-violet-600 text-white rounded-2xl font-black text-base hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/10 dark:shadow-none active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                      {loading ? <FaSpinner className="animate-spin text-lg" /> : "Reset Password"}
                      {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </div>

                  <div className="text-center pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep("request");
                        setError("");
                        setSuccess("");
                      }}
                      className="text-xs font-black text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaArrowLeft className="text-xs" /> Back to Email Entry
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
