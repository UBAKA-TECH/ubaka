import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import { FaGift, FaSearch, FaCheckCircle, FaChevronRight, FaShoppingCart, FaTimes, FaEnvelope, FaCoins } from "react-icons/fa";
import { checkGiftCardBalance, getGiftCardProducts } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const GiftCards = () => {
    const { t } = useTranslation();
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
                showSuccess(t("gift_cards.toast_balance_success"));
            }
        } catch (err) {
            showError(err.response?.data?.message || t("gift_cards.toast_balance_fail"));
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
            showError(t("gift_cards.modal_err_email"));
            return;
        }

        let amount = selectedOption.amount;
        if (selectedOption.isCustom) {
            amount = parseInt(customAmount);
            if (isNaN(amount) || amount <= 0) {
                showError(t("gift_cards.modal_err_amount"));
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
            showSuccess(t("gift_cards.toast_cart_success"));
        } catch (err) {
            showError(t("gift_cards.toast_cart_fail"));
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
                <section className="relative py-10 md:py-14 overflow-hidden bg-charcoal-900 text-white">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(167,139,250,0.3),transparent)]"></div>
                    </div>
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <FaGift className="text-4xl text-amber-400 mx-auto mb-4 animate-bounce" />
                        <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">{t("gift_cards.hero_title")}<span className="text-amber-400">{t("gift_cards.hero_highlight")}</span></h1>
                        <p className="text-sm text-charcoal-300 max-w-xl mx-auto mb-6 leading-relaxed">
                            {t("gift_cards.hero_desc")}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <a href="#buy-cards" className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-terracotta-500/20">{t("gift_cards.cta_buy")}</a>
                            <a href="#check-balance" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-bold text-sm backdrop-blur-sm transition-all border border-white/30">{t("gift_cards.cta_balance")}</a>
                        </div>
                    </div>
                </section>

                {/* Gift Card Grid */}
                <section id="buy-cards" className="py-10 container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-charcoal-900 dark:text-white mb-2">{t("gift_cards.choose_amount")}</h2>
                        <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{t("gift_cards.choose_amount_desc")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {giftCardOptions.map((opt) => (
                            <div key={opt.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-slate-800">
                                <div className={`aspect-[1.6/1] rounded-xl bg-gradient-to-br ${opt.color} p-4 flex flex-col justify-between text-white relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
                                    <div className="z-10">
                                        <div className="text-xs font-medium opacity-80 uppercase tracking-widest">{opt.label === "Custom" ? t("gift_cards.custom") : opt.label}</div>
                                        <div className="text-xl font-black mt-0.5">{t("gift_cards.card_title")}</div>
                                    </div>
                                    <div className="z-10 flex justify-between items-end">
                                        <div className="text-base font-bold">{opt.isCustom ? t("gift_cards.custom") : formatRwf(opt.amount)}</div>
                                        <FaGift className="text-xl opacity-30" />
                                    </div>
                                </div>
                                <div className="p-3">
                                    <button
                                        onClick={() => handleAddToCart(opt)}
                                        className="w-full bg-charcoal-900 dark:bg-white dark:text-charcoal-900 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-terracotta-500 dark:hover:bg-terracotta-500 hover:text-white transition-all transform active:scale-95 shadow-sm"
                                    >
                                        <FaShoppingCart className="text-sm" />
                                        {t("gift_cards.buy_card")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Balance Checker Section */}
                <section id="check-balance" className="py-10 bg-cream-50 dark:bg-slate-900/50 border-y border-gray-100 dark:border-slate-800">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-slate-800">
                            <div className="md:w-1/2 bg-charcoal-900 p-7 text-white flex flex-col justify-center relative">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                                    <FaGift className="text-[12rem] absolute -bottom-10 -left-10 rotate-12" />
                                </div>
                                <h2 className="text-xl font-bold mb-3">{t("gift_cards.manage_card")}</h2>
                                <p className="text-sm text-charcoal-400 leading-relaxed mb-5">{t("gift_cards.manage_card_desc")}</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-charcoal-300">
                                        <FaCheckCircle className="text-emerald-500 shrink-0" />
                                        <span>{t("gift_cards.instant_verify")}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-charcoal-300">
                                        <FaCheckCircle className="text-emerald-500 shrink-0" />
                                        <span>{t("gift_cards.safe_secure")}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-1/2 p-7">
                                <form onSubmit={handleCheckBalance} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-charcoal-800 dark:text-white uppercase tracking-wider mb-1.5">{t("gift_cards.code_label")}</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                placeholder="IMPR-XXXX-XXXX"
                                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 font-mono text-sm focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all outline-none"
                                            />
                                            <button
                                                type="submit"
                                                disabled={loading || !code}
                                                className="absolute right-1.5 top-1.5 bottom-1.5 bg-charcoal-900 dark:bg-white dark:text-charcoal-900 text-white px-4 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:bg-terracotta-500 dark:hover:bg-terracotta-500 hover:text-white transition-all disabled:opacity-50"
                                            >
                                                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaSearch />}
                                                {t("gift_cards.btn_check")}
                                            </button>
                                        </div>
                                    </div>

                                    {balanceResult && (
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl animate-fade-in-up">
                                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">{t("gift_cards.available_balance")}</div>
                                            <div className="text-2xl font-black text-charcoal-900 dark:text-white mb-3">{formatRwf(balanceResult.balance)}</div>
                                            <div className="flex justify-between items-center text-xs text-charcoal-500 dark:text-charcoal-400 border-t border-emerald-100 dark:border-emerald-800 pt-3">
                                                <span>{t("gift_cards.expires")} {new Date(balanceResult.expiryDate).toLocaleDateString()}</span>
                                                <Link to="/shop" className="text-terracotta-500 font-bold flex items-center gap-1 hover:underline">{t("gift_cards.shop_now")} <FaChevronRight className="text-[10px]" /></Link>
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

                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-800 p-6 animate-scale-in">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-terracotta-500 transition-colors"
                        >
                            <FaTimes className="text-xs" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedOption?.color} text-white shadow-md`}>
                                <FaGift className="text-base" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">{t("gift_cards.modal_title")}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedOption?.label === "Custom" ? t("gift_cards.custom") : selectedOption?.label} {t("gift_cards.modal_edition")}</p>
                            </div>
                        </div>

                        <form onSubmit={confirmAddToCart} className="space-y-4">
                            {selectedOption?.isCustom && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{t("gift_cards.modal_amount")}</label>
                                    <div className="relative">
                                        <FaCoins className="absolute left-3 top-1/2 -translate-y-1/2 text-terracotta-500 text-sm" />
                                        <input
                                            type="number"
                                            required
                                            min="1000"
                                            value={customAmount}
                                            onChange={(e) => setCustomAmount(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all outline-none text-sm font-bold"
                                            placeholder="e.g. 5000"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{t("gift_cards.modal_recipient")}</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-terracotta-500 text-sm" />
                                    <input
                                        type="email"
                                        required
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 transition-all outline-none text-sm"
                                        placeholder="friend@example.com"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 px-1">{t("gift_cards.modal_recipient_helper")}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-xl font-black text-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-200 dark:bg-slate-800 text-gray-400' : 'bg-terracotta-500 text-white shadow-terracotta-500/25 hover:shadow-terracotta-500/40 hover:-translate-y-0.5'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                        <span>{t("gift_cards.modal_btn_adding")}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{t("gift_cards.modal_btn_add", { amount: selectedOption?.isCustom ? formatRwf(customAmount) : formatRwf(selectedOption?.amount) })}</span>
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
