import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatRwf } from "../utils/currency";
import api from "../utils/axiosInstance";
import { getProvinces, getDistricts, getSectors, getCells } from "../utils/locationHelpers";
import { useToast } from "../context/ToastContext";
import { FaShoppingCart, FaCreditCard, FaMoneyBillWave, FaLock, FaTruck, FaMobileAlt, FaGift } from "react-icons/fa";
import LandingFooter from "../components/LandingFooter";
import Header from "../components/Header";
import assetUrl from "../utils/assetUrl";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, totals, clearCart } = useCart();
  const { showSuccess, showError, showWarning } = useToast();
  const nav = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    // We keep these for backend compatibility if needed
    city: "",
    country: "Rwanda"
  });

  // Location data states
  const [provinces, setProvinces] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [availableCells, setAvailableCells] = useState([]);

  // Initialize Provinces
  useEffect(() => {
    setProvinces(getProvinces());
  }, []);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      const shipping = user.shippingAddress || {};
      const billing = user.billingAddress || {};
      const targetAddress = shipping.province ? shipping : (billing.province ? billing : null);

      setFormData(prev => ({
        ...prev,
        firstName: user.name ? user.name.split(' ')[0] : prev.firstName,
        lastName: user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : prev.lastName,
        email: user.email || prev.email,
        phone: targetAddress?.phone || user.phone || prev.phone,
        address: targetAddress?.street || prev.address || user.address || "",
        province: targetAddress?.province || prev.province,
        district: targetAddress?.district || prev.district,
        sector: targetAddress?.sector || prev.sector,
        cell: targetAddress?.cell || prev.cell,
        city: targetAddress?.district || prev.city,
      }));

      if (targetAddress?.province) {
        setAvailableDistricts(getDistricts(targetAddress.province));
      }
      if (targetAddress?.district) {
        setAvailableSectors(getSectors(targetAddress.district));
      }
      if (targetAddress?.sector) {
        setAvailableCells(getCells(targetAddress.sector));
      }
    }
  }, [user]);

  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const [taxData, setTaxData] = useState({ totalTax: 0, taxes: [] });

  const [paymentMethod, setPaymentMethod] = useState("mtn_momo");
  const [momoPhone, setMomoPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'pending', 'success', 'failed'

  // Gift Card State
  const [giftCardCode, setGiftCardCode] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState(null);
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const [isApplyingGC, setIsApplyingGC] = useState(false);

  // Fetch shipping methods when district changes
  useEffect(() => {
    const fetchShipping = async () => {
      setLoadingShipping(true);
      try {
        const { data } = await api.post("/delivery/calculate", {
          province: formData.province,
          district: formData.district,
          sector: formData.sector,
          cell: formData.cell,
          total: totals.subtotal,
          items: items
        });
        setShippingMethods(data.data);

        // Auto-select first method if available
        if (data.data.length > 0) {
          const first = data.data[0];
          setSelectedMethod(first);
          setShippingCost(first.cost);
        } else {
          setSelectedMethod(null);
          setShippingCost(0);
        }
      } catch (error) {
      } finally {
        setLoadingShipping(false);
      }
    };

    if (formData.district) {
      fetchShipping();
    }
  }, [formData.district, formData.province, formData.sector, formData.cell, totals.subtotal, items]);

  // Fetch tax calculation when shipping/subtotal changes
  useEffect(() => {
    const fetchTax = async () => {
      try {
        const { data } = await api.post("/taxes/calculate", {
          province: formData.province,
          district: formData.district,
          sector: formData.sector,
          cell: formData.cell,
          subtotal: totals.subtotal - (totals.discount || 0),
          shippingCost: shippingCost
        });
        setTaxData(data.data);
      } catch (error) {
      }
    };

    fetchTax();
  }, [formData.district, formData.province, formData.sector, formData.cell, totals.subtotal, totals.discount, shippingCost]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setFormData({
      ...formData,
      province,
      district: "",
      sector: "",
      cell: "",
      city: "" // Reset city/district
    });
    setAvailableDistricts(getDistricts(province));
    setAvailableSectors([]);
    setAvailableCells([]);
  };

  const handleDistrictChange = (e) => {
    const district = e.target.value;
    setFormData({
      ...formData,
      district,
      sector: "",
      cell: "",
      city: district // Map district to city for backend compatibility
    });
    setAvailableSectors(getSectors(district));
    setAvailableCells([]);
  };

  const handleSectorChange = (e) => {
    const sector = e.target.value;
    setFormData({
      ...formData,
      sector,
      cell: ""
    });
    setAvailableCells(getCells(sector));
  };

  const handleCellChange = (e) => {
    const cell = e.target.value;
    setFormData({
      ...formData,
      cell
    });
  };

  const handleMethodChange = (method) => {
    setSelectedMethod(method);
    setShippingCost(method.cost);
  };

  const handleApplyGiftCard = async (e) => {
    e.preventDefault();
    if (!giftCardCode) return;
    setIsApplyingGC(true);
    try {
      const response = await api.post("/gift-cards/validate", { code: giftCardCode });
      // Backend returns { success: true, data: giftCard }
      const giftCardData = response.data?.data || response.data;

      if (giftCardData && giftCardData.currentBalance > 0) {
        setAppliedGiftCard(giftCardData);
        // Calculate how much can be applied: min(balance, currentTotal)
        const currentTotal = (totals.subtotal - (totals.discount || 0)) + shippingCost + taxData.totalTax;
        const discountToApply = Math.min(giftCardData.currentBalance, currentTotal);
        setGiftCardDiscount(discountToApply);
        showSuccess(`Gift Card applied! Saved ${formatRwf(discountToApply)}`);
      } else {
        showError("Gift card has no balance remaining");
        setAppliedGiftCard(null);
        setGiftCardDiscount(0);
      }
    } catch (error) {
      showError(error.response?.data?.message || "Invalid or expired gift card");
      setAppliedGiftCard(null);
      setGiftCardDiscount(0);
    } finally {
      setIsApplyingGC(false);
    }
  };

  const removeGiftCard = () => {
    setAppliedGiftCard(null);
    setGiftCardDiscount(0);
    setGiftCardCode("");
  };

  const grandTotal = Math.max(0, (totals.subtotal - (totals.discount || 0)) + shippingCost + taxData.totalTax - giftCardDiscount);


  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedMethod) {
      showWarning("Please select a delivery method"); // Replaced alert
      return;
    }
    if (paymentMethod === "mtn_momo" && !momoPhone) {
      showWarning("Please enter your Mobile Money phone number"); // Replaced alert
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("creating_order");

    try {
      // 1. Create Order
      const fullAddressString = `${formData.address}, ${formData.cell}, ${formData.sector}, ${formData.district}, ${formData.province}`;

      const orderPayload = {
        items,
        billingAddress: {
          ...formData, // Spread existing form data (includes phone, email, etc.)
          fullName: `${formData.firstName} ${formData.lastName}`,
          addressLine1: formData.address, // Map address to schema field
          address: fullAddressString // Keep for reference if needed
        },
        shippingAddress: {
          ...formData,
          fullName: `${formData.firstName} ${formData.lastName}`,
          addressLine1: formData.address, // Map address to schema field
          address: fullAddressString
        },
        totals: { ...totals, grandTotal },
        shipping: selectedMethod,
        tax: taxData,
        paymentMethod,
        guestInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone
        },
        // Gift card application
        giftCard: appliedGiftCard ? {
          code: appliedGiftCard.code,
          amountApplied: giftCardDiscount
        } : null
      };

      const orderRes = await api.post("/orders/create", orderPayload);
      const orderId = orderRes.data.id; // MongoDB ID for API calls
      const publicId = orderRes.data.publicId; // Public ID for user-facing display

      // 2. Process Payment
      if (paymentMethod === "mtn_momo") {
        setPaymentStatus("awaiting_payment");
        const payRes = await api.post("/payments/process", {
          orderId,
          paymentMethod: "mtn_momo",
          phone: momoPhone
        });

        if (payRes.data.success) {
          // Poll for status
          const pollInterval = setInterval(async () => {
            try {
              const statusRes = await api.get(`/payments/status/${orderId}`);
              const status = statusRes.data.status;

              if (status === "completed" || status === "processing") {
                clearInterval(pollInterval);
                setPaymentStatus("success");
                clearCart();
                showSuccess("Order placed successfully!");
                setTimeout(() => nav(`/order-success/${publicId}`), 1000);
              } else if (status === "failed") {
                clearInterval(pollInterval);
                setPaymentStatus("failed");
                setIsProcessing(false);
                showError("Payment failed. Please try again."); // Failure toast
              }
            } catch (err) {
            }
          }, 3000); // Check every 3 seconds
        }
      } else {
        // Other methods (e.g. Cash)
        setPaymentStatus("success");
        clearCart();
        showSuccess("Order placed successfully!");
        setTimeout(() => nav(`/order-success/${publicId}`), 1000);
      }

    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to place order. Please try again.";
      showError(msg); // Replaced alert with specific error
      setIsProcessing(false);
      setPaymentStatus(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Header />
      <style>{`
        /* Webkit browser autofill overrides */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #f9fafb inset !important;
          -webkit-text-fill-color: #111827 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        .dark input:-webkit-autofill,
        .dark input:-webkit-autofill:hover, 
        .dark input:-webkit-autofill:focus, 
        .dark input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
          -webkit-text-fill-color: #ffffff !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <main>
        <section className="relative py-10 md:py-14 overflow-hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-violet-200 dark:bg-violet-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-fuchsia-200 dark:bg-fuchsia-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-200 dark:bg-blue-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-3">
              <FaLock className="text-violet-600 text-xl md:text-2xl animate-pulse" /> Secure Checkout
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Almost there! Please provide your details to complete the order.
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left Column: Forms */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                
                {/* 1. Billing & Shipping Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6 border-b border-gray-50 dark:border-slate-800 pb-4">
                    <div className="p-2.5 bg-violet-50 dark:bg-violet-900/10 rounded-xl text-violet-600 dark:text-violet-400">
                      <FaTruck className="text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Billing & Delivery</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Enter your delivery details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-gray-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-gray-400" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-gray-400" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-gray-400" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Province</label>
                      <select name="province" value={formData.province} onChange={handleProvinceChange} required className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer">
                        <option value="">Select Province</option>
                        {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">District</label>
                      <select name="district" value={formData.district} onChange={handleDistrictChange} required disabled={!formData.province} className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer disabled:opacity-50">
                        <option value="">Select District</option>
                        {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Sector</label>
                      <select name="sector" value={formData.sector} onChange={handleSectorChange} required disabled={!formData.district} className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer disabled:opacity-50">
                        <option value="">Select Sector</option>
                        {availableSectors.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Cell</label>
                      <select name="cell" value={formData.cell} onChange={handleCellChange} required disabled={!formData.sector} className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer disabled:opacity-50">
                        <option value="">Select Cell</option>
                        {availableCells.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Street Address</label>
                      <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="w-full bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-gray-400" placeholder="e.g. KG 123 St, Village name" />
                    </div>
                  </div>

                  {/* Shipping Method Selector inside Billing Card */}
                  <div className="mt-8 pt-8 border-t border-gray-50 dark:border-slate-800">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaTruck className="text-violet-600" /> Delivery Method
                    </h3>
                    {loadingShipping ? (
                      <div className="flex items-center gap-3 text-gray-500 py-2">
                        <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">Calculating delivery options...</span>
                      </div>
                    ) : shippingMethods.length > 0 ? (
                      <div className="space-y-3">
                        {shippingMethods.map((method, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleMethodChange(method)}
                            className={`group p-3.5 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all duration-200 ${selectedMethod?.id === method.id
                              ? 'bg-violet-50 dark:bg-violet-900/10 border-violet-600 shadow-md shadow-violet-500/5'
                              : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-750 hover:border-violet-400'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMethod?.id === method.id ? 'border-violet-600' : 'border-gray-300 dark:border-slate-650 group-hover:border-violet-400'}`}>
                                {selectedMethod?.id === method.id && <div className="w-2.5 h-2.5 bg-violet-600 rounded-full" />}
                              </div>
                              <span className={`text-sm font-bold transition-colors ${selectedMethod?.id === method.id ? 'text-violet-900 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300 group-hover:text-violet-600'}`}>{method.name}</span>
                            </div>
                            <span className="text-base font-extrabold text-violet-600 dark:text-violet-400">{method.cost === 0 ? "Free" : formatRwf(method.cost)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800 text-xs text-gray-500 text-center italic">
                        Please complete your location details to see delivery options.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Payment Method Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-all duration-300">
                  <div className="flex items-center gap-4 mb-6 border-b border-gray-50 dark:border-slate-800 pb-4">
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-900/10 rounded-xl text-amber-600 dark:text-amber-400">
                      <FaCreditCard className="text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h2>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Choose how you want to pay</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* MoMo Option */}
                    <div
                      onClick={() => setPaymentMethod("mtn_momo")}
                      className={`group rounded-xl border-2 transition-all duration-200 overflow-hidden ${paymentMethod === 'mtn_momo'
                        ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500 shadow-md shadow-amber-500/5'
                        : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-750 hover:border-amber-400'}`}
                    >
                      <div className="p-4 flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'mtn_momo' ? 'border-amber-500' : 'border-gray-300 dark:border-slate-650 group-hover:border-amber-400'}`}>
                            {paymentMethod === 'mtn_momo' && <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />}
                          </div>
                          <span className={`text-sm font-bold transition-colors ${paymentMethod === 'mtn_momo' ? 'text-amber-900 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300 group-hover:text-amber-600'}`}>MTN Mobile Money</span>
                        </div>
                        <FaMoneyBillWave className="text-amber-500 text-xl animate-pulse" />
                      </div>

                      {paymentMethod === "mtn_momo" && (
                        <div className="px-4 pb-4 pt-0">
                          <div className="bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <label className="text-[9px] font-bold text-amber-605 dark:text-amber-400 uppercase tracking-widest mb-1.5 block">Phone Number for payment</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500"><FaMobileAlt className="text-sm" /></span>
                              <input
                                type="tel"
                                value={momoPhone}
                                onChange={(e) => setMomoPhone(e.target.value)}
                                placeholder="079xxxxxxx"
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-amber-600/40 dark:placeholder:text-amber-500/30"
                              />
                            </div>
                            <p className="text-[9px] text-amber-600/60 mt-2 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              You will receive a prompt to enter your PIN on your phone
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Credit Card (Disabled) */}
                    <div className="group rounded-xl border-2 border-gray-100 dark:border-slate-850 p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-300 dark:border-slate-650"></div>
                        <span className="text-sm font-bold text-gray-400">Credit Card <span className="text-[9px] uppercase tracking-widest ml-2 bg-gray-100 dark:bg-slate-800 py-0.5 px-2 rounded">Soon</span></span>
                      </div>
                      <FaCreditCard className="text-gray-300 text-xl" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Order Summary (Sticky on Desktop) */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
                
                {/* 3. Order Summary Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-all duration-300">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <span className="p-2.5 bg-green-50 dark:bg-green-900/10 rounded-xl text-green-600 dark:text-green-400">
                      <FaShoppingCart className="text-lg" />
                    </span>
                    Your Order
                  </h2>

                  <div className="space-y-3 mb-6 max-h-[320px] overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-gray-50/50 dark:bg-slate-800/30 p-3 rounded-xl border border-gray-100 dark:border-slate-800/50 transition-all hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md group">
                        <div className="w-16 h-16 bg-white dark:bg-slate-950 rounded-lg overflow-hidden shadow-inner flex-shrink-0 flex items-center justify-center">
                          {item.product?.image || item.image ? (
                            <img src={assetUrl(item.product?.image || item.image)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-700 bg-gray-100 dark:bg-slate-800 text-base font-bold">IMP</div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-0.5">{item.name}</p>
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            {formatRwf(item.quantity * (item.price || item.product?.price || 0))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-slate-800 px-1">
                    <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
                      <span>Subtotal</span>
                      <span className="font-bold text-gray-900 dark:text-white">{formatRwf(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
                      <span>Delivery</span>
                      <span className="font-bold text-gray-900 dark:text-white">{selectedMethod ? formatRwf(shippingCost) : "--"}</span>
                    </div>
                    {taxData.taxes.map((tax, idx) => (
                      <div key={idx} className="flex justify-between text-gray-500 dark:text-gray-400 text-xs font-medium">
                        <span>{tax.name} ({tax.rate}%)</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatRwf(tax.amount)}</span>
                      </div>
                    ))}
                    {totals.discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400 text-xs font-bold bg-green-50/50 dark:bg-green-900/10 p-3 rounded-xl animate-fade-in">
                        <span>Discount (PROMO)</span>
                        <span>-{formatRwf(totals.discount)}</span>
                      </div>
                    )}

                    {/* Gift Card Application UI */}
                    <div className="py-4 border-y border-gray-100 dark:border-slate-800 my-2">
                      <div className="flex items-center gap-2 mb-3">
                        <FaGift className="text-violet-500 text-xs" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Have a Gift Card?</span>
                      </div>
                      {appliedGiftCard ? (
                        <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-900/10 p-3 rounded-xl border border-violet-200 dark:border-violet-805 animate-fade-in-up">
                          <div>
                            <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">{appliedGiftCard.code}</p>
                            <p className="text-base font-black text-gray-900 dark:text-white mt-0.5">-{formatRwf(giftCardDiscount)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={removeGiftCard}
                            className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-tighter transition-all active:scale-95 duration-150"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={giftCardCode}
                            onChange={(e) => setGiftCardCode(e.target.value)}
                            placeholder="IMPR-XXXX-XXXX"
                            className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-violet-500 outline-none transition-all uppercase placeholder:normal-case"
                          />
                          <button
                            type="button"
                            disabled={isApplyingGC || !giftCardCode}
                            onClick={handleApplyGiftCard}
                            className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-4 rounded-xl font-bold text-xs hover:bg-violet-700 transition-all active:scale-95 duration-150 disabled:opacity-50 disabled:active:scale-100"
                          >
                            {isApplyingGC ? "..." : "Apply"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center py-4 pt-6 border-t border-gray-100 dark:border-slate-800 mt-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">To Pay</span>
                      <span className="text-2xl md:text-3xl font-black text-violet-600 dark:text-violet-400 drop-shadow-sm">{formatRwf(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    type="submit"
                    disabled={!selectedMethod || isProcessing}
                    className="mt-6 w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 dark:disabled:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-md shadow-violet-500/20 hover:shadow-violet-500/35 active:scale-95 duration-150 disabled:opacity-50 disabled:active:scale-100 group"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-base font-extrabold">Place Secure Order</span>
                        <FaLock className="text-sm group-hover:translate-y-[-1px] transition-transform" />
                      </>
                    )}
                  </button>

                  {paymentStatus === "awaiting_payment" && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-500/30 rounded-xl text-center animate-pulse shadow-sm shadow-amber-500/5">
                      <p className="font-extrabold text-amber-600 dark:text-amber-400 text-sm uppercase tracking-wider">Check your phone!</p>
                      <p className="text-xs font-bold text-amber-900/60 dark:text-amber-100/60 mt-1 italic">Please approve the payment on {momoPhone}</p>
                    </div>
                  )}

                  {paymentStatus === "success" && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 border-2 border-green-500/30 rounded-xl text-center shadow-sm shadow-green-500/5">
                      <p className="font-extrabold text-green-600 dark:text-green-400 text-sm uppercase tracking-wider">Payment Successful!</p>
                      <p className="text-xs font-bold text-green-900/60 dark:text-green-100/60 mt-1 italic">Redirecting to order confirmation...</p>
                    </div>
                  )}

                  <p className="text-center text-[9px] font-bold text-gray-400 dark:text-slate-600 mt-6 uppercase tracking-widest leading-relaxed">
                    By placing your order, you agree to our <Link to="/terms" className="text-violet-600 dark:text-violet-400 hover:underline">Terms & Conditions</Link>.
                  </p>
                </div>

              </div>

            </form>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
