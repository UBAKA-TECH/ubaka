import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  Check, 
  X, 
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Activity,
  FileText
} from 'lucide-react';

const ImpressaAdmin = () => {
  const { token, user } = useAuth();
  
  const [approvals, setApprovals] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const fetchImpressaData = async () => {
    setLoading(true);
    try {
      // 1. Fetch pending product approvals
      const appRes = await fetch(`${API_BASE_URL}/projects/impressa/approvals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (appRes.ok) {
        const appData = await appRes.json();
        setApprovals(appData);
      }

      // 2. Fetch active support tickets
      const tickRes = await fetch(`${API_BASE_URL}/projects/impressa/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (tickRes.ok) {
        const tickData = await tickRes.json();
        setTickets(tickData);
      }
    } catch (err) {
      console.error('Error fetching Impressa control plane data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpressaData();
  }, [token]);

  const handleUpdateProductStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/impressa/approvals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          note: `Processed by Inzozi MIS Admin (${user.name})`
        })
      });

      if (response.ok) {
        setMsg({
          type: 'success',
          text: `Product successfully ${status === 'approved' ? 'approved' : 'rejected'}!`
        });
        // Remove from list
        setApprovals(prev => prev.filter(p => p.id !== id));
        setTimeout(() => setMsg(null), 3000);
      } else {
        const err = await response.json();
        setMsg({ type: 'error', text: err.error || 'Failed to update product' });
        setTimeout(() => setMsg(null), 4000);
      }
    } catch (err) {
      console.error('Error processing product status:', err);
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col min-h-0 overflow-hidden">
      
      {/* View Header */}
      <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-950/20 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-purple-400" />
            Impressa Command Center
          </h1>
          <p className="text-slate-400 text-xs mt-1">Control Plane operations for seller catalogue approvals and user support tickets</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 rounded-xl">
          <Activity className="w-3.5 h-3.5" />
          Impressa API Link Active
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border shrink-0 flex items-center gap-3 text-xs font-semibold ${
          msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 grid md:grid-cols-12 gap-8 min-h-0 overflow-hidden pb-4">
          
          {/* Left Column: Product Approvals catalog */}
          <div className="md:col-span-8 flex flex-col min-h-0 overflow-hidden space-y-4">
            <div className="flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-purple-400" />
                Product Approvals Backlog
              </h3>
              <span className="text-[10px] bg-slate-950 px-2.5 py-0.5 border border-slate-800/80 rounded-full text-slate-400 font-bold">
                {approvals.length} pending
              </span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {approvals.length === 0 ? (
                <div className="h-44 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-850 flex items-center justify-center text-slate-600">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300">Catalog is up to date</h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed">All vendor products uploaded to the Impressa storefront have been approved or rejected.</p>
                </div>
              ) : (
                approvals.map((prod) => (
                  <div key={prod.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-850"
                      />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200 leading-snug">{prod.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 font-semibold">
                          <span className="text-slate-400">By: {prod.sellerName}</span>
                          <span>•</span>
                          <span>Category: {prod.category}</span>
                          <span>•</span>
                          <span className="text-purple-400">${prod.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-auto pt-2 sm:pt-0 border-t border-slate-900 sm:border-0 shrink-0">
                      <button
                        onClick={() => handleUpdateProductStatus(prod.id, 'rejected')}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateProductStatus(prod.id, 'approved')}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Support Tickets list */}
          <div className="md:col-span-4 flex flex-col min-h-0 overflow-hidden space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 shrink-0">
              <MessageSquare className="w-4.5 h-4.5 text-purple-400" />
              Active Storefront Tickets
            </h3>

            <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {tickets.length === 0 ? (
                <div className="h-44 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-850 flex items-center justify-center text-slate-650">
                    <HelpCircle className="w-5 h-5 text-slate-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-400">No support requests</h4>
                  <p className="text-xs text-slate-500 max-w-xs">All shopper tickets are currently resolved.</p>
                </div>
              ) : (
                tickets.map((tick) => (
                  <div key={tick.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-2 hover:border-slate-800 transition-colors">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-[11px] font-bold text-slate-200 leading-snug">{tick.subject}</h4>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 border ${
                        tick.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-900 border-slate-850 text-slate-500'
                      }`}>
                        {tick.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span className="truncate">{tick.userEmail}</span>
                      <span className="uppercase text-purple-400 font-bold">{tick.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ImpressaAdmin;
