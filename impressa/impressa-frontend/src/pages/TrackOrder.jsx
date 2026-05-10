import { useState } from "react";
import { FaSearch, FaBoxOpen, FaTruck, FaCheckCircle, FaClipboardList, FaSpinner } from "react-icons/fa";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import api from "../utils/axiosInstance";

export default function TrackOrder() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await api.get(`/orders/track/${encodeURIComponent(query)}`);
      setResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "We couldn't find an order with that ID. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };




  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <FaCheckCircle className="track-icon-xl" />;
      case 'shipped': return <FaTruck className="track-icon-xl" />;
      case 'processing': return <FaBoxOpen className="track-icon-xl" />;
      default: return <FaClipboardList className="track-icon-xl" />;
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-white dark:bg-charcoal-800 border-b border-cream-200 dark:border-charcoal-700 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-terracotta-200 dark:bg-terracotta-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-sand-200 dark:bg-sand-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-charcoal-800 dark:text-white mb-6">Track Your <span className="text-terracotta-500 dark:text-terracotta-400">Order</span></h1>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-400 max-w-2xl mx-auto leading-relaxed">
              Enter your Order ID below to check the real-time status of your shipment.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="bg-white dark:bg-charcoal-800 rounded-[40px] shadow-sm border border-cream-200 dark:border-charcoal-700 p-8 md:p-12 mb-12">
            <form onSubmit={submit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Order ID (e.g., ORD-12345)"
                    className="w-full bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-2xl py-5 pl-14 pr-6 text-charcoal-800 dark:text-white outline-none transition-all shadow-inner text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="bg-terracotta-500 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-terracotta-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
                >
                  {loading ? <FaSpinner className="animate-spin text-2xl" /> : "Track Order"}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-8 p-6 bg-terracotta-50 dark:bg-terracotta-900/10 border-2 border-terracotta-500/20 rounded-2xl flex items-center gap-4 text-terracotta-600 dark:text-terracotta-400 font-bold">
                <FaClipboardList className="text-2xl" />
                {error}
              </div>
            )}
          </div>

          {result && (
            <div className="bg-white dark:bg-charcoal-800 rounded-[40px] shadow-2xl border border-cream-200 dark:border-charcoal-700 overflow-hidden transform animate-fade-in-up">
              <div className="p-8 md:p-12 border-b border-cream-200 dark:border-charcoal-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-3xl font-black text-charcoal-800 dark:text-white mb-2">Order Tracking Results</h2>
                  <p className="text-charcoal-500 dark:text-charcoal-400 font-bold text-lg">
                    Order ID: <span className="font-mono text-terracotta-500 dark:text-terracotta-400">{result.publicId}</span>
                  </p>
                </div>
                <div className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest border-2 ${result.status?.toLowerCase() === 'delivered' ? 'bg-sage-50 text-sage-600 border-sage-500/20 dark:bg-sage-900/10 dark:text-sage-400' :
                  result.status?.toLowerCase() === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-500/20 dark:bg-blue-900/10 dark:text-blue-400' :
                    result.status?.toLowerCase() === 'processing' ? 'bg-sand-50 text-sand-600 border-sand-500/20 dark:bg-sand-900/10 dark:text-sand-400' :
                      'bg-terracotta-50 text-terracotta-600 border-terracotta-500/20 dark:bg-terracotta-900/10 dark:text-terracotta-400'
                  }`}>
                  <span className="text-xl">{getStatusIcon(result.status)}</span>
                  {result.status}
                </div>
              </div>

              <div className="p-8 md:p-12 bg-cream-50/50 dark:bg-charcoal-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xs font-black text-charcoal-400 dark:text-charcoal-500 uppercase tracking-widest mb-4">Product Details</h3>
                      <div className="bg-white dark:bg-charcoal-800 p-8 rounded-3xl shadow-sm border border-cream-200 dark:border-charcoal-700">
                        <div className="text-xl font-black text-charcoal-800 dark:text-white mb-2">
                          {result.product || result.items?.[0]?.productName || `Order #${result.publicId}`}
                        </div>
                        {result.items && result.items.length > 0 && (
                          <div className="text-charcoal-500 dark:text-charcoal-400 font-bold text-sm uppercase tracking-wide">
                            {result.items.length} item(s) included in this delivery
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-charcoal-400 dark:text-charcoal-500 uppercase tracking-widest mb-4">Order Timeline</h3>
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-terracotta-500/20 before:to-transparent">

                      {/* Dynamic Status Stages */}
                      {[
                        { status: 'pending', label: 'Order Placed', desc: 'Your order has been received and is waiting for processing.' },
                        { status: 'processing', label: 'Processing', desc: 'We are preparing your items for delivery.' },
                        { status: 'shipped', label: 'Delivering', desc: 'Your order is on its way to you!' },
                        { status: 'delivered', label: 'Delivered', desc: 'Order has been successfully delivered.' }
                      ].map((stage, idx) => {
                        const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                        const currentStatusIdx = statusOrder.indexOf(result.status?.toLowerCase()) ?? 0;
                        const stageIdx = statusOrder.indexOf(stage.status);
                        const isCompleted = stageIdx <= currentStatusIdx;

                        if (!isCompleted && stage.status !== statusOrder[currentStatusIdx + 1]) return null;

                        return (
                          <div key={stage.status} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isCompleted ? 'is-active' : 'opacity-50'}`}>
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${isCompleted ? 'bg-terracotta-500 text-white' : 'bg-cream-300 text-charcoal-400'}`}>
                              {isCompleted ? <FaCheckCircle className="text-lg" /> : <div className="w-2 h-2 rounded-full bg-charcoal-400"></div>}
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-white dark:bg-charcoal-800 border border-cream-200 dark:border-charcoal-700 shadow-sm transition-all hover:shadow-md">
                              <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className={`font-black ${isCompleted ? 'text-charcoal-800 dark:text-white' : 'text-charcoal-400'}`}>{stage.label}</div>
                                {stage.status === 'pending' && (
                                  <time className="font-mono text-xs font-bold text-terracotta-500 dark:text-terracotta-400">{new Date(result.createdAt).toLocaleDateString()}</time>
                                )}
                              </div>
                              <p className="text-sm text-charcoal-500 dark:text-charcoal-400 font-medium">{stage.desc}</p>
                            </div>
                          </div>
                        );
                      })}

                      {/* Customer Notes / Updates */}
                      {result.notes?.filter(n => n.isCustomerVisible).map((note, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-sand-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <FaTruck className="text-xs" />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-sand-50 dark:bg-charcoal-800 border border-sand-200 dark:border-charcoal-700 shadow-sm border-l-4 border-l-sand-500">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className="font-black text-charcoal-800 dark:text-white">Delivery Update</div>
                              <time className="font-mono text-xs font-bold text-sand-600 dark:text-sand-400">{new Date(note.createdAt).toLocaleDateString()}</time>
                            </div>
                            <p className="text-sm text-charcoal-600 dark:text-gray-300 font-medium italic">"{note.text}"</p>
                          </div>
                        </div>
                      ))}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

