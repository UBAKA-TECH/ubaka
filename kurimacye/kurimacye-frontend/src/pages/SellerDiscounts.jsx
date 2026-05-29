import { useState, useEffect } from "react";
import { FaTag, FaPlus, FaTrash, FaSave, FaCheck, FaTimes, FaPercent, FaCoins, FaCalendarAlt } from "react-icons/fa";
import api from "../utils/axiosInstance";
import { useToast } from "../context/ToastContext";

const SellerDiscounts = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        description: "",
        type: "fixed",
        value: "",
        minSpend: "0",
        maxDiscount: "",
        usageLimit: "",
        perUserLimit: "1",
        validFrom: new Date().toISOString().split("T")[0],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        isActive: true
    });

    const fetchCoupons = async () => {
        try {
            const res = await api.get("/seller/coupons");
            if (res.data.success) {
                setCoupons(res.data.data);
            }
        } catch (err) {
            addToast("Failed to fetch discounts", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [addToast]);

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...newCoupon,
                value: Number(newCoupon.value),
                minSpend: Number(newCoupon.minSpend),
                maxDiscount: newCoupon.maxDiscount ? Number(newCoupon.maxDiscount) : null,
                usageLimit: newCoupon.usageLimit ? Number(newCoupon.usageLimit) : null,
                perUserLimit: Number(newCoupon.perUserLimit)
            };

            const res = await api.post("/seller/coupons", payload);
            if (res.data.success) {
                addToast("Promo code created successfully!", "success");
                setShowAddModal(false);
                setNewCoupon({
                    code: "",
                    description: "",
                    type: "fixed",
                    value: "",
                    minSpend: "0",
                    maxDiscount: "",
                    usageLimit: "",
                    perUserLimit: "1",
                    validFrom: new Date().toISOString().split("T")[0],
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    isActive: true
                });
                fetchCoupons();
            }
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to create promo code", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (id, currentStatus) => {
        try {
            const res = await api.put(`/seller/coupons/${id}`, { isActive: !currentStatus });
            if (res.data.success) {
                addToast(`Promo code ${!currentStatus ? 'activated' : 'deactivated'}`, "success");
                setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
            }
        } catch (err) {
            addToast("Failed to update status", "error");
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) return;

        try {
            const res = await api.delete(`/seller/coupons/${id}`);
            if (res.data.success) {
                addToast("Promo code deleted successfully", "success");
                setCoupons(prev => prev.filter(c => c.id !== id));
            }
        } catch (err) {
            addToast("Failed to delete coupon", "error");
        }
    };

    if (loading) {
        return (
            <main className="flex-1 p-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading discounts...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-terracotta-50 dark:bg-terracotta-900/20 text-terracotta-600 dark:text-terracotta-400 rounded-xl">
                            <FaTag size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white font-outfit">Coupons & Discounts</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage marketing coupon codes for your customers</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <FaPlus className="text-sm" /> Create Coupon
                    </button>
                </div>

                {/* Coupons Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Code</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Discount</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Min Spend</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Usage count</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Expires At</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 dark:divide-gray-700">
                            {coupons.map(c => {
                                const isExpired = new Date() > new Date(c.expiresAt);
                                return (
                                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-md text-xs font-bold border border-indigo-100/50 dark:border-indigo-800/30">
                                                {c.code}
                                            </span>
                                            {c.description && <p className="text-xs text-gray-400 mt-1">{c.description}</p>}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">
                                            {c.type === "fixed" ? `RWF ${c.value.toLocaleString()}` : `${c.value}%`}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            RWF {c.minSpend.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                {c.usageCount}
                                            </span>
                                            <span className="text-gray-400 text-xs">
                                                / {c.usageLimit || "∞"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                isExpired 
                                                    ? 'bg-red-50 dark:bg-red-950/20 text-red-600' 
                                                    : 'bg-green-50 dark:bg-green-950/20 text-green-600'
                                            }`}>
                                                {new Date(c.expiresAt).toLocaleDateString()} {isExpired ? '(Expired)' : ''}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleToggleActive(c.id, c.isActive)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    c.isActive
                                                        ? 'bg-green-50 dark:bg-green-950/20 text-green-600 hover:bg-green-100'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'
                                                }`}
                                            >
                                                {c.isActive ? 'Active' : 'Disabled'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCoupon(c.id)}
                                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                                                title="Delete Coupon"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium bg-gray-50/50 dark:bg-gray-900/10">
                                        No discount coupons created yet. Click "Create Coupon" to start.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create Coupon Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-750 animate-scale-up">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white font-outfit">Create Discount Coupon</h2>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><FaTimes size={18} /></button>
                            </div>

                            <form onSubmit={handleCreateCoupon} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Coupon Code (Alphanumeric)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. SUMMER20"
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-indigo-500 font-mono font-bold uppercase"
                                            value={newCoupon.code}
                                            onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description / Notes (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 20% off all physical notebooks"
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-indigo-500"
                                            value={newCoupon.description}
                                            onChange={e => setNewCoupon({ ...newCoupon, description: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Discount Type</label>
                                        <select
                                            className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-indigo-500"
                                            value={newCoupon.type}
                                            onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })}
                                        >
                                            <option value="fixed">Fixed RWF</option>
                                            <option value="percentage">Percentage %</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Discount Value</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder={newCoupon.type === "fixed" ? "e.g. 1000" : "e.g. 15"}
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-indigo-500"
                                            value={newCoupon.value}
                                            onChange={e => setNewCoupon({ ...newCoupon, value: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Min Spend (RWF)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-indigo-500"
                                            value={newCoupon.minSpend}
                                            onChange={e => setNewCoupon({ ...newCoupon, minSpend: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Max Discount (RWF)</label>
                                        <input
                                            type="number"
                                            placeholder="Unlimited"
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-indigo-500"
                                            value={newCoupon.maxDiscount}
                                            onChange={e => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Valid From</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-indigo-500"
                                            value={newCoupon.validFrom}
                                            onChange={e => setNewCoupon({ ...newCoupon, validFrom: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Expires At</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-indigo-500"
                                            value={newCoupon.expiresAt}
                                            onChange={e => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Total Usage Limit</label>
                                        <input
                                            type="number"
                                            placeholder="Unlimited"
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-indigo-500"
                                            value={newCoupon.usageLimit}
                                            onChange={e => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Limit Per User</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="e.g. 1"
                                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-indigo-500"
                                            value={newCoupon.perUserLimit}
                                            onChange={e => setNewCoupon({ ...newCoupon, perUserLimit: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6 border-t border-gray-150 dark:border-gray-700/50">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaSave /> {saving ? "Saving..." : "Create"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default SellerDiscounts;
