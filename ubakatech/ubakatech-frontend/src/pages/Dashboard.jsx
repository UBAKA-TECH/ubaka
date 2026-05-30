import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { 
  FolderGit2, 
  Activity, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  X,
  Terminal,
  Database,
  HardDrive
} from 'lucide-react';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('planning');
  const [formRepo, setFormRepo] = useState('');
  const [formLive, setFormLive] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Live Operations Mock State
  const [terminalLogs, setTerminalLogs] = useState([
    `[${new Date(Date.now() - 300000).toLocaleTimeString()}] [MONITOR] Homland (planning) -> PING bypassed`,
    `[${new Date(Date.now() - 240000).toLocaleTimeString()}] [MONITOR] Gesture-to-Speech (development) -> PING bypassed (no URL)`,
    `[${new Date(Date.now() - 180000).toLocaleTimeString()}] [MONITOR] Kuri Macye (active) -> PING https://kurimacye.vercel.app -> 200 OK (38ms)`,
    `[${new Date(Date.now() - 120000).toLocaleTimeString()}] [RRA-EBM] Kuri Macye -> EBM v2 invoice receipt #UBK-EBM-99812 generated (Success)`,
    `[${new Date(Date.now() - 60000).toLocaleTimeString()}] [POS-GATEWAY] Kuri Macye -> POS Cashier Marie shift started`
  ]);

  const [transactions, setTransactions] = useState([
    { id: 'TXN-KM-481920', time: '18:05:12', cashier: 'Marie (Kigali Node)', amount: '45,000 Rwf', method: 'MTN MoMo', status: 'Cleared' },
    { id: 'TXN-KM-481919', time: '17:59:45', cashier: 'Jean (Byumba Node)', amount: '12,500 Rwf', method: 'Cash', status: 'Cleared' },
    { id: 'TXN-KM-481918', time: '17:52:10', cashier: 'Marie (Kigali Node)', amount: '98,000 Rwf', method: 'Card', status: 'Cleared' },
    { id: 'TXN-KM-481917', time: '17:40:01', cashier: 'Aline (Gisenyi Node)', amount: '3,000 Rwf', method: 'Airtel Money', status: 'Cleared' },
    { id: 'TXN-KM-481916', time: '17:35:18', cashier: 'Jean (Byumba Node)', amount: '22,000 Rwf', method: 'MTN MoMo', status: 'Cleared' }
  ]);

  const [systemLoad, setSystemLoad] = useState({ cpu: 28, memory: 45, disk: 12, bandwidth: 1.2 });

  const isAdmin = user && (user.role === 'sysadmin' || user.role === 'cto');

  const getAverageUptime = () => {
    if (projects.length === 0) return '0%';
    let total = 0;
    let count = 0;
    projects.forEach(p => {
      const uptimeStr = p.metrics?.uptime;
      if (uptimeStr && uptimeStr !== 'N/A') {
        const val = parseFloat(uptimeStr.replace('%', ''));
        if (!isNaN(val)) {
          total += val;
          count++;
        }
      }
    });
    if (count === 0) return '100%';
    return (total / count).toFixed(2) + '%';
  };

  const getTotalActiveUsers = () => {
    return projects.reduce((sum, p) => sum + (p.metrics?.activeUsers || 0), 0).toLocaleString();
  };

  const getDbModeDisplay = () => {
    if (!user) return 'Mock Mode';
    return user.dbMode === 'production' ? 'Production' : 'Mock Mode';
  };

  const getDbModeSub = () => {
    if (!user) return 'In-Memory Mock Active';
    return user.dbMode === 'production' ? 'Supabase Connected' : 'In-Memory Mock Active';
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Fetch projects error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Interval for simulating live operations
    const interval = setInterval(() => {
      // Fluctuate system load slightly
      setSystemLoad(prev => ({
        cpu: Math.max(15, Math.min(85, Math.floor(prev.cpu + (Math.random() - 0.5) * 8))),
        memory: Math.max(30, Math.min(90, Math.floor(prev.memory + (Math.random() - 0.5) * 4))),
        disk: Math.max(5, Math.min(25, Math.floor(prev.disk + (Math.random() - 0.5) * 2))),
        bandwidth: Math.max(0.5, Math.min(4.5, parseFloat((prev.bandwidth + (Math.random() - 0.5) * 0.4).toFixed(1))))
      }));

      // Append terminal log
      const logTypes = [
        () => `[${new Date().toLocaleTimeString()}] [MONITOR] Ping check: Kuri Macye -> Healthy (${Math.floor(35 + Math.random() * 20)}ms)`,
        () => {
          const id = Math.floor(100000 + Math.random() * 900000);
          return `[${new Date().toLocaleTimeString()}] [RRA-EBM] Kuri Macye -> EBM v2 invoice receipt #UBK-EBM-${id} successfully sent`;
        },
        () => {
          const methods = ['MTN MoMo', 'Cash', 'Card', 'Airtel Money'];
          const method = methods[Math.floor(Math.random() * methods.length)];
          const amount = (Math.floor(1 + Math.random() * 45) * 5000).toLocaleString() + ' Rwf';
          const nodes = ['Kigali Node', 'Byumba Node', 'Gisenyi Node', 'Huye Node'];
          const node = nodes[Math.floor(Math.random() * nodes.length)];
          const txId = `TXN-KM-${Math.floor(481921 + Math.random() * 10000)}`;
          
          setTransactions(prev => [
            { id: txId, time: new Date().toLocaleTimeString(), cashier: `Agent (${node})`, amount, method, status: 'Cleared' },
            ...prev.slice(0, 4)
          ]);
          return `[${new Date().toLocaleTimeString()}] [POS-LEDGER] New checkout cleared: ${amount} via ${method}`;
        },
        () => `[${new Date().toLocaleTimeString()}] [WEBSOCKET] Commuter bus Linker (testing) -> WebSockets sync completed (0 clients online)`
      ];

      const newLog = logTypes[Math.floor(Math.random() * logTypes.length)]();
      setTerminalLogs(prev => [...prev.slice(-14), newLog]);
    }, 6000);

    return () => clearInterval(interval);
  }, [token]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'testing':
        return <Activity className="w-4 h-4 text-amber-400" />;
      case 'development':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'planning':
        return <FolderGit2 className="w-4 h-4 text-slate-400" />;
      default:
        return null;
    }
  };

  const getHealthBadge = (health) => {
    switch (health) {
      case 'healthy':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase"><CheckCircle2 className="w-3.5 h-3.5" /> Healthy</span>;
      case 'warning':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase"><AlertTriangle className="w-3.5 h-3.5" /> Warning</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><XCircle className="w-3.5 h-3.5" /> Inactive</span>;
      default:
        return null;
    }
  };

  // Open modal to add a project
  const openAddModal = () => {
    setEditingProject(null);
    setFormName('');
    setFormDesc('');
    setFormStatus('planning');
    setFormRepo('');
    setFormLive('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Open modal to edit a project
  const openEditModal = (project) => {
    setEditingProject(project);
    setFormName(project.name);
    setFormDesc(project.description || '');
    setFormStatus(project.status);
    setFormRepo(project.repositoryUrl || '');
    setFormLive(project.liveUrl || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg('Project Name is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const payload = {
      name: formName,
      description: formDesc,
      status: formStatus,
      repositoryUrl: formRepo,
      liveUrl: formLive
    };

    try {
      const url = editingProject 
        ? `${API_BASE_URL}/projects/${editingProject.id}`
        : `${API_BASE_URL}/projects`;
      
      const method = editingProject ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        fetchProjects();
      } else {
        setErrorMsg(data.error || 'Failed to save project.');
      }
    } catch (err) {
      setErrorMsg('Server connection failed.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchProjects();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete project.');
      }
    } catch (err) {
      alert('Server connection failed.');
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto overflow-y-auto h-full scrollbar-thin">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-950/20 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Real-time Operations Control & Monitoring Console</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProjects()}
            className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 font-bold"
          >
            <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            Force Ping
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Monitoring Connected
          </div>
        </div>
      </div>

      {/* Aggregate Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Monitored Systems', 
            value: projects.length.toString(), 
            sub: `${projects.filter(p => p.status === 'active').length} Active, ${projects.filter(p => p.status === 'testing' || p.status === 'development').length} Pipeline`, 
            icon: FolderGit2, 
            color: 'text-purple-400' 
          },
          { 
            label: 'Avg System Health', 
            value: getAverageUptime(), 
            sub: 'Operational Uptime Average', 
            icon: Activity, 
            color: 'text-emerald-400' 
          },
          { 
            label: 'Total Active Users', 
            value: getTotalActiveUsers(), 
            sub: 'Across live services', 
            icon: Users, 
            color: 'text-blue-400' 
          },
          { 
            label: 'Deployment Mode', 
            value: getDbModeDisplay(), 
            sub: getDbModeSub(), 
            icon: Database, 
            color: 'text-purple-400' 
          }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Monitored systems table & Live Transactions) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Monitored Systems Status Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product Systems Registry</h3>
              </div>
              {isAdmin && (
                <button 
                  onClick={openAddModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-purple-500/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Register System
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 uppercase font-bold text-[9px] tracking-wider">
                      <th className="py-2.5 px-3">System Name</th>
                      <th className="py-2.5 px-3">Endpoints</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3">Uptime</th>
                      <th className="py-2.5 px-3">Latency</th>
                      <th className="py-2.5 px-3">Health</th>
                      {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-855/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{proj.name}</div>
                          <div className="text-[10px] text-slate-500">/ubakatech/{proj.slug}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                          {proj.liveUrl ? (
                            <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline flex items-center gap-1">
                              {proj.liveUrl.replace('https://', '').replace('http://', '')}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide border ${
                            proj.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            proj.status === 'testing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            proj.status === 'development' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {proj.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono font-medium">{proj.metrics?.uptime || '100%'}</td>
                        <td className="py-3 px-3 text-slate-300 font-mono font-medium">{proj.metrics?.latency || '—'}</td>
                        <td className="py-3 px-3">{getHealthBadge(proj.metrics?.apiHealth || 'healthy')}</td>
                        {isAdmin && (
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex gap-1.5">
                              <button 
                                onClick={() => openEditModal(proj)}
                                className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(proj.id, proj.name)}
                                className="p-1 hover:bg-slate-850 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Kuri Macye Live POS & E-Commerce Transactions Ledger */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Kuri Macye Real-Time Ledger</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Transactions Feed (Simulated Live)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-500 uppercase font-bold text-[9px] tracking-wider">
                    <th className="py-2 px-3">Transaction ID</th>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">POS Cashier Node</th>
                    <th className="py-2 px-3">Amount</th>
                    <th className="py-2 px-3 text-center">Payment Method</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/40">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-850/10 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 font-bold">{tx.id}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">{tx.time}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-semibold">{tx.cashier}</td>
                      <td className="py-2.5 px-3 text-white font-mono font-extrabold">{tx.amount}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wide border ${
                          tx.method === 'MTN MoMo' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          tx.method === 'Card' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          tx.method === 'Airtel Money' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {tx.method}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                        {tx.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (Charts, Resources, Logs) */}
        <div className="space-y-6">
          
          {/* Server Resources Gauge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Server Resource Load</span>
              <span className="text-[10px] text-slate-400 font-semibold bg-slate-950 px-2 py-0.5 border border-slate-850 rounded">Production Server</span>
            </div>
            
            <div className="space-y-3 pt-2">
              {/* CPU Load */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">CPU Load</span>
                  <span className="text-white font-mono font-bold">{systemLoad.cpu}%</span>
                </div>
                <div className="h-2 bg-slate-955 border border-slate-850 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                    style={{ width: `${systemLoad.cpu}%` }}
                  />
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">Memory Usage</span>
                  <span className="text-white font-mono font-bold">{systemLoad.memory}%</span>
                </div>
                <div className="h-2 bg-slate-955 border border-slate-850 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" 
                    style={{ width: `${systemLoad.memory}%` }}
                  />
                </div>
              </div>

              {/* Network Throughput */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">Bandwidth Throughput</span>
                  <span className="text-white font-mono font-bold">{systemLoad.bandwidth} GB/s</span>
                </div>
                <div className="h-2 bg-slate-955 border border-slate-850 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" 
                    style={{ width: `${(systemLoad.bandwidth / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* E-Commerce Sales Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kuri Macye Weekly Sales</span>
              <span className="text-xs font-bold text-emerald-400">Total: 109.0M Rwf</span>
            </div>
            
            <div className="h-36 flex items-end justify-between gap-2.5 pt-4">
              {[
                { day: 'M', amount: '12.4M', pct: 65 },
                { day: 'T', amount: '14.1M', pct: 75 },
                { day: 'W', amount: '11.8M', pct: 60 },
                { day: 'T', amount: '15.2M', pct: 85 },
                { day: 'F', amount: '18.9M', pct: 95 },
                { day: 'S', amount: '22.4M', pct: 100 },
                { day: 'S', amount: '14.2M', pct: 74 },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1.5 bg-slate-950 border border-slate-800 text-[9px] text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {item.amount} Rwf
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full bg-gradient-to-t from-indigo-600 via-purple-500 to-pink-500 rounded-t group-hover:brightness-110 transition-all duration-300"
                    style={{ height: `${item.pct}%` }}
                  />
                  {/* Day Label */}
                  <span className="text-[9px] font-bold text-slate-500">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Log Terminal */}
          <div className="bg-slate-900 border border-slate-800 overflow-hidden shadow-lg flex flex-col h-[280px] rounded-2xl">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-850 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live System Logs Terminal</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            
            <div className="p-4 bg-slate-950 font-mono text-[9px] leading-relaxed text-purple-300/80 flex-1 overflow-y-auto space-y-1.5 scrollbar-thin select-text">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="border-l-2 border-purple-500/40 pl-2 py-0.5 hover:bg-slate-900/40 transition-colors">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl p-6 relative animate-scale-up">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white tracking-tight mb-1">
              {editingProject ? 'Modify Registered System' : 'Register New System'}
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              {editingProject ? 'Update connection variables and deployment status' : 'Add a new system to the Ubaka Tech MIS monitoring deck'}
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">System Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. RRA EBM Gateway"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea 
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows="3"
                  placeholder="Describe the function, target customers, or primary modules of this system..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deployment Status</label>
                  <select 
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Repository URL</label>
                <input 
                  type="text" 
                  value={formRepo}
                  onChange={(e) => setFormRepo(e.target.value)}
                  placeholder="https://github.com/Benitgilbert/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Live Endpoint URL</label>
                <input 
                  type="text" 
                  value={formLive}
                  onChange={(e) => setFormLive(e.target.value)}
                  placeholder="https://ebm.ubakatech.co.rw"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {errorMsg && (
                <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
