import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  GitBranch,
  Loader2,
  Globe,
  Briefcase,
  UserCheck,
  TrendingUp
} from 'lucide-react';

const STATUS_CONFIG = {
  active:      { label: 'Active',      cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  testing:     { label: 'Testing',     cls: 'bg-amber-500/10  text-amber-400  border-amber-500/20'  },
  development: { label: 'Dev',         cls: 'bg-blue-500/10   text-blue-400   border-blue-500/20'   },
  planning:    { label: 'Planning',    cls: 'bg-slate-800     text-slate-400  border-slate-700'     },
  archived:    { label: 'Archived',    cls: 'bg-slate-800/50  text-slate-600  border-slate-800'     },
};

const Dashboard = () => {
  const { token, user } = useAuth();
  const isAdmin = user && (user.role === 'sysadmin' || user.role === 'cto');

  // ─── Data ───────────────────────────────────────────────────────────────────
  const [projects,    setProjects]    = useState([]);
  const [hrStats,     setHrStats]     = useState(null);
  const [auditLogs,   setAuditLogs]   = useState([]);
  const [loadingProj, setLoadingProj] = useState(true);
  const [loadingHr,   setLoadingHr]   = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // ─── CRUD State ─────────────────────────────────────────────────────────────
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [editingProject,  setEditingProject]  = useState(null);
  const [formName,        setFormName]        = useState('');
  const [formDesc,        setFormDesc]        = useState('');
  const [formStatus,      setFormStatus]      = useState('planning');
  const [formRepo,        setFormRepo]        = useState('');
  const [formLive,        setFormLive]        = useState('');
  const [errorMsg,        setErrorMsg]        = useState('');
  const [saving,          setSaving]          = useState(false);
  const [confirmDelete,   setConfirmDelete]   = useState(null);
  const [isDeleting,      setIsDeleting]      = useState(false);
  const [toast,           setToast]           = useState(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  // ─── Fetch helpers ───────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    setLoadingProj(true);
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setProjects(await res.json());
    } catch { /* silent */ } finally {
      setLoadingProj(false);
    }
  }, [token]);

  const fetchHrStats = useCallback(async () => {
    setLoadingHr(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hr/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setHrStats(await res.json());
    } catch { /* silent */ } finally {
      setLoadingHr(false);
    }
  }, [token]);

  const fetchAuditLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/audit?limit=12`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAuditLogs(await res.json());
    } catch { /* silent */ } finally {
      setLoadingLogs(false);
    }
  }, [token]);

  const refreshAll = useCallback(() => {
    setLastRefresh(new Date());
    fetchProjects();
    fetchHrStats();
    fetchAuditLogs();
  }, [fetchProjects, fetchHrStats, fetchAuditLogs]);

  useEffect(() => { refreshAll(); }, [token]);

  // ─── Derived stats ───────────────────────────────────────────────────────────
  const activeCount  = projects.filter(p => p.status === 'active').length;
  const pipeCount    = projects.filter(p => ['development','testing'].includes(p.status)).length;
  const totalUsers   = projects.reduce((s, p) => s + (p.metrics?.activeUsers || 0), 0);
  const avgUptime = (() => {
    const vals = projects
      .map(p => parseFloat((p.metrics?.uptime || '').replace('%', '')))
      .filter(v => !isNaN(v));
    return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)+'%' : '—';
  })();

  // ─── CRUD ────────────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingProject(null); setFormName(''); setFormDesc('');
    setFormStatus('planning'); setFormRepo(''); setFormLive('');
    setErrorMsg(''); setIsModalOpen(true);
  };
  const openEditModal = (p) => {
    setEditingProject(p); setFormName(p.name); setFormDesc(p.description || '');
    setFormStatus(p.status); setFormRepo(p.repositoryUrl || '');
    setFormLive(p.liveUrl || ''); setErrorMsg(''); setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) { setErrorMsg('System name is required.'); return; }
    setSaving(true); setErrorMsg('');
    try {
      const url = editingProject
        ? `${API_BASE_URL}/projects/${editingProject.id}`
        : `${API_BASE_URL}/projects`;
      const res = await fetch(url, {
        method: editingProject ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: formName, description: formDesc, status: formStatus, repositoryUrl: formRepo, liveUrl: formLive })
      });
      const data = await res.json();
      if (res.ok) { setIsModalOpen(false); fetchProjects(); showToast('success', editingProject ? 'System updated.' : 'System registered.'); }
      else setErrorMsg(data.error || 'Failed to save.');
    } catch { setErrorMsg('Server connection failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id, name) => setConfirmDelete({ id, name });

  const executeDelete = async () => {
    if (!confirmDelete || isDeleting) return;
    setIsDeleting(true);
    const { id, name } = confirmDelete;
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { setConfirmDelete(null); showToast('success', `"${name}" deleted.`); fetchProjects(); }
      else { const d = await res.json(); showToast('error', d.error || 'Delete failed.'); }
    } catch { showToast('error', 'Server connection failed.'); }
    finally { setIsDeleting(false); }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto scrollbar-thin bg-slate-950">
      <div className="max-w-7xl mx-auto p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Operations Dashboard</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {user?.name} · {user?.role?.toUpperCase()} · Last synced {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={refreshAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Registered Systems', value: loadingProj ? '…' : projects.length, sub: `${activeCount} live · ${pipeCount} in pipeline`, icon: FolderGit2, accent: 'text-purple-400' },
            { label: 'Live Users',          value: loadingProj ? '…' : totalUsers.toLocaleString(), sub: 'Across active systems', icon: Users, accent: 'text-blue-400' },
            { label: 'Avg Uptime',          value: loadingProj ? '…' : avgUptime, sub: 'Operational health avg.', icon: TrendingUp, accent: 'text-emerald-400' },
            { label: 'HR Headcount',        value: loadingHr   ? '…' : (hrStats?.totalEmployees ?? '—'), sub: loadingHr ? '' : `${hrStats?.activeEmployees ?? 0} active`, icon: Briefcase, accent: 'text-amber-400' },
          ].map(({ label, value, sub, icon: Icon, accent }, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                <Icon className={`w-4 h-4 ${accent}`} />
              </div>
              <div className="text-2xl font-black text-white leading-none">{value}</div>
              <div className="text-[10px] text-slate-500 mt-1.5 font-medium">{sub}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Projects Table (2/3 width) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Product Systems Registry</span>
              </div>
              {isAdmin && (
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-[10px] font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Register
                </button>
              )}
            </div>

            {loadingProj ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No systems registered.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800/60 text-[9px] text-slate-500 uppercase font-bold tracking-widest">
                      <th className="px-4 py-2.5">System</th>
                      <th className="px-4 py-2.5">Live URL</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                      <th className="px-4 py-2.5">Uptime</th>
                      <th className="px-4 py-2.5">Latency</th>
                      <th className="px-4 py-2.5">Users</th>
                      {isAdmin && <th className="px-4 py-2.5 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {projects.map(proj => {
                      const sc = STATUS_CONFIG[proj.status] || STATUS_CONFIG.planning;
                      return (
                        <tr key={proj.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-2.5">
                            <div className="font-semibold text-white">{proj.name}</div>
                            <div className="text-[9px] text-slate-600 mt-0.5">{proj.description?.slice(0, 48) || '—'}</div>
                          </td>
                          <td className="px-4 py-2.5">
                            {proj.liveUrl ? (
                              <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-mono text-[10px] truncate max-w-[120px]">
                                <Globe className="w-2.5 h-2.5 shrink-0" />
                                {proj.liveUrl.replace(/https?:\/\//, '')}
                                <ExternalLink className="w-2 h-2 shrink-0" />
                              </a>
                            ) : <span className="text-slate-700">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${sc.cls}`}>
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-300">{proj.metrics?.uptime || '—'}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-300">{proj.metrics?.latency || '—'}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-300">{proj.metrics?.activeUsers ?? '—'}</td>
                          {isAdmin && (
                            <td className="px-4 py-2.5 text-right">
                              <div className="inline-flex gap-1">
                                <button onClick={() => openEditModal(proj)} className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-white transition-colors cursor-pointer" title="Edit">
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDelete(proj.id, proj.name)} className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer" title="Delete">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* HR Snapshot */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">HR Snapshot</span>
              </div>
              {loadingHr ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-blue-400 animate-spin" /></div>
              ) : !hrStats ? (
                <div className="px-4 py-6 text-xs text-slate-600 text-center">No HR data available.</div>
              ) : (
                <div className="divide-y divide-slate-800/50">
                  {[
                    { label: 'Total Employees',    value: hrStats.totalEmployees },
                    { label: 'Active',             value: hrStats.activeEmployees,   accent: 'text-emerald-400' },
                    { label: 'On Leave',           value: hrStats.onLeave ?? '—',    accent: 'text-amber-400' },
                    { label: 'Open Positions',     value: hrStats.openPositions ?? '—', accent: 'text-purple-400' },
                    { label: 'Pending Onboarding', value: hrStats.pendingOnboarding ?? '—' },
                  ].map(({ label, value, accent }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2">
                      <span className="text-[11px] text-slate-500 font-medium">{label}</span>
                      <span className={`text-xs font-black ${accent || 'text-white'}`}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Recent Activity</span>
                </div>
              </div>
              {loadingLogs ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-emerald-400 animate-spin" /></div>
              ) : auditLogs.length === 0 ? (
                <div className="px-4 py-6 text-xs text-slate-600 text-center">No activity recorded yet.</div>
              ) : (
                <div className="divide-y divide-slate-800/40 max-h-[260px] overflow-y-auto scrollbar-thin">
                  {auditLogs.map((log, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-slate-300 font-medium leading-snug truncate">{log.action || log.message || log.event}</p>
                        <p className="text-[9px] text-slate-600 mt-0.5">{log.user || log.actor || 'System'} · {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-white mb-0.5">{editingProject ? 'Edit System' : 'Register System'}</h3>
            <p className="text-slate-500 text-[11px] mb-5">{editingProject ? 'Update deployment metadata' : 'Add a system to the MIS registry'}</p>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">System Name</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Kuri Macye POS" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} rows={2} placeholder="Brief system description..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors">
                    <option value="planning">Planning</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Repository URL</label>
                  <input type="text" value={formRepo} onChange={e => setFormRepo(e.target.value)} placeholder="https://github.com/..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Live Endpoint URL</label>
                <input type="text" value={formLive} onChange={e => setFormLive(e.target.value)} placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors" />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />{errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800/60">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete System?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  <span className="text-slate-200 font-semibold">"{confirmDelete.name}"</span> will be permanently removed from the registry.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button type="button" onClick={() => setConfirmDelete(null)} disabled={isDeleting} className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50">Cancel</button>
              <button type="button" onClick={executeDelete} disabled={isDeleting} className="flex-1 py-2.5 inline-flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-60">
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/90 border-rose-500/30 text-rose-300'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span className="text-xs font-semibold">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-1 p-0.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
