import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kanban from './pages/Kanban';
import Chat from './pages/Chat';
import ImpressaAdmin from './pages/ImpressaAdmin';
import Delegations from './pages/Delegations';
import HRPortal from './pages/HRPortal';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden select-none">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col items-center z-10">
        {/* Pulsing and Spinning Logo Container */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-6">
          {/* External Glowing Ring */}
          <div className="absolute inset-0 rounded-full border border-purple-500/20 border-t-purple-500/80 animate-spin [animation-duration:1.5s]" />
          
          {/* Inner Glowing Track */}
          <div className="absolute inset-2 rounded-full border border-indigo-500/10 border-b-indigo-500/60 animate-spin [animation-duration:3s] [animation-direction:reverse]" />
          
          {/* Centered Pulsing Logo */}
          <div className="w-14 h-14 bg-slate-900/60 rounded-full p-2.5 flex items-center justify-center shadow-inner shadow-purple-500/10 backdrop-blur-sm animate-pulse">
            <img 
              src="/ubaka_symbol.png" 
              alt="Ubaka Tech Symbol" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
            />
          </div>
        </div>

        {/* Brand Title with Logo */}
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-sm font-extrabold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-200 to-purple-400 uppercase">
            UBAKA TECH
          </h1>
        </div>

        {/* Loading Message */}
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};

const MainLayout = () => {
  const { user, loading, refreshUser } = useAuth();
  const socket = useSocket();
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    if (!socket) return;

    const handleDelegationUpdated = () => {
      refreshUser();
    };

    socket.on('delegation_updated', handleDelegationUpdated);
    return () => {
      socket.off('delegation_updated', handleDelegationUpdated);
    };
  }, [socket, refreshUser]);

  if (loading) {
    return <LoadingScreen message="Syncing Ubaka Tech Portal..." />;
  }

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {user?.activeDelegation && (
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-6 py-2.5 flex items-center justify-between text-xs font-bold border-b border-purple-500/25 shrink-0 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500 text-[9px] font-black uppercase px-2 py-0.5 rounded">Active Coverage</span>
              <span>
                You are temporarily operating as <strong className="text-purple-300">{user.activeDelegation.targetRoleName}</strong> (Authorized by {user.activeDelegation.authorizerName} for: <em>"{user.activeDelegation.reason}"</em>).
              </span>
            </div>
            <div className="text-[10px] text-purple-300 font-extrabold uppercase shrink-0">
              Expires: {new Date(user.activeDelegation.endDate).toLocaleDateString()}
            </div>
          </div>
        )}
        <main className="flex-1 overflow-hidden relative">
          <div className={`h-full ${activePage === 'dashboard' ? '' : 'hidden'}`}>
            <Dashboard />
          </div>
          <div className={`h-full ${activePage === 'tasks' ? '' : 'hidden'}`}>
            <Kanban />
          </div>
          <div className={`h-full ${activePage === 'chat' ? '' : 'hidden'}`}>
            <Chat />
          </div>
          <div className={`h-full ${activePage === 'impressa-admin' ? '' : 'hidden'}`}>
            <ImpressaAdmin />
          </div>
          <div className={`h-full ${activePage === 'delegations' ? '' : 'hidden'}`}>
            <Delegations />
          </div>
          <div className={`h-full ${activePage === 'hr-portal' ? '' : 'hidden'}`}>
            <HRPortal />
          </div>
        </main>
      </div>
    </div>
  );
};

const NavigationWrapper = () => {
  const { user, loading } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // When user status changes (e.g. logouts), force redirect to public showcase
  useEffect(() => {
    if (!user && !loading) {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
        setPath('/');
      }
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingScreen message="Initializing Secure Session..." />;
  }

  // User is authenticated -> Render internal MIS
  if (user) {
    return <MainLayout />;
  }

  // User is NOT authenticated -> Obscured route router
  if (path === '/ubaka-secure-gateway') {
    return (
      <Login 
        onBackToLanding={() => {
          window.history.pushState({}, '', '/');
          setPath('/');
        }}
      />
    );
  }

  // Redirect common routes or random typing back to / (obscurity)
  if (path !== '/') {
    window.history.replaceState({}, '', '/');
    // Queue state sync
    setTimeout(() => setPath('/'), 0);
  }

  // Render the gorgeous, public showcase page
  return (
    <Landing 
      onEnterPortal={() => {
        window.history.pushState({}, '', '/ubaka-secure-gateway');
        setPath('/ubaka-secure-gateway');
      }}
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NavigationWrapper />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

