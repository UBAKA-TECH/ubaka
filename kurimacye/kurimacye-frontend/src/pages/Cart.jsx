import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatRwf } from "../utils/currency";
import { FaShoppingCart, FaTrashAlt, FaArrowRight, FaTimes, FaStore } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import LandingFooter from "../components/LandingFooter";
import Header from "../components/Header";

import FlashSaleBanner from "../components/FlashSaleBanner";
import assetUrl from "../utils/assetUrl";

export default function CartPage() {
  const { t } = useTranslation();
  const { items, updateQty, removeItem, totals, setFile, applyCoupon, removeCoupon, coupon } = useCart();
  const nav = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState(null);



  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      await applyCoupon(couponCode);
      setCouponMessage({ type: "success", text: t("cart.toast_coupon_success") });
      setCouponCode("");
    } catch (error) {
      setCouponMessage({ type: "error", text: error.response?.data?.message || t("cart.toast_coupon_invalid") });
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      setCouponMessage(null);
    } catch (error) {
    }
  };

  const groupedItems = items.reduce((acc, it, idx) => {
    const sellerId = it.product?.seller?.id || "kuri_macye";
    const sellerName = it.product?.seller?.storeName || it.product?.seller?.name || "Kuri Macye Retail";
    const sellerSlug = it.product?.seller?.storeSlug || it.product?.seller?.id || null;

    if (!acc[sellerId]) acc[sellerId] = { name: sellerName, slug: sellerSlug, items: [] };
    acc[sellerId].items.push({ ...it, originalIdx: idx });
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
      <Header />
      <FlashSaleBanner />

      <main>
        <style>{`
          /* Custom styles for cart text input focus */
          .focus-ring-terracotta:focus {
            outline: none;
            border-color: #E07A5F;
            box-shadow: 0 0 0 2px rgba(224, 122, 95, 0.2);
          }
        `}</style>

        <section className="relative py-8 md:py-10 overflow-hidden bg-white dark:bg-charcoal-800 border-b border-cream-200 dark:border-charcoal-700">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-terracotta-200 dark:bg-terracotta-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-sand-200 dark:bg-sand-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-cream-200 dark:bg-charcoal-700/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal-800 dark:text-white mb-3 flex items-center justify-center gap-3">
              <FaShoppingCart className="text-terracotta-500 dark:text-terracotta-400 animate-pulse text-xl md:text-2xl" /> {t("cart.title")}
            </h1>
            <p className="text-sm md:text-base text-charcoal-600 dark:text-charcoal-400 max-w-2xl mx-auto">
              {t("cart.description")}
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4">
            {items.length === 0 ? (
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-10 md:p-14 text-center shadow-sm border border-cream-200 dark:border-charcoal-700 animate-fade-in max-w-lg mx-auto">
                <div className="w-20 h-20 bg-cream-100 dark:bg-charcoal-700 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <FaShoppingCart className="text-3xl text-charcoal-300 dark:text-charcoal-600" />
                </div>
                <div className="text-xl font-bold text-charcoal-800 dark:text-white mb-3">{t("cart.empty_title")}</div>
                <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-6 max-w-xs mx-auto leading-relaxed">{t("cart.empty_desc")}</p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-terracotta-500/20 active:scale-[0.98]"
                >
                  {t("cart.start_shopping")} <FaArrowRight className="text-xs" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Desktop/Tablet Table View */}
                  <div className="hidden md:block bg-white dark:bg-charcoal-800 rounded-2xl shadow-sm border border-cream-200 dark:border-charcoal-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-cream-50/50 dark:bg-charcoal-700/50 border-b border-cream-200 dark:border-charcoal-700">
                            <th className="px-6 py-4 text-xs font-bold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider">{t("cart.th_product")}</th>
                            <th className="px-6 py-4 text-xs font-bold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider hidden sm:table-cell">{t("cart.th_price")}</th>
                            <th className="px-6 py-4 text-xs font-bold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider text-center">{t("cart.th_qty")}</th>
                            <th className="px-6 py-4 text-xs font-bold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider text-right">{t("cart.th_subtotal")}</th>
                            <th className="px-6 py-4 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cream-50 dark:divide-charcoal-700">
                          {Object.entries(groupedItems).map(([sellerId, group]) => (
                            <React.Fragment key={sellerId}>
                              <tr className="bg-cream-50 dark:bg-charcoal-750/50">
                                <td colSpan="5" className="px-6 py-3 border-y border-cream-200 dark:border-charcoal-700">
                                  {group.slug ? (
                                    <Link to={`/store/${group.slug}`} className="font-bold text-charcoal-800 dark:text-white hover:text-terracotta-500 dark:hover:text-terracotta-400 flex items-center gap-2 text-sm">
                                      <FaStore className="text-terracotta-500" /> {group.name}
                                    </Link>
                                  ) : (
                                    <span className="font-bold text-charcoal-800 dark:text-white flex items-center gap-2 text-sm">
                                      <FaStore className="text-terracotta-500" /> {group.name}
                                    </span>
                                  )}
                                </td>
                              </tr>
                              {group.items.map((it) => (
                                <tr key={it.originalIdx} className="group hover:bg-cream-50/50 dark:hover:bg-charcoal-700/30 transition-colors">
                                  <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="w-16 h-16 bg-cream-50 dark:bg-charcoal-900 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-cream-200 dark:border-charcoal-700 shadow-inner">
                                        {(it.product?.image || it.image) ? (
                                          <img src={assetUrl(it.product?.image || it.image)} alt={it.name} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="text-charcoal-300 dark:text-charcoal-700 text-xs font-bold">IMP</div>
                                        )}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="font-bold text-charcoal-950 dark:text-white group-hover:text-terracotta-500 dark:group-hover:text-terracotta-400 transition-colors mb-1 truncate max-w-[240px] sm:max-w-none">{it.name}</div>
                                        {it.customText && <div className="text-xs text-charcoal-500 dark:text-charcoal-400">Text: <span className="text-terracotta-600 dark:text-terracotta-400 font-medium">{it.customText}</span></div>}
                                        {it.cloudLink && <div className="text-xs text-charcoal-500 dark:text-charcoal-400 truncate max-w-[200px]">Cloud: <span className="text-terracotta-600 dark:text-terracotta-400 font-medium">{it.cloudLink}</span></div>}
                                        <div className="mt-3">
                                          <label className="block text-xs font-bold text-charcoal-500 uppercase mb-1">{t("cart.customization_file")}</label>
                                          <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={(e) => setFile(it.originalIdx, e.target.files?.[0] || null)}
                                            className="block w-full text-xs text-charcoal-600 dark:text-charcoal-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-terracotta-50 dark:file:bg-terracotta-900/10 file:text-terracotta-600 dark:file:text-terracotta-400 hover:file:bg-terracotta-100 cursor-pointer"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 text-sm font-semibold text-charcoal-700 dark:text-charcoal-300 hidden sm:table-cell">
                                    {formatRwf(it.price)}
                                  </td>
                                  <td className="px-6 py-5 text-center">
                                    <input
                                      type="number"
                                      min={1}
                                      value={it.quantity}
                                      onChange={(e) => updateQty(it.originalIdx, parseInt(e.target.value || "1"))}
                                      className="w-14 px-2 py-1.5 bg-cream-50 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-lg text-xs text-center font-bold text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500 outline-none"
                                    />
                                  </td>
                                  <td className="px-6 py-5 text-right text-sm font-bold text-terracotta-500 dark:text-terracotta-400">
                                    {formatRwf(it.subtotal)}
                                  </td>
                                  <td className="px-6 py-5 text-right">
                                    <button
                                      onClick={() => removeItem(it.originalIdx)}
                                      className="p-2 text-charcoal-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all active:scale-90 duration-150"
                                    >
                                      <FaTrashAlt className="text-sm" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile View card layout */}
                  <div className="block md:hidden space-y-6">
                    {Object.entries(groupedItems).map(([sellerId, group]) => (
                      <div key={sellerId} className="space-y-4">
                        <div className="px-2">
                          {group.slug ? (
                            <Link to={`/store/${group.slug}`} className="font-bold text-charcoal-800 dark:text-white hover:text-terracotta-500 dark:hover:text-terracotta-400 flex items-center gap-2 text-sm">
                              <FaStore className="text-terracotta-500" /> {group.name}
                            </Link>
                          ) : (
                            <span className="font-bold text-charcoal-800 dark:text-white flex items-center gap-2 text-sm">
                              <FaStore className="text-terracotta-500" /> {group.name}
                            </span>
                          )}
                        </div>
                        {group.items.map((it) => (
                          <div key={it.originalIdx} className="bg-white dark:bg-charcoal-800 rounded-2xl p-4 border border-cream-200 dark:border-charcoal-700/80 shadow-sm relative space-y-4">
                            <button
                              onClick={() => removeItem(it.originalIdx)}
                              className="absolute top-4 right-4 p-2 text-charcoal-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all active:scale-90 duration-150"
                            >
                              <FaTrashAlt className="text-sm" />
                            </button>

                            <div className="flex gap-4">
                              <div className="w-16 h-16 bg-cream-50 dark:bg-charcoal-900 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-cream-200 dark:border-charcoal-700">
                                {(it.product?.image || it.image) ? (
                                  <img src={assetUrl(it.product?.image || it.image)} alt={it.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="text-charcoal-300 dark:text-charcoal-700 text-xs font-bold">IMP</div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1 pr-6">
                                <h3 className="font-bold text-sm text-charcoal-900 dark:text-white truncate">{it.name}</h3>
                                <p className="text-xs font-bold text-terracotta-500 dark:text-terracotta-400 mt-1">{formatRwf(it.price)}</p>
                                {it.customText && <div className="text-xs text-charcoal-600 dark:text-charcoal-300 mt-1">Text: <span className="text-terracotta-600 dark:text-terracotta-400 font-medium">{it.customText}</span></div>}
                                {it.cloudLink && <div className="text-xs text-charcoal-600 dark:text-charcoal-300 truncate mt-0.5">Cloud: <span className="text-terracotta-600 dark:text-terracotta-400 font-medium">{it.cloudLink}</span></div>}
                              </div>
                            </div>

                            <div className="pt-3 border-t border-cream-100 dark:border-charcoal-750 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-charcoal-400">Qty:</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={it.quantity}
                                  onChange={(e) => updateQty(it.originalIdx, parseInt(e.target.value || "1"))}
                                  className="w-14 px-2 py-1 bg-cream-50 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-lg text-xs text-center font-bold text-charcoal-900 dark:text-white focus:ring-2 focus:ring-terracotta-500 outline-none"
                                />
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-charcoal-500 block font-medium">Subtotal</span>
                                <span className="text-sm font-bold text-terracotta-500 dark:text-terracotta-400">{formatRwf(it.subtotal)}</span>
                              </div>
                            </div>

                            <div className="pt-2">
                              <label className="block text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase mb-1">{t("cart.customization_file")}</label>
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => setFile(it.originalIdx, e.target.files?.[0] || null)}
                                className="block w-full text-xs text-charcoal-600 dark:text-charcoal-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-terracotta-50 dark:file:bg-terracotta-900/10 file:text-terracotta-600 dark:file:text-terracotta-400 hover:file:bg-terracotta-100 cursor-pointer"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                </div>

                  {/* Sidebar Summary */}
                  <aside className="space-y-6 h-fit lg:sticky lg:top-24">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-cream-200 dark:border-charcoal-700">
                      <h2 className="text-lg font-bold text-charcoal-800 dark:text-white mb-5 border-b border-cream-100 dark:border-charcoal-750 pb-3">{t("cart.summary_title")}</h2>
                      
                      <div className="space-y-3.5 mb-5">
                        <div className="flex justify-between items-center text-xs text-charcoal-500 dark:text-charcoal-400 font-medium">
                          <span>{t("cart.summary_items_count")}</span>
                          <span className="font-bold text-charcoal-800 dark:text-white">{totals.itemCount}</span>
                        </div>
                        <div className="flex justify-between items-center py-3.5 border-t border-cream-100 dark:border-charcoal-700">
                          <span className="text-base font-bold text-charcoal-800 dark:text-white">{t("cart.summary_total")}</span>
                          <span className="text-xl font-black text-terracotta-500 dark:text-terracotta-400">{formatRwf(totals.grandTotal || totals.subtotal)}</span>
                        </div>
                        {totals.discount > 0 && (
                          <div className="flex justify-between items-center text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-900/10 p-3 rounded-xl animate-fade-in">
                            <span>{t("cart.summary_discount", { coupon })}</span>
                            <span>-{formatRwf(totals.discount)}</span>
                          </div>
                        )}
                      </div>

                      {/* Coupon Section */}
                      <div className="pt-4 border-t border-cream-100 dark:border-charcoal-700 mb-6">
                        {coupon ? (
                          <div className="flex items-center justify-between bg-terracotta-50 dark:bg-terracotta-900/10 border border-terracotta-100 dark:border-terracotta-900/30 rounded-xl p-3 animate-fade-in">
                            <span className="text-terracotta-600 dark:text-terracotta-400 font-bold text-xs">PROMO: {coupon}</span>
                            <button onClick={handleRemoveCoupon} className="p-1 text-terracotta-500 hover:text-red-500 transition-all active:scale-90 duration-150">
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={t("cart.coupon_placeholder")}
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="flex-1 bg-cream-50 dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-terracotta-500 outline-none transition-all dark:text-white uppercase"
                            />
                            <button
                              onClick={handleApplyCoupon}
                              className="bg-terracotta-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-terracotta-600 transition-all active:scale-95 duration-150"
                            >
                              {t("cart.coupon_apply")}
                            </button>
                          </div>
                        )}
                        {couponMessage && (
                          <p className={`text-xs mt-2 font-bold uppercase tracking-wider ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                            {couponMessage.text}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => nav("/checkout")}
                        className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-terracotta-500/20 hover:shadow-terracotta-500/35 active:scale-95 duration-150 mb-3"
                      >
                        {t("cart.btn_checkout")} <FaArrowRight className="text-xs" />
                      </button>
                      <Link to="/shop" className="block text-center text-xs font-bold text-charcoal-400 hover:text-terracotta-500 transition-colors">
                        {t("cart.btn_continue")}
                      </Link>
                    </div>
                  </aside>
              </div>
            )}

            {/* Cross Sells */}
            {items.some(item => item.product.crossSells?.length > 0) && (
              <div className="mt-16">
                <h2 className="text-lg font-bold text-charcoal-800 dark:text-white mb-6 pr-4">{t("cart.cross_sells_title")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from(new Map(items.flatMap(item => item.product.crossSells || []).map(p => [p.id, p])).values()).map(p => (
                    <Link key={p.id} to={`/product/${p.slug || p.id}`} className="group bg-white dark:bg-charcoal-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-cream-200 dark:border-charcoal-700 flex flex-col h-full">
                      <div className="aspect-square overflow-hidden bg-cream-100 dark:bg-charcoal-900 flex items-center justify-center">
                        {p.image ? (
                          <img src={assetUrl(p.image)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-charcoal-300 dark:text-charcoal-600 bg-cream-50 dark:bg-charcoal-750">
                            <FaShoppingCart className="text-2xl" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-xs text-charcoal-800 dark:text-white mb-1.5 truncate group-hover:text-terracotta-500 dark:group-hover:text-terracotta-400 transition-colors">{p.name}</h3>
                        <div className="text-terracotta-500 dark:text-terracotta-400 font-bold text-sm">{formatRwf(p.price)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
