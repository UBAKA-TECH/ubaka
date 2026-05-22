import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { 
  Users, 
  ShieldAlert, 
  Clock, 
  ArrowRight, 
  Trash2, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  Unlock,
  FileText,
  AlertTriangle,
  UserCheck,
  Zap,
  ShoppingBag
} from 'lucide-react';

const Delegations = () => {
  const { token, user } = useAuth();
  
  // States
  const [employees, setEmployees] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Form State
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  });
  const [reason, setReason] = useState('');

  const userPermissions = user?.permissions || [];
  const isAdmin = userPermissions.includes('manage_delegations_admin');

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch employees list
      const empRes = await fetch(`${API_BASE_URL}/auth/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
      } else {
        throw new Error('Failed to load employee directory');
      }

      // 2. Fetch roles and permissions details
      const rolesRes = await fetch(`${API_BASE_URL}/delegations/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (rolesRes.ok) {
        const { roles: rolesData, permissions: permsData } = await rolesRes.json();
        setRoles(rolesData);
        setPermissions(permsData);
      }

      // 3. Fetch active delegations
      const delRes = await fetch(`${API_BASE_URL}/delegations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (delRes.ok) {
        const delData = await delRes.json();
        setDelegations(delData);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Server error loading directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleSubmitDelegation = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedEmp || !selectedRole || !startDate || !endDate) {
      setErrorMsg('Please fill in all delegation parameters.');
      return;
    }

    // Client-side block for HR delegating technical role
    const targetRoleData = roles.find(r => r.code === selectedRole);
    if (targetRoleData?.isTechnical && !isAdmin) {
      setErrorMsg(`Security Constraint: Only System Administrators can delegate technical roles (like ${targetRoleData.name}).`);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/delegations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId: selectedEmp,
          targetRoleCode: selectedRole,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          reason
        })
      });

      const resData = await response.json();

      if (response.ok) {
        setSuccessMsg(resData.message || 'Delegation coverage active!');
        setSelectedEmp('');
        setSelectedRole('');
        setReason('');
        // Refresh
        fetchData();
        // Clear message
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(resData.error || 'Failed to authorize coverage');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to dispatch delegation payload.');
    }
  };

  const handleRevoke = async (id) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await fetch(`${API_BASE_URL}/delegations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccessMsg('Coverage privilege revoked immediately.');
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        const errData = await response.json();
        setErrorMsg(errData.error || 'Failed to revoke privilege');
      }
    } catch (err) {
      setErrorMsg('Network failure during revocation.');
    }
  };

  // Helper to check if a specific employee has an active delegation
  const getActiveDelegationForEmployee = (empId) => {
    return delegations.find(d => d.employeeId === empId && d.isActive);
  };

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col min-h-0 overflow-hidden">
      
      {/* Page Header */}
      <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-950/20 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-400" />
            Roster & Coverage Hub
          </h1>
          <p className="text-slate-400 text-xs mt-1">Manage employee rosters, dynamic roles, and temporary privilege coverage for sick leaves or vacations</p>
        </div>
        
        <div className="flex gap-2">
          {isAdmin ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 rounded-xl">
              <Lock className="w-3.5 h-3.5" />
              SysAdmin Mode
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 rounded-xl">
              <Unlock className="w-3.5 h-3.5" />
              HR Operations Mode
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2 shrink-0 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2 shrink-0 animate-fade-in">
          <AlertTriangle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 grid lg:grid-cols-12 gap-8 min-h-0 overflow-hidden pb-4">
          
          {/* Left Column: Staff Directory */}
          <div className="lg:col-span-7 flex flex-col min-h-0 overflow-hidden space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 shrink-0">
              <FileText className="w-4.5 h-4.5 text-purple-400" />
              INZOZI Group Staff Roster
            </h3>
            
            <div className="flex-1 overflow-y-auto bg-slate-950/40 border border-slate-850 rounded-2xl p-4 scrollbar-thin">
              <div className="space-y-4">
                {employees.map((emp) => {
                  const activeDel = getActiveDelegationForEmployee(emp.id);
                  return (
                    <div key={emp.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full border border-slate-800 bg-slate-900" />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-200">{emp.name}</h4>
                            <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-semibold">{emp.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{emp.email}</p>
                          
                          {/* Active Delegation Tag */}
                          {activeDel && (
                            <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[9px] font-bold text-purple-400 rounded-md">
                              <Zap className="w-2.5 h-2.5" />
                              Acting: {activeDel.targetRoleName} (Covering)
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Primary Role Badge */}
                      <div className="text-right shrink-0">
                        <span className="inline-block px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-lg">
                          {emp.roleName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Delegation Creator & Timelines */}
          <div className="lg:col-span-5 flex flex-col min-h-0 overflow-hidden space-y-6">
            
            {/* Create Delegation Form */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl shrink-0 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <UserCheck className="w-4.5 h-4.5 text-purple-400" />
                Assign Temporary Coverage
              </h3>
              
              <form onSubmit={handleSubmitDelegation} className="space-y-3">
                {/* Employee select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Cover Worker</label>
                  <select 
                    value={selectedEmp}
                    onChange={(e) => setSelectedEmp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="">-- Choose employee --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.roleName})</option>
                    ))}
                  </select>
                </div>

                {/* Target Role select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Delegate Role & Dashboards</label>
                  <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="">-- Choose target role --</option>
                    {roles.map(r => (
                      <option 
                        key={r.code} 
                        value={r.code}
                        disabled={r.isTechnical && !isAdmin}
                      >
                        {r.name} {r.isTechnical ? '🔒 (Admin Only)' : '👥 (HR Delegatable)'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Coverage Reason</label>
                  <input 
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Gaju sick leave, moderating storefront queue"
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-500/20 text-xs font-bold text-white rounded-lg transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <Plus className="w-4 h-4" />
                  Deploy Coverage Authorization
                </button>
              </form>
            </div>

            {/* Active Delegations Log */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 shrink-0">
                <Clock className="w-4.5 h-4.5 text-purple-400" />
                Active & Scheduled Coverages
              </h3>

              <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {delegations.filter(d => d.isActive).length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                    <span className="text-[10px] text-slate-500">No active coverage delegations found.</span>
                  </div>
                ) : (
                  delegations.filter(d => d.isActive).map((del) => {
                    const expiryDate = new Date(del.endDate);
                    const formattedEnd = expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    return (
                      <div key={del.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-2 hover:border-slate-800 transition-colors">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-[11px] font-bold text-slate-200">
                              {del.employeeName}
                            </h4>
                            <p className="text-[9px] text-purple-400 font-extrabold uppercase mt-0.5">
                              Granted: {del.targetRoleName}
                            </p>
                          </div>
                          
                          <button
                            onClick={() => handleRevoke(del.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Revoke coverage instantly"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[10px] text-slate-500 italic bg-slate-900/40 p-2 rounded-lg border border-slate-900">
                          "{del.reason}"
                        </p>

                        <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                          <span>Expires: {formattedEnd}</span>
                          <span>Authorized By: {del.authorizerName}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Task Routing Diagram Widget */}
            <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 shrink-0 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                Live Impressa Approval Routing
              </h4>
              
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[10px]">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-slate-500 font-semibold">Impressa Catalog</span>
                  <span className="text-white font-bold">12 Pending items</span>
                </div>
                
                <ArrowRight className="w-4 h-4 text-purple-500 animate-pulse" />

                <div className="flex flex-col items-center space-y-0.5">
                  <span className="text-slate-500 font-semibold">Moderator</span>
                  {delegations.some(d => d.targetRoleCode === 'content_controller' && d.isActive) ? (
                    <span className="text-emerald-400 font-bold bg-emerald-400/5 px-2 py-0.5 border border-emerald-400/20 rounded">
                      Routed to Cover {`(${delegations.find(d => d.targetRoleCode === 'content_controller' && d.isActive)?.employeeName.split(' ')[0]})`}
                    </span>
                  ) : (
                    <span className="text-purple-400 font-bold bg-purple-400/5 px-2 py-0.5 border border-purple-400/20 rounded">
                      Gaju (E-commerce Admin)
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Delegations;
