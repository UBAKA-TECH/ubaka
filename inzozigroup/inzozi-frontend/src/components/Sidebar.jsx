import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Columns4, 
  MessageSquare, 
  ShoppingBag, 
  LogOut, 
  Settings, 
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Users
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // Determine which navigation options are available based on user permissions
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Global Dashboard', 
      icon: LayoutDashboard,
      permissions: [] 
    },
    { 
      id: 'tasks', 
      label: 'Kanban Tasks Hub', 
      icon: Columns4,
      permissions: ['view_tasks', 'manage_tasks'] 
    },
    { 
      id: 'chat', 
      label: 'Messaging Hub', 
      icon: MessageSquare,
      permissions: [] 
    },
    { 
      id: 'impressa-admin', 
      label: 'Kuri Macye Control', 
      icon: ShoppingBag,
      permissions: [
        'manage_impressa_users',
        'manage_impressa_sellers',
        'manage_impressa_violations',
        'view_impressa_seller_reports',
        'manage_impressa_orders',
        'manage_impressa_inquiries',
        'manage_impressa_products',
        'approve_impressa_products',
        'manage_impressa_shifts',
        'manage_impressa_categories',
        'manage_impressa_attributes',
        'manage_impressa_reviews',
        'manage_impressa_tickets',
        'manage_impressa_customer_queries',
        'manage_impressa_abonnes',
        'manage_impressa_coupons',
        'manage_impressa_gift_cards',
        'manage_impressa_gift_card_products',
        'manage_impressa_flash_sales',
        'manage_impressa_banners',
        'manage_impressa_testimonials',
        'manage_impressa_blogs',
        'manage_impressa_brand_partners',
        'manage_impressa_finance',
        'manage_impressa_commissions',
        'manage_impressa_payouts',
        'manage_impressa_site_settings',
        'manage_impressa_subscribers',
        'manage_impressa_delivery',
        'manage_impressa_taxes',
        'manage_impressa_reports',
        'manage_impressa_settings'
      ] 
    },
    {
      id: 'delegations',
      label: 'Roster & Coverage',
      icon: ShieldCheck,
      permissions: ['manage_delegations_hr', 'manage_delegations_admin']
    },
    {
      id: 'hr-portal',
      label: 'HR & People Ops',
      icon: Users,
      permissions: ['manage_hr', 'submit_requests']
    }
  ];

  // Filter items based on dynamic permissions in JWT
  const userPermissions = user.permissions || [];
  const visibleItems = navItems.filter(item => {
    if (item.permissions.length === 0) return true;
    return item.permissions.some(p => userPermissions.includes(p));
  });

  const roleColors = {
    sysadmin: 'bg-red-500/10 text-red-400 border border-red-500/20',
    hr_manager: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    product_manager: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    ux_designer: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
    lead_engineer: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    software_engineer: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    qa_engineer: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    devops: 'bg-red-500/10 text-red-450 border border-red-500/20',
    security_engineer: 'bg-slate-500/10 text-slate-400 border border-slate-700/20',
    content_controller: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    customer_support: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    growth_marketer: 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen shrink-0 sticky top-0">
      
      {/* Top Section: Brand Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img 
            src="/ubaka_symbol.png" 
            alt="Ubaka Tech Symbol" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-base font-extrabold text-white leading-none tracking-tight">Ubaka Tech</h1>
            <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase">Internal MIS</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Menu Navigation */}
      <div className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-500 px-3 uppercase tracking-wider mb-2">Main Menu</div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-500/20 text-purple-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Logged-in User Profile */}
      <div className="p-4 border-t border-slate-850 space-y-3 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <img 
            src={user.avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
            alt={user.name} 
            className="w-10 h-10 rounded-xl bg-slate-950 p-0.5 border border-slate-800"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-200 truncate leading-none mb-1">{user.name}</h4>
            <span className="text-[10px] text-slate-500 truncate block leading-none mb-1.5">{user.title || 'Ubaka Member'}</span>
            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide leading-none ${roleColors[user.role] || 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1.5">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-1.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 rounded-lg text-slate-400 hover:text-red-400 hover:border-red-500/20 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;

