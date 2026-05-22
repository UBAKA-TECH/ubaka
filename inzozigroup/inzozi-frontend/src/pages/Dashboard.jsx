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
  ExternalLink
} from 'lucide-react';

const Dashboard = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase"><CheckCircle2 className="w-3 h-3" /> Healthy</span>;
      case 'warning':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase"><AlertTriangle className="w-3 h-3" /> Warning</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><XCircle className="w-3 h-3" /> Inactive</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-950/20 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Operational view of INZOZI Group's digital product portfolio</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 text-xs font-semibold">
          <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
          Live Monitoring Connected
        </div>
      </div>

      {/* Aggregate Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: '4', sub: 'Impressa, Linker, Homland, Gesture', icon: FolderGit2, color: 'text-purple-400' },
          { label: 'System Health', value: '99.4%', sub: 'Global Uptime Average', icon: Activity, color: 'text-emerald-400' },
          { label: 'Active Users', value: '1,512', sub: 'Across live services', icon: Users, color: 'text-blue-400' },
          { label: 'Run Mode', value: 'MIS Portal', sub: 'Control Plane Connected', icon: CheckCircle2, color: 'text-purple-400' }
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

      {/* Projects Grid Container */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Product Portfolio</h3>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-colors">
                
                {/* Product Header */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
                        {proj.name}
                        {getStatusIcon(proj.status)}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mt-0.5">/inzozigroup/{proj.slug}</span>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                      proj.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      proj.status === 'testing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      proj.status === 'development' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  
                  <p className="text-slate-400 text-xs leading-relaxed min-h-12">
                    {proj.description}
                  </p>

                  {/* Repository Links */}
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    {proj.repositoryUrl && (
                      <a 
                        href={proj.repositoryUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                          <path d="M9 18c-4.51 2-5-2-7-2" />
                        </svg>
                        Repository
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a 
                        href={proj.liveUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-[10px] font-semibold text-purple-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Environment
                      </a>
                    )}
                  </div>
                </div>

                {/* Operations Metrics Bar */}
                <div className="bg-slate-950 p-4 border-t border-slate-850 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Uptime</span>
                    <span className="text-xs font-bold text-slate-300">{proj.metrics?.uptime || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Active Users</span>
                    <span className="text-xs font-bold text-slate-300">{proj.metrics?.activeUsers || 0}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Health Check</span>
                    <span className="block">{getHealthBadge(proj.metrics?.apiHealth)}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
