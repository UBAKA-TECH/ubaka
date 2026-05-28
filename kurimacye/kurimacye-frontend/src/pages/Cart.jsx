import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatRwf } from "../utils/currency";
import { FaShoppingCart, FaTrashAlt, FaArrowRight, FaTimes } from "react-icons/fa";
import LandingFooter from "../components/LandingFooter";
import Header from "../components/Header";

import FlashSaleBanner from "../components/FlashSaleBanner";
import assetUrl from "../utils/assetUrl";

export default function CartPage() {
  const { items, updateQty, removeItem, totals, setFile, applyCoupon, removeCoupon, coupon } = useCart();
  const nav = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState(null);



  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      await applyCoupon(couponCode);
      setCouponMessage({ type: "success", text: "Promo code applied successfully!" });
      setCouponCode("");
    } catch (error) {
      setCouponMessage({ type: "error", text: error.response?.data?.message || "Invalid promo code" });
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      setCouponMessage(null);
    } catch (error) {
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Header />
      <FlashSaleBanner />

      <main>
        <style>{`
          /* Custom styles for cart text input focus */
          .focus-ring-violet:focus {
            outline: none;
            border-color: #7c3aed;
            box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
          }
        `}</style>

        <section className="relative py-8 md:py-10 overflow-hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-violet-200 dark:bg-violet-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-fuchsia-200 dark:bg-fuchsia-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-200 dark:bg-blue-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-3">
              <FaShoppingCart className="text-violet-600 animate-pulse text-xl md:text-2xl" /> Your Shopping Cart
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Review your items, make any changes, and proceed to checkout.
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4">
            {items.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 md:p-14 text-center shadow-sm border border-gray-105 dark:border-slate-800 animate-fade-in max-w-lg mx-auto">
                <div className="w-20 h-20 bg-gray-55 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <FaShoppingCart className="text-3xl text-gray-300 dark:text-gray-600" />
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white mb-3">Your cart is empty</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto leading-relaxed">Time to find some amazing products and fill it up!</p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-violet-500/20 active:scale-[0.98]"
                >
                  Start Shopping <FaArrowRight className="text-xs" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Desktop/Tablet Table View */}
                  <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:table-cell">Price</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Qty</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Subtotal</th>
                            <th className="px-6 py-4 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                          {items.map((it, idx) => (
                            <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-gray-50 dark:bg-slate-950 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-slate-800 shadow-inner">
                                    {(it.product?.image || it.image) ? (
                                      <img src={assetUrl(it.product?.image || it.image)} alt={it.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="text-gray-300 dark:text-slate-700 text-xs font-bold">IMP</div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-gray-950 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-1 truncate max-w-[240px] sm:max-w-none">{it.name}</div>
                                    {it.customText && <div className="text-xs text-gray-500 dark:text-gray-400">Text: <span className="text-violet-650 dark:text-violet-400 font-medium">{it.customText}</span></div>}
                                    {it.cloudLink && <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">Cloud: <span className="text-violet-650 dark:text-violet-400 font-medium">{it.cloudLink}</span></div>}
                                    <div className="mt-3">
                                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Customization file</label>
                                      <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setFile(idx, e.target.files?.[0] || null)}
                                        className="block w-full text-[10px] text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-violet-50 dark:file:bg-violet-950/30 file:text-violet-750 dark:file:text-violet-400 hover:file:bg-violet-100 cursor-pointer"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                                {formatRwf(it.price)}
                              </td>
                              <td className="px-6 py-5 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  value={it.quantity}
                                  onChange={(e) => updateQty(idx, parseInt(e.target.value || "1"))}
                                  className="w-14 px-2 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-center font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                />
                              </td>
                              <td className="px-6 py-5 text-right text-sm font-bold text-violet-600 dark:text-violet-400">
                                {formatRwf(it.subtotal)}
                              </td>
                              <td className="px-6 py-5 text-right">
                                <button
                                  onClick={() => removeItem(idx)}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all active:scale-90 duration-150"
                                >
                                  <FaTrashAlt className="text-sm" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile View card layout */}
                  <div className="block md:hidden space-y-4">
                    {items.map((it, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800/80 shadow-sm relative space-y-4">
                        <button
                          onClick={() => removeItem(idx)}
                          className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all active:scale-90 duration-150"
                        >
                          <FaTrashAlt className="text-sm" />
                        </button>

                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-50 dark:bg-slate-950 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-slate-800">
                            {(it.product?.image || it.image) ? (
                              <img src={assetUrl(it.product?.image || it.image)} alt={it.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-gray-300 dark:text-slate-700 text-xs font-bold">IMP</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pr-6">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">{it.name}</h3>
                            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mt-1">{formatRwf(it.price)}</p>
                            {it.customText && <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Text: <span className="text-violet-605 dark:text-violet-400 font-medium">{it.customText}</span></div>}
                            {it.cloudLink && <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">Cloud: <span className="text-violet-605 dark:text-violet-400 font-medium">{it.cloudLink}</span></div>}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-50 dark:border-slate-800/60 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Qty:</span>
                            <input
                              type="number"
                              min={1}
                              value={it.quantity}
                              onChange={(e) => updateQty(idx, parseInt(e.target.value || "1"))}
                              className="w-14 px-2 py-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs text-center font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                            />
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-450 block font-medium">Subtotal</span>
                            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{formatRwf(it.subtotal)}</span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className="block text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Customization file</label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => setFile(idx, e.target.files?.[0] || null)}
                            className="block w-full text-[10px] text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-[9px] file:font-semibold file:bg-violet-50 dark:file:bg-violet-950/30 file:text-violet-750 dark:file:text-violet-400 hover:file:bg-violet-100 cursor-pointer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Sidebar Summary */}
                <aside className="space-y-6 h-fit lg:sticky lg:top-24">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 border-b border-gray-50 dark:border-slate-800 pb-3">Order Summary</h2>
                    
                    <div className="space-y-3.5 mb-5">
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                        <span>Items Count</span>
                        <span className="font-bold text-gray-900 dark:text-white">{totals.itemCount}</span>
                      </div>
                      <div className="flex justify-between items-center py-3.5 border-t border-gray-50 dark:border-slate-800">
                        <span className="text-base font-bold text-gray-900 dark:text-white">Order Total</span>
                        <span className="text-xl font-black text-violet-600 dark:text-violet-400">{formatRwf(totals.grandTotal || totals.subtotal)}</span>
                      </div>
                      {totals.discount > 0 && (
                        <div className="flex justify-between items-center text-green-600 dark:text-green-400 text-xs font-bold bg-green-50 dark:bg-green-900/10 p-3 rounded-xl animate-fade-in">
                          <span>Discount Applied ({coupon})</span>
                          <span>-{formatRwf(totals.discount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Coupon Section */}
                    <div className="pt-4 border-t border-gray-50 dark:border-slate-800 mb-6">
                      {coupon ? (
                        <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl p-3 animate-fade-in">
                          <span className="text-violet-750 dark:text-violet-400 font-bold text-xs">PROMO: {coupon}</span>
                          <button onClick={handleRemoveCoupon} className="p-1 text-violet-450 hover:text-red-500 transition-all active:scale-90 duration-150">
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Promo code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-violet-500 outline-none transition-all dark:text-white uppercase"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-violet-650 transition-all active:scale-95 duration-150"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                      {couponMessage && (
                        <p className={`text-[9px] mt-2 font-bold uppercase tracking-wider ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                          {couponMessage.text}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => nav("/checkout")}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-500/20 hover:shadow-violet-500/35 active:scale-95 duration-150 mb-3"
                    >
                      Proceed to Checkout <FaArrowRight className="text-xs" />
                    </button>
                    <Link to="/shop" className="block text-center text-xs font-bold text-gray-400 hover:text-violet-600 transition-colors">
                      Continue Shopping
                    </Link>
                  </div>
                </aside>
              </div>
            )}

            {/* Cross Sells */}
            {items.some(item => item.product.crossSells?.length > 0) && (
              <div className="mt-16">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 pr-4">Complete your order</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from(new Map(items.flatMap(item => item.product.crossSells || []).map(p => [p.id, p])).values()).map(p => (
                    <Link key={p.id} to={`/product/${p.slug || p.id}`} className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-slate-800 flex flex-col h-full">
                      <div className="aspect-square overflow-hidden bg-gray-55 dark:bg-slate-950 flex items-center justify-center">
                        {p.image ? (
                          <img src={assetUrl(p.image)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-700 bg-gray-100 dark:bg-slate-850">
                            <FaShoppingCart className="text-2xl" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex-grow flex flex-col justify-between">
                        <h3 className="font-bold text-xs text-gray-900 dark:text-white mb-1.5 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{p.name}</h3>
                        <div className="text-violet-600 dark:text-violet-400 font-bold text-sm">{formatRwf(p.price)}</div>
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
