import { useState, useEffect } from "react";
import { FaSave, FaTaxes, FaTruck, FaMoneyCheck, FaPlus, FaTrash, FaCheck, FaTimes, FaCog } from "react-icons/fa";
import api from "../utils/axiosInstance";
import { useToast } from "../context/ToastContext";

const SellerSettings = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("rra");

    // Form States
    const [rraForm, setRraForm] = useState({
        rraTin: "",
        rraSdcId: "",
        rraMrcNo: "",
        rraIntrlKey: "",
        rraSignKey: ""
    });

    const [paymentForm, setPaymentForm] = useState({
        momoCode: "",
        momoPhone: "",
        bankName: "",
        bankAccountName: "",
        bankAccountNumber: ""
    });

    // Custom Shipping Methods List
    const [shippingMethods, setShippingMethods] = useState([]);
    const [newMethod, setNewMethod] = useState({ name: "", cost: "", active: true });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/auth/me");
                
                // RRA Setup
                setRraForm({
                    rraTin: res.data.rraTin || "",
                    rraSdcId: res.data.rraSdcId || "",
                    rraMrcNo: res.data.rraMrcNo || "",
                    rraIntrlKey: res.data.rraIntrlKey || "",
                    rraSignKey: res.data.rraSignKey || ""
                });

                // Payments Setup
                const payConf = res.data.paymentConfig || {};
                setPaymentForm({
                    momoCode: payConf.momoCode || "",
                    momoPhone: payConf.momoPhone || "",
                    bankName: payConf.bankName || "",
                    bankAccountName: payConf.bankAccountName || "",
                    bankAccountNumber: payConf.bankAccountNumber || ""
                });

                // Shipping Methods Setup
                const shipConf = res.data.shippingConfig || {};
                setShippingMethods(shipConf.methods || [
                    { id: "std", name: "Standard Delivery", cost: 1000, active: true },
                    { id: "exp", name: "Express Delivery", cost: 2500, active: true }
                ]);

            } catch (err) {
                addToast("Failed to load seller settings", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [addToast]);

    const handleRraChange = (e) => {
        const { name, value } = e.target;
        setRraForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentForm(prev => ({ ...prev, [name]: value }));
    };

    const saveSettings = async (payload) => {
        setSaving(true);
        try {
            await api.put("/auth/me", payload);
            addToast("Settings updated successfully!", "success");
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to save settings", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveRra = (e) => {
        e.preventDefault();
        saveSettings(rraForm);
    };

    const handleSavePayment = (e) => {
        e.preventDefault();
        saveSettings({
            paymentConfig: paymentForm
        });
    };

    const handleAddShippingMethod = (e) => {
        e.preventDefault();
        if (!newMethod.name || !newMethod.cost) return;

        const updatedMethods = [
            ...shippingMethods,
            {
                id: Date.now().toString(),
                name: newMethod.name,
                cost: Number(newMethod.cost),
                active: newMethod.active
            }
        ];
        
        setShippingMethods(updatedMethods);
        setNewMethod({ name: "", cost: "", active: true });
        saveSettings({
            shippingConfig: { methods: updatedMethods }
        });
    };

    const handleDeleteShippingMethod = (id) => {
        const updatedMethods = shippingMethods.filter(m => m.id !== id);
        setShippingMethods(updatedMethods);
        saveSettings({
            shippingConfig: { methods: updatedMethods }
        });
    };

    const handleToggleShippingMethod = (id) => {
        const updatedMethods = shippingMethods.map(m => 
            m.id === id ? { ...m, active: !m.active } : m
        );
        setShippingMethods(updatedMethods);
        saveSettings({
            shippingConfig: { methods: updatedMethods }
        });
    };

    if (loading) {
        return (
            <main className="flex-1 p-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading settings...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <FaCog size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Store Settings</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Configure compliance details, shipping classes, and cash/MoMo pay codes</p>
                    </div>
                </div>

                {/* Tabs Grid */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm gap-2">
                    <button
                        onClick={() => setActiveTab("rra")}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            activeTab === "rra"
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:text-gray-400"
                        }`}
                    >
                        <FaSave className="text-sm" /> RRA EBM Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab("shipping")}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            activeTab === "shipping"
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:text-gray-400"
                        }`}
                    >
                        <FaTruck className="text-sm" /> Shipping Methods
                    </button>
                    <button
                        onClick={() => setActiveTab("payment")}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            activeTab === "payment"
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:text-gray-400"
                        }`}
                    >
                        <FaMoneyCheck className="text-sm" /> Payout Accounts
                    </button>
                </div>

                {/* Tab Contents */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 transition-colors">
                    {/* Tab 1: RRA CONFIG */}
                    {activeTab === "rra" && (
                        <form onSubmit={handleSaveRra} className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
                                RRA VSDC / EBM Credentials
                            </h3>
                            <p className="text-xs text-gray-400 leading-normal bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400/80 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                Leave blank to remain in sandbox simulation mode. When populated, these fields route transaction data directly to the Rwanda Revenue Authority to fetch legally binding billing signatures.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Taxpayer Identification Number (TIN)</label>
                                    <input
                                        type="text"
                                        name="rraTin"
                                        value={rraForm.rraTin}
                                        onChange={handleRraChange}
                                        placeholder="e.g. 109283748"
                                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">SDC Device Identifier (sdcId)</label>
                                    <input
                                        type="text"
                                        name="rraSdcId"
                                        value={rraForm.rraSdcId}
                                        onChange={handleRraChange}
                                        placeholder="e.g. RW0100238472"
                                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Machine Registration Code (mrcNo)</label>
                                    <input
                                        type="text"
                                        name="rraMrcNo"
                                        value={rraForm.rraMrcNo}
                                        onChange={handleRraChange}
                                        placeholder="e.g. RRA-MRC-010203"
                                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">SDC Internal Crypto Key (intrlKey)</label>
                                    <input
                                        type="password"
                                        name="rraIntrlKey"
                                        value={rraForm.rraIntrlKey}
                                        onChange={handleRraChange}
                                        placeholder="••••••••••••••••••••••••"
                                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">SDC Signature Key (signKey)</label>
                                    <textarea
                                        name="rraSignKey"
                                        value={rraForm.rraSignKey}
                                        onChange={handleRraChange}
                                        rows="3"
                                        placeholder="Paste your cryptographic RRA verification signature certificate key here..."
                                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm outline-none resize-none font-mono"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    <FaSave /> {saving ? "Saving..." : "Save Credentials"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Tab 2: SHIPPING METHODS */}
                    {activeTab === "shipping" && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 mb-6">
                                    Shipping & Courier Methods
                                </h3>

                                <div className="grid grid-cols-1 gap-4 mb-8">
                                    {shippingMethods.map(m => (
                                        <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-lg ${m.active ? 'bg-green-50 dark:bg-green-950/20 text-green-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                                                    <FaTruck />
                                                </div>
                                                <div>
                                                    <h4 className={`font-semibold text-sm ${m.active ? 'text-gray-800 dark:text-white' : 'text-gray-400 line-through'}`}>{m.name}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">RWF {m.cost.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleShippingMethod(m.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                        m.active
                                                            ? 'bg-green-50 dark:bg-green-950/20 text-green-600 hover:bg-green-100'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {m.active ? 'Active' : 'Disabled'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteShippingMethod(m.id)}
                                                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                                                    title="Delete Method"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Form to add shipping */}
                            <form onSubmit={handleAddShippingMethod} className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-150 dark:border-gray-700/50 space-y-4">
                                <h4 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaPlus className="text-xs text-indigo-600" /> Add Custom Shipping Method
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Method Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Kigali Delivery"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-650 rounded-lg text-sm bg-white dark:bg-gray-750 dark:text-white outline-none focus:border-indigo-500"
                                            value={newMethod.name}
                                            onChange={e => setNewMethod({ ...newMethod, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Delivery Cost (RWF)</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="e.g. 1500"
                                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-650 rounded-lg text-sm bg-white dark:bg-gray-750 dark:text-white outline-none focus:border-indigo-500"
                                            value={newMethod.cost}
                                            onChange={e => setNewMethod({ ...newMethod, cost: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-75"
                                    >
                                        <FaPlus /> Add & Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tab 3: PAYOUT ACCOUNTS */}
                    {activeTab === "payment" && (
                        <form onSubmit={handleSavePayment} className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
                                Payout Accounts & Routing
                            </h3>

                            <div className="space-y-6">
                                {/* Mobile Money */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                                    <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Mobile Money Setup</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">MoMo Pay Code / Merchant ID</label>
                                            <input
                                                type="text"
                                                name="momoCode"
                                                value={paymentForm.momoCode}
                                                onChange={handlePaymentChange}
                                                placeholder="e.g. 612874"
                                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">MoMo Phone Number</label>
                                            <input
                                                type="text"
                                                name="momoPhone"
                                                value={paymentForm.momoPhone}
                                                onChange={handlePaymentChange}
                                                placeholder="e.g. 0788123456"
                                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Account */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                                    <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Bank Account Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bank Name</label>
                                            <input
                                                type="text"
                                                name="bankName"
                                                value={paymentForm.bankName}
                                                onChange={handlePaymentChange}
                                                placeholder="e.g. BK, I&M, Equity"
                                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Holder Name</label>
                                            <input
                                                type="text"
                                                name="bankAccountName"
                                                value={paymentForm.bankAccountName}
                                                onChange={handlePaymentChange}
                                                placeholder="e.g. Abelus Ltd"
                                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Number</label>
                                            <input
                                                type="text"
                                                name="bankAccountNumber"
                                                value={paymentForm.bankAccountNumber}
                                                onChange={handlePaymentChange}
                                                placeholder="e.g. 100029384729"
                                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition-all text-sm outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-75"
                                >
                                    <FaSave /> {saving ? "Saving..." : "Save Payout Accounts"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
};

export default SellerSettings;
