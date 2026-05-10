import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import { FaGift, FaSearch, FaCheckCircle, FaChevronRight, FaShoppingCart, FaTimes, FaEnvelope, FaCoins } from "react-icons/fa";
import { checkGiftCardBalance, getGiftCardProducts } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const GiftCards = () => {
    const [code, setCode] = useState("");
    const [balanceResult, setBalanceResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();
    const { addItem } = useCart();
    const [selectedOption, setSelectedOption] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState("");
    const [customAmount, setCustomAmount] = useState("5000");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic gift card products from API
    const [giftCardOptions, setGiftCardOptions] = useState([]);
    // Fetch gift card products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getGiftCardProducts();
                setGiftCardOptions(response.data || []);
            } catch (error) {
                console.error("Failed to fetch gift card products:", error);
                // Fallback to defaults if API fails
                setGiftCardOptions([
                    { id: "gc25", amount: 25000, label: "Starter", color: "from-violet-500 to-indigo-600" },
                    { id: "gc50", amount: 50000, label: "Premium", color: "from-terracotta-500 to-amber-500" },
                    { id: "gc100", amount: 100000, label: "Luxury", color: "from-charcoal-700 to-charcoal-900" },
                    { id: "gc_custom", amount: 0, label: "Custom", color: "from-emerald-500 to-teal-600", isCustom: true },
                ]);
            }
        };
        fetchProducts();
    }, []);

    const handleCheckBalance = async (e) => {
        e.preventDefault();
        if (!code) return;
        setLoading(true);
        setBalanceResult(null);
        try {
            const res = await checkGiftCardBalance(code);
            if (res.success) {
                setBalanceResult(res.data);
                showSuccess("Balance fetched successfully");
            }
        } catch (err) {
            showError(err.response?.data?.message || "Failed to check balance");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (option) => {
        setSelectedOption(option);
        setIsModalOpen(true);
        if (option.isCustom) {
            setCustomAmount("5000");
        }
    };

    const confirmAddToCart = async (e) => {
        e.preventDefault();

        if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
            showError("Please enter a valid recipient email");
            return;
        }

        let amount = selectedOption.amount;
        if (selectedOption.isCustom) {
            amount = parseInt(customAmount);
            if (isNaN(amount) || amount <= 0) {
                showError("Please enter a valid amount");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await addItem("6966312f8e1d936f086dd907", {
                price: amount,
                customText: `Recipient: ${recipientEmail}`,
            });
            setIsModalOpen(false);
            setRecipientEmail("");
            setCustomAmount("5000");
            showSuccess("Gift Card added to cart!");
        } catch (err) {
            showError("Failed to add gift card to cart");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatRwf = (amount) => {
        const n = Number(amount || 0);
        return `${n.toLocaleString()} RWF`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden bg-charcoal-900 text-white">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(167,139,250,0.3),transparent)]"></div>
                    </div>
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <FaGift className="text-6xl text-amber-400 mx-auto mb-6 animate-bounce" />
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">The Perfect Gift for <span className="text-amber-400">Everyone</span></h1>
                        <p className="text-xl text-charcoal-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Give the gift of choice with an Impressa Gift Card. Deliver instantly via email or schedule for the perfect moment.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a href="#buy-cards" className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-terracotta-500/20">Buy Now</a>
                            <a href="#check-balance" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold backdrop-blur-sm transition-all border border-white/30">Check Balance</a>
                        </div>
                    </div>
                </section>

                {/* Gift Card Grid */}
                <section id="buy-cards" className="py-24 container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-charcoal-900 dark:text-white mb-4">Choose Your Amount</h2>
                        <p className="text-charcoal-500 dark:text-charcoal-400">Select a preset amount or choose your own</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {giftCardOptions.map((opt) => (
                            <div key={opt.id || opt.id} className="group relative bg-white dark:bg-slate-900 rounded-3xl p-1 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-slate-800">
                                <div className={`aspect-[1.6/1] rounded-2xl bg-gradient-to-br ${opt.color} p-6 flex flex-col justify-between text-white relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <div className="z-10">
                                        <div className="text-sm font-medium opacity-80 uppercase tracking-widest">{opt.label}</div>
                                        <div className="text-3xl font-black mt-1">Impressa</div>
                                    </div>
                                    <div className="z-10 flex justify-between items-end">
                                        <div className="text-2xl font-bold">{opt.isCustom ? "Custom" : formatRwf(opt.amount)}</div>
                                        <FaGift className="text-3xl opacity-30" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <button
                                        onClick={() => handleAddToCart(opt)}
                                        className="w-full bg-charcoal-900 dark:bg-white dark:text-charcoal-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-terracotta-500 dark:hover:bg-terracotta-500 hover:text-white transition-all transform active:scale-95 shadow-md"
                                    >
                                        <FaShoppingCart className="text-lg" />
                                        Buy Card
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Balance Checker Section */}
                <section id="check-balance" className="py-24 bg-cream-50 dark:bg-slate-900/50 border-y border-gray-100 dark:border-slate-800">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-slate-800">
                            <div className="md:w-1/2 bg-charcoal-900 p-12 text-white flex flex-col justify-center relative">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                                    <FaGift className="text-[20rem] absolute -bottom-20 -left-20 rotate-12" />
                                </div>
                                <h2 className="text-3xl font-bold mb-6">Manage Your Card</h2>
                                <p className="text-charcoal-400 leading-relaxed mb-8">Enter your unique code to check your remaining balance or view its status.</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-charcoal-300">
                                        <FaCheckCircle className="text-emerald-500 shrink-0" />
                                        <span>Instant verification</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-charcoal-300">
                                        <FaCheckCircle className="text-emerald-500 shrink-0" />
                                        <span>Safe and secure</span>
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-1/2 p-12">
                                <form onSubmit={handleCheckBalance} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-charcoal-800 dark:text-white uppercase tracking-wider mb-2">Gift Card Code</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                placeholder="IMPR-XXXX-XXXX"
                                                className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-mono text-lg focus:ring-4 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all outline-none"
                                            />
                                            <button
                                                type="submit"
                                                disabled={loading || !code}
                                                className="absolute right-2 top-2 bottom-2 bg-charcoal-900 dark:bg-white dark:text-charcoal-900 text-white px-6 rounded-xl font-bold flex items-center gap-2 hover:bg-terracotta-500 dark:hover:bg-terracotta-500 hover:text-white transition-all disabled:opacity-50"
                                            >
                                                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaSearch />}
                                                Check
                                            </button>
                                        </div>
                                    </div>

                                    {balanceResult && (
                                        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl animate-fade-in-up">
                                            <div className="text-sm text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Available Balance</div>
                                            <div className="text-4xl font-black text-charcoal-900 dark:text-white mb-4">{formatRwf(balanceResult.balance)}</div>
                                            <div className="flex justify-between items-center text-xs text-charcoal-500 dark:text-charcoal-400 border-t border-emerald-100 dark:border-emerald-800 pt-4">
                                                <span>Expires: {new Date(balanceResult.expiryDate).toLocaleDateString()}</span>
                                                <Link to="/shop" className="text-terracotta-500 font-bold flex items-center gap-1 hover:underline">Shop Now <FaChevronRight className="text-[10px]" /></Link>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />

            {/* Premium Purchase Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-md transition-opacity animate-fade-in"
                        onClick={() => !isSubmitting && setIsModalOpen(false)}
                    ></div>

                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-800 p-8 md:p-10 animate-scale-in">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-terracotta-500 transition-colors"
                        >
                            <FaTimes />
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedOption?.color} text-white shadow-lg`}>
                                <FaGift className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-charcoal-900 dark:text-white">Customize Gift Card</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOption?.label} Edition</p>
                            </div>
                        </div>

                        <form onSubmit={confirmAddToCart} className="space-y-6">
                            {selectedOption?.isCustom && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Amount (RWF)</label>
                                    <div className="relative">
                                        <FaCoins className="absolute left-4 top-1/2 -translate-y-1/2 text-terracotta-500" />
                                        <input
                                            type="number"
                                            required
                                            min="1000"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-charcoal-900 dark:text-white focus:ring-4 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all outline-none text-lg font-bold"
                                            placeholder="e.g. 5000"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Recipient Email</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-terracotta-500" />
                                    <input
                                        type="email"
                                        required
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-charcoal-900 dark:text-white focus:ring-4 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all outline-none"
                                        placeholder="friend@example.com"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 px-1">We'll send the digital card to this email after purchase.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${isSubmitting ? 'bg-gray-200 dark:bg-slate-800 text-gray-400' : 'bg-terracotta-500 text-white shadow-terracotta-500/25 hover:shadow-terracotta-500/40 hover:-translate-y-1'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Adding to Cart...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Add {selectedOption?.isCustom ? formatRwf(customAmount) : formatRwf(selectedOption?.amount)} to Cart</span>
                                        <FaShoppingCart />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GiftCards;
