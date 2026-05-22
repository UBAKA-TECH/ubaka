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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 font-sans relative overflow-hidden">
      
      {/* Background gradients for premium ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

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

      <div className="w-full max-w-md z-10">
        
        {/* Brand Logo and Title */}
        <div className="flex flex-col items-center mb-8 space-y-4">
          <div className="w-20 h-20 bg-slate-900/60 rounded-3xl p-3.5 flex items-center justify-center border border-slate-850 shadow-xl shadow-purple-500/5 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src="/inzozi_group_logo.png" 
              alt="INZOZI Group Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(168,85,247,0.3)] animate-pulse" 
            />
          </div>
          <div className="flex items-center gap-2">
            <img 
              src="/inzozi_group_logo.png" 
              alt="INZOZI Symbol" 
              className="w-4 h-4 object-contain opacity-80"
            />
            <h1 className="text-sm font-extrabold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-200 to-purple-400 uppercase">
              INZOZI GROUP
            </h1>
          </div>
        </div>

        {/* Standard Login Form Card */}
        <div className="bg-slate-900/40 border border-slate-900 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-850 rounded-xl text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              Internal System Access
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">{localGreeting}</h2>
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
    </div>
  );
};

export default Login;
