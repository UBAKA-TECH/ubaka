import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatRwf } from "../utils/currency";
import { FaShoppingCart, FaTrashAlt, FaArrowRight, FaTimes } from "react-icons/fa";
import LandingFooter from "../components/LandingFooter";
import Header from "../components/Header";
import * as api from "../services/api";

export default function CartPage() {
  const { items, updateQty, removeItem, totals, setFile, applyCoupon, removeCoupon, coupon } = useCart();
  const nav = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState(null);

  // Shipping Calculator State
  const [shippingAddress, setShippingAddress] = useState({ country: "Rwanda", city: "", zip: "" });
  const [shippingEstimate, setShippingEstimate] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const handleCalculateShipping = async () => {
    try {
      setCalculating(true);
      const res = await api.calculateDelivery(shippingAddress);
      setShippingEstimate(res.data);
    } catch (error) {
      console.error("Failed to calculate shipping", error);
    } finally {
      setCalculating(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      await applyCoupon(couponCode);
      setCouponMessage({ type: "success", text: "Coupon applied successfully!" });
      setCouponCode("");
    } catch (error) {
      setCouponMessage({ type: "error", text: error.response?.data?.message || "Invalid coupon code" });
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      setCouponMessage(null);
    } catch (error) {
      console.error("Failed to remove coupon", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Header />

      <main>
        <section className="relative py-20 overflow-hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-violet-200 dark:bg-violet-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-fuchsia-200 dark:bg-fuchsia-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-200 dark:bg-blue-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-4">
              <FaShoppingCart className="text-violet-600" /> Your Shopping Cart
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Review your items, make any changes, and proceed to checkout.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            {items.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-800 animate-fade-in">
                <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaShoppingCart className="text-4xl text-gray-300 dark:text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</div>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Time to find some amazing products and fill it up!</p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98]"
                >
                  Start Shopping <FaArrowRight className="text-sm" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Price</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Qty</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Subtotal</th>
                            <th className="px-6 py-4 text-right"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                          {items.map((it, idx) => (
                            <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-6">
                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-1">{it.name}</div>
                                {it.customText && <div className="text-xs text-gray-500 dark:text-gray-400">Text: <span className="text-violet-600 dark:text-violet-400">{it.customText}</span></div>}
                                {it.cloudLink && <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">Cloud: <span className="text-violet-600 dark:text-violet-400">{it.cloudLink}</span></div>}
                                <div className="mt-4">
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Customization file</label>
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setFile(idx, e.target.files?.[0] || null)}
                                    className="block w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-6 text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                                {formatRwf(it.price)}
                              </td>
                              <td className="px-6 py-6 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  value={it.quantity}
                                  onChange={(e) => updateQty(idx, parseInt(e.target.value || "1"))}
                                  className="w-16 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-center font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none"
                                />
                              </td>
                              <td className="px-6 py-6 text-right text-sm font-bold text-violet-600 dark:text-violet-400">
                                {formatRwf(it.subtotal)}
                              </td>
                              <td className="px-6 py-6 text-right">
                                <button
                                  onClick={() => removeItem(idx)}
                                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-all"
                                >
                                  <FaTrashAlt />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <aside className="space-y-6 h-fit lg:sticky lg:top-24">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 leading-none">Order Summary</h2>
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Items Count</span>
                        <span className="font-bold text-gray-900 dark:text-white">{totals.itemCount}</span>
                      </div>
                      <div className="flex justify-between items-center py-4 border-t border-gray-50 dark:border-slate-800">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Order Total</span>
                        <span className="text-2xl font-black text-violet-600 dark:text-violet-400">{formatRwf(totals.grandTotal || totals.subtotal)}</span>
                      </div>
                      {totals.discount > 0 && (
                        <div className="flex justify-between items-center text-green-600 dark:text-green-400 text-sm font-bold bg-green-50 dark:bg-green-900/10 p-3 rounded-xl">
                          <span>Discount Applied ({coupon})</span>
                          <span>-{formatRwf(totals.discount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Coupon Section */}
                    <div className="pt-6 border-t border-gray-50 dark:border-slate-800 mb-8">
                      {coupon ? (
                        <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl p-3">
                          <span className="text-violet-700 dark:text-violet-400 font-bold text-sm">PROMO: {coupon}</span>
                          <button onClick={handleRemoveCoupon} className="p-1.5 text-violet-400 hover:text-red-500 transition-colors">
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
                            className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            className="bg-gray-900 dark:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-600 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                      {couponMessage && (
                        <p className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                          {couponMessage.text}
                        </p>
                      )}
                    </div>

                    {/* Shipping Calculator */}
                    <div className="space-y-4 mb-8">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Est. Delivery</h3>
                      <div className="space-y-2">
                        <select
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white cursor-pointer"
                        >
                          <option value="Rwanda">Rwanda</option>
                          <option value="USA">United States</option>
                          <option value="Other">International</option>
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="City"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white"
                          />
                          <input
                            type="text"
                            placeholder="Zip"
                            value={shippingAddress.zip}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                            className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-all dark:text-white"
                          />
                        </div>
                        <button
                          onClick={handleCalculateShipping}
                          disabled={calculating}
                          className="w-full py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                        >
                          {calculating ? "Calculating..." : "Calculate Delivery Fee"}
                        </button>
                        {shippingEstimate && (
                          <div className="bg-violet-50 dark:bg-violet-900/10 rounded-xl p-4 border border-violet-100 dark:border-violet-900/30 animate-fade-in">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-violet-700 dark:text-violet-400">Delivery Fee:</span>
                              <span className="font-bold text-violet-900 dark:text-violet-200">{formatRwf(shippingEstimate.cost)}</span>
                            </div>
                            <div className="text-[10px] text-violet-500 uppercase font-bold">
                              Est. Delivery: {shippingEstimate.estimatedDays} days
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => nav("/checkout")}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-[0.98] mb-4"
                    >
                      Proceed to Checkout <FaArrowRight className="text-sm" />
                    </button>
                    <Link to="/shop" className="block text-center text-sm font-bold text-gray-400 hover:text-violet-600 transition-colors">
                      Continue Shopping
                    </Link>
                  </div>
                </aside>
              </div>
            )}

            {/* Cross Sells */}
            {items.some(item => item.product.crossSells?.length > 0) && (
              <div className="mt-20">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 pr-4">Complete your order</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from(new Map(items.flatMap(item => item.product.crossSells || []).map(p => [p.id, p])).values()).map(p => (
                    <Link key={p.id} to={`/product/${p.slug || p.id}`} className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-slate-800">
                      <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-slate-950">
                        {p.image ? (
                          <img src={process.env.REACT_APP_API_URL + p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <FaShoppingCart className="text-4xl" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{p.name}</h3>
                        <div className="text-violet-600 dark:text-violet-400 font-bold">{formatRwf(p.price)}</div>
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
