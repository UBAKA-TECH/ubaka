import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  FaChartLine, FaWallet, FaBox, FaShoppingCart, FaUserTie, 
  FaArrowDown, FaSync, FaDownload, FaHistory,
  FaExclamationTriangle, FaCheckCircle, FaSearch
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const OwnerOverview = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [activeShift, setActiveShift] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [analyticsRes, shiftRes, ordersRes, expensesRes, productsRes] = await Promise.all([
                api.get("/dashboard/analytics"),
                api.get("/shifts/active"),
                api.get("/orders?limit=10"),
                api.get("/expenses?limit=10"),
                api.get("/products/all") 
            ]);

            setAnalytics(analyticsRes.data);
            setActiveShift(shiftRes.data.success ? shiftRes.data.data : null);
            setRecentOrders(ordersRes.data.data || []);
            setRecentExpenses(expensesRes.data.data || []);
            setInventory(productsRes.data.success ? productsRes.data.data : []);
            
        } catch (error) {
            console.error("Failed to fetch owner data:", error);
            toast.error("Failed to load some dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [fetchData]);

    const formatCurrency = (amount) => `RWF ${(amount || 0).toLocaleString()}`;

    const filteredInventory = inventory.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-cream-50 dark:bg-charcoal-950 transition-colors duration-300">
            <main className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-8">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Live Management Center
                        </div>
                        <h1 className="text-4xl font-black text-charcoal-900 dark:text-white tracking-tight">
                            {user?.role === 'owner' ? `Welcome back, ${user.name.split(' ')[0]}` : "Shop Overview"}
                        </h1>
                        <p className="text-charcoal-500 dark:text-charcoal-400 mt-2 font-medium">
                            {user?.role === 'owner' ? "Here is the current pulse of your business." : "Real-time tracking of orders, inventory, and financial health."}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={fetchData}
                            className="p-3 bg-white dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-300 rounded-2xl border border-cream-200 dark:border-charcoal-700 hover:text-indigo-500 transition-all shadow-sm group"
                        >
                            <FaSync className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                        </button>
                        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                            <FaDownload /> Monthly Audit
                        </button>
                    </div>
                </header>

                {/* Main Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <MetricCard 
                        title="Today's Revenue" 
                        value={formatCurrency(analytics?.dailyStats?.revenue)} 
                        icon={<FaChartLine />} 
                        color="indigo"
                        trend="+12%"
                    />
                    <MetricCard 
                        title="Daily Expenses" 
                        value={formatCurrency(analytics?.dailyStats?.expenses)} 
                        icon={<FaArrowDown />} 
                        color="red"
                        trend="-5%"
                    />
                    <MetricCard 
                        title="Net Cash Today" 
                        value={formatCurrency((analytics?.dailyStats?.revenue || 0) - (analytics?.dailyStats?.expenses || 0))} 
                        icon={<FaWallet />} 
                        color="sage"
                        subtext="Revenue - Expenses"
                    />
                    <MetricCard 
                        title="Live Drawer" 
                        value={formatCurrency(activeShift?.currentBalance || 0)} 
                        icon={<FaWallet />} 
                        color="indigo"
                        subtext={activeShift ? `Shift by ${activeShift.staff?.name}` : "No active shift"}
                    />
                    <MetricCard 
                        title="Stock Value" 
                        value={formatCurrency(analytics?.totalInventoryValue)} 
                        icon={<FaBox />} 
                        color="sand"
                        subtext={`${analytics?.totalProducts || 0} Items`}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Orders & Expenses Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Live Activity Feed */}
                        <div className="bg-white dark:bg-charcoal-800 rounded-[2rem] shadow-sm border border-cream-200 dark:border-charcoal-700 overflow-hidden">
                            <div className="p-6 border-b border-cream-100 dark:border-charcoal-700 flex justify-between items-center bg-cream-50/50 dark:bg-charcoal-900/50">
                                <h3 className="font-black text-charcoal-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
                                    <FaHistory className="text-indigo-500" /> Recent Activity
                                </h3>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase">Orders</span>
                                    <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-[10px] font-black uppercase">Expenses</span>
                                </div>
                            </div>
                            <div className="divide-y divide-cream-100 dark:divide-charcoal-700">
                                {recentOrders.slice(0, 5).map(order => (
                                    <ActivityItem 
                                        key={order.id}
                                        type="order"
                                        title={`Order #${order.orderNumber}`}
                                        subtitle={`${order.items?.length || 0} items • ${order.paymentStatus}`}
                                        amount={formatCurrency(order.total)}
                                        time={new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        status={order.status}
                                    />
                                ))}
                                {recentExpenses.slice(0, 3).map(expense => (
                                    <ActivityItem 
                                        key={expense.id}
                                        type="expense"
                                        title={expense.description}
                                        subtitle={expense.category}
                                        amount={`-${formatCurrency(expense.amount)}`}
                                        time={new Date(expense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        status="expense"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Inventory Tracking Table */}
                        <div className="bg-white dark:bg-charcoal-800 rounded-[2rem] shadow-sm border border-cream-200 dark:border-charcoal-700 overflow-hidden">
                            <div className="p-6 border-b border-cream-100 dark:border-charcoal-700 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <h3 className="font-black text-charcoal-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
                                    <FaBox className="text-sand-500" /> Stock Inventory List
                                </h3>
                                <div className="relative max-w-xs w-full">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 text-xs" />
                                    <input 
                                        type="text" 
                                        placeholder="Search stock..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-cream-50 dark:bg-charcoal-900 border border-transparent focus:border-indigo-500 rounded-xl text-xs outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-cream-50/50 dark:bg-charcoal-900/50">
                                        <tr>
                                            <th className="px-6 py-4 font-black text-charcoal-500 uppercase tracking-widest">Product / Variation</th>
                                            <th className="px-6 py-4 font-black text-charcoal-500 uppercase tracking-widest">In Stock</th>
                                            <th className="px-6 py-4 font-black text-charcoal-500 uppercase tracking-widest">Unit Price</th>
                                            <th className="px-6 py-4 font-black text-charcoal-500 uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-cream-100 dark:divide-charcoal-700">
                                        {filteredInventory.slice(0, 10).map(product => (
                                            <InventoryRow key={product.id} product={product} formatCurrency={formatCurrency} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Shift & Health Insights */}
                    <div className="space-y-8">
                        
                        {/* Active Shift Card */}
                        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <FaUserTie size={120} />
                            </div>
                            <h4 className="text-indigo-100 font-black uppercase tracking-[0.2em] text-[10px] mb-6">Current Operations</h4>
                            {activeShift ? (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-indigo-200 text-sm mb-1">Active Cashier</p>
                                        <h5 className="text-2xl font-black">{activeShift.staff?.name}</h5>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-indigo-200 text-[10px] uppercase font-bold mb-1">Started At</p>
                                            <p className="font-bold">{new Date(activeShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-indigo-200 text-[10px] uppercase font-bold mb-1">Opening Cash</p>
                                            <p className="font-bold">{formatCurrency(activeShift.openingBalance)}</p>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-indigo-500/50">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-indigo-200 text-[10px] uppercase font-bold mb-1">Live Drawer Balance</p>
                                                <p className="text-3xl font-black">{formatCurrency(activeShift.currentBalance)}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase backdrop-blur-md">Active</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaExclamationTriangle className="text-indigo-200 text-2xl" />
                                    </div>
                                    <h5 className="text-xl font-black">No Active Shift</h5>
                                    <p className="text-indigo-200 text-sm">All terminals are currently closed.</p>
                                </div>
                            )}
                        </div>

                        {/* Health Check / Alerts */}
                        <div className="bg-white dark:bg-charcoal-800 rounded-[2rem] p-8 border border-cream-200 dark:border-charcoal-700 shadow-sm">
                            <h4 className="text-charcoal-400 dark:text-charcoal-500 font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
                                <FaExclamationTriangle className="text-red-500" /> Management Alerts
                            </h4>
                            <div className="space-y-4">
                                {analytics?.lowStockProducts?.length > 0 ? (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl flex items-start gap-3">
                                        <FaBox className="text-red-500 mt-1" />
                                        <div>
                                            <p className="text-xs font-bold text-red-900 dark:text-red-300">{analytics.lowStockProducts.length} Items Low in Stock</p>
                                            <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">Inventory levels are critical. Restock recommended.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-sage-50 dark:bg-sage-900/20 border border-sage-100 dark:border-sage-800/50 rounded-2xl flex items-start gap-3">
                                        <FaCheckCircle className="text-sage-500 mt-1" />
                                        <div>
                                            <p className="text-xs font-bold text-sage-900 dark:text-sage-300">Stock Levels Healthy</p>
                                            <p className="text-[10px] text-sage-600 dark:text-sage-400 mt-0.5">All variations are above minimum thresholds.</p>
                                        </div>
                                    </div>
                                )}
                                
                                {analytics?.pendingOrders > 0 && (
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl flex items-start gap-3">
                                        <FaShoppingCart className="text-indigo-500 mt-1" />
                                        <div>
                                            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">{analytics.pendingOrders} Orders Pending</p>
                                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">Requires immediate processing.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

const MetricCard = ({ title, value, icon, color, trend, subtext }) => {
    const colors = {
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
        red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        sage: "bg-sage-50 text-sage-600 dark:bg-sage-900/20 dark:text-sage-400",
        sand: "bg-sand-50 text-sand-600 dark:bg-sand-900/20 dark:text-sand-400",
    };

    return (
        <div className="bg-white dark:bg-charcoal-800 p-6 rounded-[2rem] border border-cream-200 dark:border-charcoal-700 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colors[color]} rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${trend.startsWith('+') ? 'bg-sage-100 text-sage-600' : 'bg-red-100 text-red-600'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-[10px] font-black text-charcoal-400 dark:text-charcoal-500 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-charcoal-900 dark:text-white truncate">
                {value || "RWF 0"}
            </h3>
            {subtext && <p className="text-[10px] text-charcoal-500 mt-1 font-medium">{subtext}</p>}
        </div>
    );
};

const ActivityItem = ({ type, title, subtitle, amount, time, status }) => {
    const isOrder = type === 'order';
    return (
        <div className="px-6 py-4 flex items-center justify-between hover:bg-cream-50/50 dark:hover:bg-charcoal-700/30 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOrder ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20' : 'bg-red-50 text-red-500 dark:bg-red-900/20'}`}>
                    {isOrder ? <FaShoppingCart size={14} /> : <FaArrowDown size={14} />}
                </div>
                <div>
                    <p className="text-sm font-bold text-charcoal-900 dark:text-white">{title}</p>
                    <p className="text-[10px] text-charcoal-400 font-medium uppercase">{subtitle}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`text-sm font-black ${isOrder ? 'text-charcoal-900 dark:text-white' : 'text-red-500'}`}>{amount}</p>
                <p className="text-[10px] text-charcoal-400 font-medium">{time}</p>
            </div>
        </div>
    );
};

const InventoryRow = ({ product, formatCurrency }) => {
    const isLow = product.stock <= (product.lowStockThreshold || 5);
    return (
        <tr className="hover:bg-cream-50/50 dark:hover:bg-charcoal-700/30 transition-colors group">
            <td className="px-6 py-4">
                <div className="font-bold text-charcoal-900 dark:text-white group-hover:text-indigo-600 transition-colors">{product.name}</div>
                <div className="text-[9px] text-charcoal-400 uppercase font-bold tracking-wider">{product.sku || 'No SKU'}</div>
            </td>
            <td className="px-6 py-4">
                <div className={`inline-flex items-center gap-1.5 font-black ${isLow ? 'text-red-500' : 'text-charcoal-900 dark:text-white'}`}>
                    {product.stock} <span className="text-[9px] text-charcoal-400 font-medium">Pieces</span>
                </div>
            </td>
            <td className="px-6 py-4 font-bold text-charcoal-600 dark:text-charcoal-400">
                {formatCurrency(product.price)}
            </td>
            <td className="px-6 py-4 text-right">
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    isLow ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-sage-50 text-sage-600 border border-sage-100'
                }`}>
                    {isLow ? 'Low Stock' : 'Good'}
                </span>
            </td>
        </tr>
    );
};

export default OwnerOverview;
