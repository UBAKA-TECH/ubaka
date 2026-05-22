import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, AlertCircle, ShieldAlert, ArrowLeft, Terminal, ShieldCheck } from 'lucide-react';

const Login = ({ onBackToLanding }) => {
  const { login, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localGreeting, setLocalGreeting] = useState('Welcome');

  // Dynamic warm greeting for internal team members
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setLocalGreeting('Mwaramutse, Inzozi Team Member');
    } else if (hours >= 12 && hours < 18) {
      setLocalGreeting('Mwiriwe, Inzozi Team Member');
    } else {
      setLocalGreeting('Mwiriwe, Inzozi Team Member');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  // Humanized team members representing the RBAC roles for quick previewing
  const mockTeamMembers = [
    { 
      name: 'Ganza', 
      title: 'Administrator',
      email: 'admin@inzozi.com', 
      pass: 'admin123', 
      role: 'sysadmin', 
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ganza',
      desc: 'Manages workspace settings, databases, and system access levels.',
      status: '⚡ Active',
      statusColor: 'text-rose-400 bg-rose-950/30 border-rose-900/30'
    },
    { 
      name: 'Benit', 
      title: 'Software Engineer',
      email: 'dev@inzozi.com', 
      pass: 'dev123', 
      role: 'software_engineer', 
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Benit',
      desc: 'Fixes platform bugs, commits code changes, and updates Kanban tasks.',
      status: '💻 Coding',
      statusColor: 'text-blue-400 bg-blue-950/30 border-blue-900/30'
    },
    { 
      name: 'Keza', 
      title: 'HR Manager',
      email: 'manager@inzozi.com', 
      pass: 'manager123', 
      role: 'hr_manager', 
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Keza',
      desc: 'Tracks project schedules, oversees milestones, and schedules coverage.',
      status: '📋 In Meeting',
      statusColor: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30'
    },
    { 
      name: 'Gaju', 
      title: 'Content Controller',
      email: 'content@inzozi.com', 
      pass: 'content123', 
      role: 'content_controller', 
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gaju',
      desc: 'Reviews Impressa vendor applications and approves store products.',
      status: '🔍 Reviewing',
      statusColor: 'text-purple-400 bg-purple-950/30 border-purple-900/30'
    },
    { 
      name: 'Ishimwe', 
      title: 'Customer Support',
      email: 'support@inzozi.com', 
      pass: 'support123', 
      role: 'customer_support', 
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ishimwe',
      desc: 'Resolves shopper payments, tickets, and user storefront issues.',
      status: '☕ Available',
      statusColor: 'text-amber-400 bg-amber-950/30 border-amber-900/30'
    },
    { 
      name: 'Mutoni', 
      title: 'Growth Marketer',
      email: 'marketer@inzozi.com', 
      pass: 'marketer123', 
      role: 'growth_marketer', 
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mutoni',
      desc: 'Monitors active visitor metrics, weekly revenue, and ad campaigns.',
      status: '📈 In Campaign',
      statusColor: 'text-pink-400 bg-pink-950/30 border-pink-900/30'
    }
  ];

  const handleQuickLogin = async (acc) => {
    setLoading(true);
    setEmail(acc.email);
    setPassword(acc.pass);
    await login(acc.email, acc.pass);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 md:p-8 text-slate-100 font-sans relative overflow-hidden">
      
      {/* Background gradients for premium ambient lighting */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Back button link to return to the public landing page */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-200 transition-colors cursor-pointer group bg-slate-900/40 border border-slate-900 hover:border-slate-800/80 px-4 py-2 rounded-xl backdrop-blur-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Return to Showcase Site
        </button>
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-stretch z-10 pt-12 lg:pt-0">
        
        {/* Left Side: Standard Login Form Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="bg-slate-900/40 border border-slate-905 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-850 rounded-xl text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                Internal System Access
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{localGreeting}</h2>
              <p className="text-slate-500 text-xs leading-relaxed">
                Provide your workspace credentials to enter the role-based dashboard.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-3 animate-headShake">
                <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@inzozi.com"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">Security Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/25 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg hover:shadow-purple-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] mt-6"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4.5 h-4.5" />
                    Secure Workspace Log In
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[9px] text-slate-500 leading-normal">
                This endpoint utilizes cryptographic session tracking on an isolated PostgreSQL database cluster.
              </span>
            </div>

          </div>
        </div>

        {/* Right Side: Quick Login Previews / Team Desk */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6">
            
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-200">Interactive Employee Desk</h3>
              <p className="text-slate-500 text-xs">
                Select any verified staff member badge below to automatically test the system with their role-based access configurations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {mockTeamMembers.map((member) => (
                <button
                  key={member.role}
                  type="button"
                  onClick={() => handleQuickLogin(member)}
                  className="p-4 bg-slate-950/30 hover:bg-slate-950/80 border border-slate-900 hover:border-slate-800 rounded-2xl text-left transition-all flex items-start gap-4 active:scale-[0.98] cursor-pointer group hover:shadow-xl hover:shadow-purple-500/5"
                >
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 p-0.5 group-hover:scale-105 transition-transform shrink-0"
                  />
                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{member.name}</span>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase border ${member.statusColor} shrink-0`}>
                        {member.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider leading-none">
                        {member.title}
                      </span>
                      <p className="text-[10px] text-slate-500 group-hover:text-slate-450 leading-relaxed mt-1">
                        {member.desc}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
