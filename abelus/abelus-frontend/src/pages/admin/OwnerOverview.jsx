import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  FaChartLine, FaWallet, FaBox, FaShoppingCart, FaUserTie, 
  FaArrowDown, FaSync, FaDownload, FaHistory,
  FaCheckCircle, FaSearch, FaArrowRight
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
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const formatCurrency = (amount) => `RWF ${(amount || 0).toLocaleString()}`;
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const filteredInventory = inventory.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0D0D0D] transition-colors duration-500 pb-20 md:pb-8">
            <main className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-10">
                
                {/* Humanized Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-[0.3em]">
                           {getGreeting()}, {user?.name?.split(' ')[0] || 'Owner'}
                        </p>
                        <h1 className="text-3xl md:text-5xl font-black text-charcoal-900 dark:text-white tracking-tight">
                            Shop Pulse
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={fetchData}
                            className="p-3 bg-white dark:bg-charcoal-900 text-charcoal-600 dark:text-charcoal-400 rounded-2xl border border-cream-200 dark:border-charcoal-800 shadow-sm active:scale-95 transition-all"
                        >
                            <FaSync className={`${loading ? "animate-spin" : ""}`} />
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-charcoal-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all">
                            <FaDownload /> Monthly Audit
                        </button>
                    </div>
                </header>

                {/* Metrics: Grid that adapts to mobile */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-0">
                    <div className="col-span-1">
                        <MetricCard 
                            title="Net Cash Today" 
                            value={formatCurrency((analytics?.dailyStats?.revenue || 0) - (analytics?.dailyStats?.expenses || 0))} 
                            icon={<FaWallet />} 
                            color="indigo"
                            trend={analytics?.dailyStats?.revenue > 0 ? "+Live" : "No Activity"}
                        />
                    </div>
                    <div className="col-span-1">
                        <MetricCard 
                            title="Live Drawer" 
                            value={formatCurrency(activeShift?.currentBalance || 0)} 
                            icon={<FaUserTie />} 
                            color="sage"
                            subtext={activeShift ? `Operated by ${activeShift.staff?.name}` : "No Active Shift"}
                        />
                    </div>
                    <div className="col-span-1">
                        <MetricCard 
                            title="Momo Pay Balance" 
                            value={formatCurrency(analytics?.dailyStats?.momoRevenue || 0)} 
                            icon={<FaSync />} 
                            color="indigo"
                            subtext="Direct to Owner"
                        />
                    </div>
                    <div className="col-span-1">
                        <MetricCard 
                            title="Today's Expenses" 
                            value={formatCurrency(analytics?.dailyStats?.expenses)} 
                            icon={<FaArrowDown />} 
                            color="red"
                            subtext="Paid out from cash"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    
                    {/* Activity Feed & Inventory */}
                    <div className="lg:col-span-8 space-y-6 md:space-y-8">
                        
                        {/* Live Activity Feed */}
                        <div className="bg-white dark:bg-charcoal-900 rounded-[2.5rem] shadow-sm border border-cream-100 dark:border-charcoal-800 overflow-hidden">
                            <div className="p-6 border-b border-cream-50 dark:border-charcoal-800 flex justify-between items-center">
                                <h3 className="font-black text-charcoal-900 dark:text-white uppercase tracking-widest text-[10px] flex items-center gap-2">
                                    <FaHistory className="text-indigo-500" /> Recent Transactions
                                </h3>
                                <button className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">View All</button>
                            </div>
                            <div className="divide-y divide-cream-50 dark:divide-charcoal-800">
                                {recentOrders.slice(0, 4).map(order => (
                                    <ActivityItem 
                                        key={order.id}
                                        type="order"
                                        title={`Order #${order.orderNumber}`}
                                        subtitle={`${order.items?.length || 0} items • ${order.paymentStatus}`}
                                        amount={formatCurrency(order.total)}
                                        time={new Date(order.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kigali' })}
                                    />
                                ))}
                                {recentExpenses.slice(0, 2).map(expense => (
                                    <ActivityItem 
                                        key={expense.id}
                                        type="expense"
                                        title={expense.description}
                                        subtitle={expense.category}
                                        amount={`-${formatCurrency(expense.amount)}`}
                                        time={new Date(expense.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kigali' })}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Inventory Section */}
                        <div className="bg-white dark:bg-charcoal-900 rounded-[2.5rem] shadow-sm border border-cream-100 dark:border-charcoal-800 overflow-hidden">
                            <div className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <h3 className="font-black text-charcoal-900 dark:text-white uppercase tracking-widest text-[10px] flex items-center gap-2">
                                    <FaBox className="text-sand-500" /> Stock Oversight
                                </h3>
                                <div className="relative flex-1 md:max-w-xs">
                                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 text-xs" />
                                    <input 
                                        type="text" 
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-cream-50 dark:bg-charcoal-800/50 border-none rounded-xl text-xs outline-none focus:ring-1 ring-indigo-500/30 transition-all dark:text-white"
                                    />
                                </div>
                            </div>
                            
                            {/* Table for Desktop, Grid for Mobile */}
                            <div className="hidden md:block overflow-x-auto px-2">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="text-charcoal-400 uppercase tracking-widest text-[9px] font-black">
                                            <th className="px-6 py-4">Product Name</th>
                                            <th className="px-6 py-4">Stock Level</th>
                                            <th className="px-6 py-4">Unit Price</th>
                                            <th className="px-6 py-4 text-right">Health</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-cream-50 dark:divide-charcoal-800">
                                        {filteredInventory.slice(0, 6).map(product => (
                                            <InventoryRow key={product.id} product={product} formatCurrency={formatCurrency} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="md:hidden divide-y divide-cream-50 dark:divide-charcoal-800 px-4">
                                {filteredInventory.slice(0, 6).map(product => (
                                    <InventoryCard key={product.id} product={product} formatCurrency={formatCurrency} />
                                ))}
                            </div>
                            
                            <div className="p-4 border-t border-cream-50 dark:border-charcoal-800 text-center">
                                <button className="text-[10px] font-black text-charcoal-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">See Complete Inventory</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: High Priority Insights */}
                    <div className="lg:col-span-4 space-y-6 md:space-y-8">
                        
                        {/* Management Alerts */}
                        <div className="bg-white dark:bg-charcoal-900 rounded-[2.5rem] p-6 md:p-8 border border-cream-100 dark:border-charcoal-800 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                             
                             <h4 className="text-charcoal-900 dark:text-white font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Critical Alerts
                            </h4>
                            
                            <div className="space-y-3">
                                {analytics?.lowStockProducts?.length > 0 ? (
                                    <div className="p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-100/50 dark:border-red-900/20 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-red-50 transition-colors">
                                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                            <FaBox size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-red-900 dark:text-red-200 uppercase truncate">{analytics.lowStockProducts.length} Items Low</p>
                                            <p className="text-[10px] text-red-600/70 dark:text-red-400/70 font-bold truncate">Restock required immediately</p>
                                        </div>
                                        <FaArrowRight className="text-red-300 dark:text-red-800 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                ) : (
                                    <div className="p-4 bg-sage-50/50 dark:bg-sage-900/10 border border-sage-100/50 dark:border-sage-900/20 rounded-2xl flex items-center gap-4">
                                        <div className="w-10 h-10 bg-sage-100 dark:bg-sage-900/30 rounded-xl flex items-center justify-center text-sage-600 dark:text-sage-400 shrink-0">
                                            <FaCheckCircle size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-sage-900 dark:text-sage-200 uppercase">Stock Healthy</p>
                                            <p className="text-[10px] text-sage-600/70 dark:text-sage-400/70 font-bold">All items above thresholds</p>
                                        </div>
                                    </div>
                                )}
                                
                                {analytics?.pendingOrders > 0 && (
                                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/20 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-indigo-50 transition-colors">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                            <FaShoppingCart size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase truncate">{analytics.pendingOrders} Orders</p>
                                            <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 font-bold truncate">Awaiting processing</p>
                                        </div>
                                        <FaArrowRight className="text-indigo-300 dark:text-indigo-800 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Active Shift Brief */}
                        <div className="bg-[#1A1A1A] dark:bg-[#151515] rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                <FaUserTie size={140} />
                            </div>
                            
                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">Active Session</span>
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 bg-sage-400 rounded-full animate-ping"></div>
                                        <div className="w-1 h-1 bg-sage-400 rounded-full"></div>
                                    </div>
                                </div>
                                
                                {activeShift ? (
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">On-Duty Staff</p>
                                            <h5 className="text-2xl font-black">{activeShift.staff?.name}</h5>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                            <div>
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">Started</p>
                                                <p className="text-sm font-bold">{new Date(activeShift.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kigali' })}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">Drawer</p>
                                                <p className="text-sm font-black text-sage-400">{formatCurrency(activeShift.currentBalance)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center space-y-3">
                                        <p className="text-sm font-bold text-gray-400">All terminals are currently offline.</p>
                                        <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest underline decoration-2 underline-offset-4">Open Terminals</button>
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
        indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-900/30",
        sage: "text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/30",
        red: "text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-900/30",
    };

    return (
        <div className="bg-white dark:bg-[#1A1A1A] p-4 md:p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 md:w-12 md:h-12 ${colors[color]} rounded-2xl flex items-center justify-center text-lg md:text-xl transition-transform`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-[8px] md:text-[9px] font-black px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg uppercase tracking-widest">
                        {trend}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-[10px] md:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
                    {title}
                </p>
                <h3 className="text-2xl md:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white leading-none py-1">
                    {value || "RWF 0"}
                </h3>
                {subtext && (
                    <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest opacity-90">
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    );
};

const ActivityItem = ({ type, title, subtitle, amount, time }) => {
    const isOrder = type === 'order';
    return (
        <div className="px-6 py-5 flex items-center justify-between hover:bg-cream-50/30 dark:hover:bg-charcoal-800/20 transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isOrder ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20' : 'bg-red-50 text-red-500 dark:bg-red-900/20'}`}>
                    {isOrder ? <FaShoppingCart size={14} /> : <FaArrowDown size={14} />}
                </div>
                <div>
                    <p className="text-sm font-black text-charcoal-900 dark:text-white truncate max-w-[120px] md:max-w-none">{title}</p>
                    <p className="text-[10px] text-charcoal-400 font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`text-sm font-black ${isOrder ? 'text-charcoal-900 dark:text-white' : 'text-red-500'}`}>{amount}</p>
                <p className="text-[10px] text-charcoal-300 dark:text-charcoal-500 font-bold mt-0.5">{time}</p>
            </div>
        </div>
    );
};

const InventoryRow = ({ product, formatCurrency }) => {
    const isLow = product.stock <= (product.lowStockThreshold || 5);
    return (
        <tr className="hover:bg-cream-50/30 dark:hover:bg-charcoal-800/20 transition-colors group">
            <td className="px-6 py-5">
                <div className="font-black text-charcoal-900 dark:text-white group-hover:text-indigo-600 transition-colors text-sm">{product.name}</div>
                <div className="text-[9px] text-charcoal-400 uppercase font-black tracking-[0.2em] mt-1">{product.sku || 'No SKU'}</div>
            </td>
            <td className="px-6 py-5">
                <div className={`inline-flex items-center gap-1.5 font-black text-sm ${isLow ? 'text-red-500' : 'text-charcoal-900 dark:text-white'}`}>
                    {product.stock} <span className="text-[9px] text-charcoal-400 font-bold uppercase">Units</span>
                </div>
            </td>
            <td className="px-6 py-5 font-black text-charcoal-500 dark:text-charcoal-400 text-sm">
                {formatCurrency(product.price)}
            </td>
            <td className="px-6 py-5 text-right">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                    isLow ? 'bg-red-50 text-red-600 dark:bg-red-900/20 border border-red-100/50 dark:border-red-900/30' : 'bg-sage-50 text-sage-600 dark:bg-sage-900/20 border border-sage-100/50 dark:border-sage-900/30'
                }`}>
                    {isLow ? 'Low' : 'OK'}
                </span>
            </td>
        </tr>
    );
};

const InventoryCard = ({ product, formatCurrency }) => {
    const isLow = product.stock <= (product.lowStockThreshold || 5);
    return (
        <div className="py-4 flex items-center justify-between group active:bg-cream-50 transition-colors">
            <div className="min-w-0 flex-1 pr-4">
                <p className="font-black text-charcoal-900 dark:text-white text-sm truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-1">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${isLow ? 'text-red-500' : 'text-sage-500'}`}>
                        {product.stock} Units
                     </span>
                     <span className="text-[10px] text-charcoal-400 font-bold tracking-widest uppercase truncate">• {product.sku || 'No SKU'}</span>
                </div>
            </div>
            <div className="text-right shrink-0">
                <p className="text-sm font-black text-charcoal-900 dark:text-white">{formatCurrency(product.price)}</p>
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${isLow ? 'text-red-500' : 'text-sage-500'}`}>
                    {isLow ? 'Restock' : 'Healthy'}
                </p>
            </div>
        </div>
    );
};

export default OwnerOverview;
