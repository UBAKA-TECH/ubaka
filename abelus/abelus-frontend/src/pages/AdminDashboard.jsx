import { useState, useEffect } from "react";
import api from "../utils/axiosInstance";
import DashboardCards from "../components/DashboardCards";
import RevenueChart from "../components/RevenueChart";
import WeeklyProfitChart from "../components/WeeklyProfitChart";
import RecentOrderTable from "../components/RecentOrderTable";
import CustomizationDemandTable from "../components/CustomizationDemandTable";
import TopOrderedProductsTable from "../components/TopOrderedProductsTable";
import TopSellersWidget from "../components/TopSellersWidget";
import LowStockWidget from "../components/LowStockWidget";
import PendingApprovalsWidget from "../components/PendingApprovalsWidget";
import OrderStatusChart from "../components/OrderStatusChart";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/dashboard/analytics");
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll every 30 seconds instead of 15 to be safer
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col transition-all duration-300">
      <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">

          {/* Metrics Cards */}
          <section className="mb-8">
            <DashboardCards data={data} loading={loading} setRefreshKey={() => fetchDashboardData()} />
          </section>

          {/* Performance Analytics */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-charcoal-800 dark:text-white mb-4">
              Performance Analytics
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700 hover:shadow-lg transition-shadow">
                <RevenueChart data={data?.monthlyRevenue} loading={loading} />
              </div>
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700 hover:shadow-lg transition-shadow">
                <WeeklyProfitChart data={data?.weeklyProfit} loading={loading} />
              </div>
            </div>
          </section>

          {/* Marketplace Insights */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-charcoal-800 dark:text-white mb-4">
              Marketplace Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700 hover:shadow-lg transition-shadow">
                <TopSellersWidget sellers={data?.topSellers} loading={loading} />
              </div>
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700 hover:shadow-lg transition-shadow">
                <PendingApprovalsWidget approvals={data?.pendingSellerApprovals} loading={loading} />
              </div>
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700 hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
                <OrderStatusChart statusCounts={data?.statusCounts} loading={loading} />
              </div>
            </div>
          </section>

          {/* Inventory & Orders */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700 hover:shadow-lg transition-shadow">
                <LowStockWidget products={data?.lowStockProducts} outOfStockCount={data?.outOfStockCount} loading={loading} />
              </div>
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700 hover:shadow-lg transition-shadow">
                <RecentOrderTable orders={data?.recentOrders} loading={loading} />
              </div>
            </div>
          </section>

          {/* Products Analysis */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700 hover:shadow-lg transition-shadow">
                <TopOrderedProductsTable products={data?.topProducts} loading={loading} />
              </div>
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 shadow-sm border border-cream-200 dark:border-charcoal-700 hover:shadow-lg transition-shadow">
                <CustomizationDemandTable data={data} loading={loading} />
              </div>
            </div>
          </section>

        </main>
    </div>
  );
}

export default AdminDashboard;
