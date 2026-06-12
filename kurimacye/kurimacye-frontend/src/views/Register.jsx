import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { useToast } from "../context/ToastContext";
import {
    FaUser, FaEnvelope, FaLock, FaArrowRight, FaArrowLeft, FaGoogle,
    FaExclamationTriangle, FaStore
} from "react-icons/fa";
import TrendingProductsSidebar from "../components/TrendingProductsSidebar";
import SEO from "../components/SEO";

function Register() {
    const navigate = useNavigate();
    const { showSuccess } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) setError(error.message);
    };

    const validateForm = () => {
        setError("");
        if (!formData.name.trim()) {
            setError("Full name is required");
            return false;
        }
        if (!formData.email.trim()) {
            setError("Email is required");
            return false;
        }
        if (!formData.password) {
            setError("Password is required");
            return false;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const { error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.name,
                        role: "customer"
                    }
                }
            });

            if (authError) throw authError;

            // Registration successful
            showSuccess("Registration successful! Please check your email if confirmation is required, then login.");
            navigate("/login");
            
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
            <SEO title="Register" noindex={true} />
            <TrendingProductsSidebar />

            <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
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
                <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16 pb-8 overflow-y-auto z-10 min-h-0">
                    <div className="w-full max-w-md my-auto space-y-4">
                        <div className="text-center lg:text-left">
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
                                Create Account
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Join Kuri Macye to start shopping for amazing products.</p>
                        </div>

                        {error && (
                            <div className="p-3.5 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-2xl flex items-start gap-3 animate-head-shake">
                                <FaExclamationTriangle className="text-red-500 mt-1 shrink-0" />
                                <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 font-bold leading-tight">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="space-y-3 animate-fade-in-right">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-violet-600 transition-colors">
                                            <FaUser />
                                        </div>
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            className="block w-full pl-12 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all shadow-inner text-sm"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

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
                                            className="block w-full pl-12 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all shadow-inner text-sm"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-violet-600 transition-colors">
                                            <FaLock />
                                        </div>
                                        <input
                                            name="password"
                                            type="password"
                                            required
                                            className="block w-full pl-12 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all shadow-inner text-sm"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-violet-600 transition-colors">
                                            <FaLock />
                                        </div>
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            className="block w-full pl-12 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all shadow-inner text-sm"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-1.5">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-violet-600/10 dark:shadow-none transition-all active:scale-[0.99] flex items-center justify-center gap-2 group"
                                >
                                    {loading ? "Creating..." : "Create Account"} 
                                    {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </div>
                        </form>

                        <div className="mt-3">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white dark:bg-slate-950 text-gray-500 font-bold uppercase tracking-widest text-[9px]">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-2.5">
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-gray-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-[0.99] shadow-sm"
                                >
                                    <FaGoogle className="text-red-500 text-base" />
                                    Continue with Google
                                </button>
                            </div>
                        </div>
                        
                        <div className="mt-4 text-center space-y-3">
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                Already have an account?{" "}
                                <Link to="/login" className="font-black text-violet-600 hover:text-violet-500 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                            
                            <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
                                <Link to="/become-seller" className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-500 rounded-full text-[10px] font-bold hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors">
                                    <FaStore /> Want to sell on Kuri Macye? Become a Seller
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
