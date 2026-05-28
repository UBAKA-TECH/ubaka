import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../utils/axiosInstance";
import { FaUserPlus, FaFileInvoiceDollar, FaTimes, FaMoneyBillWave, FaPrint, FaTag, FaPlus, FaTrash, FaSearch } from "react-icons/fa";

const SellerAbonne = () => {
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFicheModal, setShowFicheModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);

    const [newClient, setNewClient] = useState({ name: "", phone: "", email: "" });
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientSearchTerm, setClientSearchTerm] = useState("");
    const [clientFiche, setClientFiche] = useState([]);
    const [payAmount, setPayAmount] = useState("");

    // Contract Prices State
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [contractPrices, setContractPrices] = useState([]);
    const [newPrice, setNewPrice] = useState({ productId: "", price: "" });
    const [savingPrice, setSavingPrice] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState("");

    // 1. Fetch Clients
    const { data: clients = [], isLoading: clientsLoading } = useQuery({
        queryKey: ['abonnes'],
        queryFn: async () => {
            const res = await axios.get("/abonnes");
            return res.data.success ? res.data.data : [];
        }
    });

    // 2. Fetch Products
    const { data: allProducts = [] } = useQuery({
        queryKey: ['pos-products'],
        queryFn: async () => {
            const res = await axios.get("/orders/seller/pos-products");
            return res.data.success ? res.data.data : [];
        }
    });

    // 3. Fetch Site Settings
    const { data: siteSettings } = useQuery({
        queryKey: ['site-settings-public'],
        queryFn: async () => {
            const res = await axios.get("/site-settings/public");
            return res.data.success ? res.data.data : null;
        }
    });

    const loading = clientsLoading;

    const handleAddClient = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("/abonnes", newClient);
            if (res.data.success) {
                queryClient.invalidateQueries(['abonnes']);
                setShowAddModal(false);
                setNewClient({ name: "", phone: "", email: "" });
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add client");
        }
    };

    const handleViewFiche = async (client) => {
        setSelectedClient(client);
        try {
            const res = await axios.get(`/abonnes/${client.id}/fiche`);
            if (res.data.success) {
                setClientFiche(res.data.transactions);
                setShowFicheModal(true);
            }
        } catch (err) {
            alert("Failed to load fiche");
        }
    };

    const handlePayDebt = async (e) => {
        e.preventDefault();
        if (!payAmount || isNaN(payAmount) || payAmount <= 0) return alert("Enter a valid amount");

        try {
            const res = await axios.post(`/abonnes/${selectedClient.id}/pay`, { amount: Number(payAmount) });
            if (res.data.success) {
                queryClient.invalidateQueries(['abonnes']);
                setShowPayModal(false);
                setPayAmount("");
                alert("Payment recorded successfully!");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to record payment");
        }
    };

    const handleViewPrices = async (client) => {
        setSelectedClient(client);
        try {
            const res = await axios.get(`/abonnes/${client.id}/prices`);
            if (res.data.success) {
                setContractPrices(res.data.data);
                setShowPriceModal(true);
            }
        } catch (err) {
            alert("Failed to load contract prices");
        }
    };

    const handleAddContractPrice = async (e) => {
        e.preventDefault();
        if (!newPrice.productId || !newPrice.price) return alert("Select product and enter price");
        
        try {
            setSavingPrice(true);
            const res = await axios.post(`/abonnes/${selectedClient.id}/prices`, newPrice);
            if (res.data.success) {
                const freshRes = await axios.get(`/abonnes/${selectedClient.id}/prices`);
                setContractPrices(freshRes.data.data);
                setNewPrice({ productId: "", price: "" });
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to set price");
        } finally {
            setSavingPrice(false);
        }
    };

    const handleDeletePrice = async (priceId) => {
        if (!window.confirm("Remove this contract price?")) return;
        try {
            const res = await axios.delete(`/abonnes/${selectedClient.id}/prices/${priceId}`);
            if (res.data.success) {
                setContractPrices(contractPrices.filter(p => p.id !== priceId));
            }
        } catch (err) {
            alert("Failed to remove price");
        }
    };

    const printFiche = () => {
        const printContent = document.getElementById("fiche-print-area").innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); 
    };

    return (
        <>
            <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-charcoal-900 dark:text-white">Clients Abonnés</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage regular clients and their tabs</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-terracotta-500 hover:bg-terracotta-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-terracotta-500/30"
                        >
                            <FaUserPlus /> New Client
                        </button>
                    </div>

                    {/* Client Search Bar */}
                    <div className="relative mb-6">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search client by name or phone..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-charcoal-800 border border-gray-100 dark:border-charcoal-700 rounded-2xl outline-none focus:border-terracotta-500 dark:text-white shadow-sm"
                            value={clientSearchTerm}
                            onChange={(e) => setClientSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-gray-500 font-bold">Loading clients...</div>
                    ) : (
                        <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-sm border border-gray-100 dark:border-charcoal-700 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-charcoal-700/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                                        <th className="p-4 font-bold">Client Name</th>
                                        <th className="p-4 font-bold">Contact</th>
                                        <th className="p-4 font-bold">Total Debt (RWF)</th>
                                        <th className="p-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-charcoal-700">
                                    {clients
                                        .filter(c => 
                                            c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || 
                                            (c.phone && c.phone.includes(clientSearchTerm))
                                        )
                                        .map(client => (
                                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-charcoal-700/30 transition-colors">
                                            <td className="p-4 font-bold text-charcoal-900 dark:text-white">{client.name}</td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                                                {client.phone || client.email || "N/A"}
                                            </td>
                                            <td className="p-4">
                                                <span className={`font-black ${client.totalDebt > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                    {client.totalDebt.toLocaleString()}
                                                </span>

                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedClient(client);
                                                        setShowPayModal(true);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold hover:bg-green-200 transition-colors"
                                                    title="Record Payment"
                                                >
                                                    <FaMoneyBillWave /> Pay
                                                </button>
                                                <button
                                                    onClick={() => handleViewFiche(client)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors"
                                                    title="View Fiche"
                                                >
                                                    <FaFileInvoiceDollar /> Fiche
                                                </button>
                                                <button
                                                    onClick={() => handleViewPrices(client)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200 transition-colors"
                                                    title="Contract Prices"
                                                >
                                                    <FaTag /> Prices
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {clients.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">No abonné clients found. Add one to get started!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-black mb-4 text-charcoal-900 dark:text-white">Add Client Abonné</h2>
                        <form onSubmit={handleAddClient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-charcoal-700 border border-gray-200 dark:border-charcoal-600 rounded-xl outline-none focus:border-terracotta-500 dark:text-white"
                                    value={newClient.name}
                                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-charcoal-700 border border-gray-200 dark:border-charcoal-600 rounded-xl outline-none focus:border-terracotta-500 dark:text-white"
                                    value={newClient.phone}
                                    onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 bg-gray-200 dark:bg-charcoal-700 text-charcoal-800 dark:text-white rounded-xl font-bold hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-terracotta-500 text-white rounded-xl font-bold hover:bg-terracotta-600 transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay Debt Modal */}
            {showPayModal && selectedClient && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-2xl font-black mb-1 text-charcoal-900 dark:text-white">Record Bank Payment</h2>
                        <p className="text-gray-500 text-sm mb-6">For: {selectedClient.name} (Owes RWF {selectedClient.totalDebt.toLocaleString()})</p>
                        <form onSubmit={handlePayDebt} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount Paid (RWF)</label>
                                <input
                                    type="number"
                                    required
                                    max={selectedClient.totalDebt}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-charcoal-700 border border-gray-200 dark:border-charcoal-600 rounded-xl outline-none focus:border-terracotta-500 text-xl font-bold dark:text-white"
                                    value={payAmount}
                                    onChange={e => setPayAmount(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPayModal(false)}
                                    className="flex-1 py-3 bg-gray-200 dark:bg-charcoal-700 text-charcoal-800 dark:text-white rounded-xl font-bold hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Fiche Modal */}
            {showFicheModal && selectedClient && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl w-full max-w-5xl p-6 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-charcoal-900 dark:text-white">Fiche de Client Abonné</h2>
                            <div className="flex gap-3">
                                <button onClick={printFiche} className="flex items-center gap-2 px-4 py-2 bg-charcoal-900 text-white rounded-lg font-bold hover:bg-charcoal-800"><FaPrint /> Print</button>
                                <button onClick={() => setShowFicheModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg font-bold hover:bg-gray-300"><FaTimes /></button>
                            </div>
                        </div>
                        <div className="overflow-y-auto flex-1 bg-white" id="fiche-print-area">
                            <style>
                                {`
                                @media print {
                                    @page { margin: 15mm; }
                                    body { font-family: 'Inter', sans-serif; background: white; color: black; -webkit-print-color-adjust: exact; }
                                    .print-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                                    .print-table th, .print-table td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
                                    .print-table th { background-color: #f3f4f6 !important; font-weight: 800; text-transform: uppercase; }
                                    .print-header { display: flex; justify-content: justify-between; align-items: center; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                                    .print-logo { height: 60px; width: auto; object-fit: contain; }
                                    .no-print { display: none; }
                                    .text-red-600 { color: #dc2626 !important; }
                                }
                                `}
                            </style>

                            <div className="p-8">
                                <div className="print-header flex justify-between items-center mb-8 border-b-[3px] border-black pb-6">
                                    <div className="flex items-center gap-4">
                                        {siteSettings?.logo ? (
                                            <img src={siteSettings.logo} alt="Logo" className="print-logo h-16 w-auto" />
                                        ) : (
                                            <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-black text-3xl rounded-xl">
                                                {siteSettings?.siteName?.charAt(0) || "A"}
                                            </div>
                                        )}
                                        <div>
                                            <h1 className="text-2xl font-black uppercase leading-tight">{siteSettings?.siteName || "Kuri Macye"}</h1>
                                            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Fiche de Suivi Client</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-xl font-black uppercase mb-1">FICHE DE CLIENT</h2>
                                        <p className="text-sm font-bold">CLIENT: <span className="underline decoration-black">{selectedClient.name}</span></p>
                                        <p className="text-xs font-mono mt-1 opacity-50">DATE: {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <table className="print-table w-full border border-black text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-black p-2">DATE</th>
                                            <th className="border border-black p-2">DESIGNATION</th>
                                            <th className="border border-black p-2 text-center">QTY</th>
                                            <th className="border border-black p-2 text-right">PU (RWF)</th>
                                            <th className="border border-black p-2 text-right">PT (RWF)</th>
                                            <th className="border border-black p-2 text-right text-red-600">DEBT (RWF)</th>
                                            <th className="border border-black p-2">CASHIER</th>
                                            <th className="border border-black p-2">RESPONSIBLE</th>
                                            <th className="border border-black p-2">SIGNATURE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientFiche.map((tx, idx) => (
                                            <tr key={idx}>
                                                <td className="border border-black p-2">{new Date(tx.date).toLocaleDateString()}</td>
                                                <td className="border border-black p-2 font-bold">{tx.designation}</td>
                                                <td className="border border-black p-2 text-center">{tx.quantity}</td>
                                                <td className="border border-black p-2 text-right">{tx.pu.toLocaleString()}</td>
                                                <td className="border border-black p-2 text-right">{tx.pt.toLocaleString()}</td>
                                                <td className="border border-black p-2 text-right font-bold text-red-600">{tx.debtAmount.toLocaleString()}</td>
                                                <td className="border border-black p-2 text-xs">{tx.responsible?.name || "System"}</td>
                                                <td className="border border-black p-2 text-[10px] font-bold">{tx.collectedBy || "-"}</td>
                                                <td className="border border-black p-2"></td>
                                            </tr>
                                        ))}
                                        {clientFiche.length === 0 && (
                                            <tr>
                                                <td colSpan="9" className="p-8 text-center text-gray-500 italic">No unpaid transactions.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {clientFiche.length > 0 && (
                                        <tfoot>
                                            <tr className="bg-gray-50 font-black">
                                                <td colSpan="4" className="border border-black p-3 text-right text-xs">TOTAL GLOBAL (TG):</td>
                                                <td className="border border-black p-3 text-right">{clientFiche.reduce((sum, tx) => sum + tx.pt, 0).toLocaleString()}</td>
                                                <td className="border border-black p-3 text-right text-red-600">RWF {selectedClient.totalDebt.toLocaleString()}</td>
                                                <td colSpan="3" className="border border-black p-3 bg-white"></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>

                                <div className="mt-12 grid grid-cols-2 gap-20">
                                    <div className="text-center">
                                        <p className="font-bold border-b border-black pb-2 mb-20 uppercase text-xs tracking-widest">Le Client</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold border-b border-black pb-2 mb-20 uppercase text-xs tracking-widest">Le Gérant / {siteSettings?.siteName || "Kuri Macye"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Contract Prices Modal */}
            {showPriceModal && selectedClient && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl w-full max-w-2xl p-6 flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-charcoal-900 dark:text-white">Contract Prices</h2>
                                <p className="text-sm text-gray-500">Custom pricing for <span className="font-bold text-charcoal-800 dark:text-white">{selectedClient.name}</span></p>
                            </div>
                            <button onClick={() => setShowPriceModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal-700 rounded-full transition-colors"><FaTimes /></button>
                        </div>

                        {/* Add New Price Form */}
                        <form onSubmit={handleAddContractPrice} className="bg-gray-50 dark:bg-charcoal-700/50 p-4 rounded-xl mb-6 border border-gray-100 dark:border-charcoal-600 flex flex-col sm:flex-row gap-3 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Product</label>
                                <select 
                                    className="w-full p-2 bg-white dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-600 rounded-lg text-sm outline-none focus:border-terracotta-500"
                                    value={newPrice.productId}
                                    onChange={e => setNewPrice({ ...newPrice, productId: e.target.value })}
                                    required
                                >
                                    <option value="">Choose a product...</option>
                                    {allProducts
                                        .filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()))
                                        .map(p => (
                                            <option key={p.id || p.id} value={p.id || p.id}>
                                                {p.name} (Normal: {p.price.toLocaleString()})
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div className="w-full sm:w-48">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Search/Filter Products</label>
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                                    <input 
                                        type="text"
                                        placeholder="Type to filter list..."
                                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-600 rounded-lg text-sm outline-none focus:border-terracotta-500"
                                        value={productSearchTerm}
                                        onChange={(e) => setProductSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="w-full sm:w-32">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Contract Price</label>
                                <input 
                                    type="number"
                                    placeholder="0"
                                    className="w-full p-2 bg-white dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-600 rounded-lg text-sm outline-none focus:border-terracotta-500"
                                    value={newPrice.price}
                                    onChange={e => setNewPrice({ ...newPrice, price: e.target.value })}
                                    required
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={savingPrice}
                                className="bg-terracotta-500 hover:bg-terracotta-600 text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <FaPlus /> {savingPrice ? '...' : 'Add'}
                            </button>
                        </form>

                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white dark:bg-charcoal-800 z-10 border-b-2 border-gray-100 dark:border-charcoal-700">
                                    <tr className="text-[10px] font-bold text-gray-400 uppercase">
                                        <th className="p-3">Product</th>
                                        <th className="p-3">Standard</th>
                                        <th className="p-3">Contract</th>
                                        <th className="p-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-charcoal-700">
                                    {contractPrices.map(cp => (
                                        <tr key={cp.id} className="text-sm">
                                            <td className="p-3 font-bold text-charcoal-800 dark:text-white">{cp.product?.name}</td>
                                            <td className="p-3 text-gray-500">{cp.product?.price?.toLocaleString()}</td>
                                            <td className="p-3 text-terracotta-500 font-black">{cp.price.toLocaleString()}</td>
                                            <td className="p-3 text-right">
                                                <button 
                                                    onClick={() => handleDeletePrice(cp.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {contractPrices.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-12 text-center text-gray-400 italic">No special prices set for this client.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SellerAbonne;
