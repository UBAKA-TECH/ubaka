import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronDown, FaUserShield, FaStore, FaCheck } from "react-icons/fa";

function RoleSwitcher({ user, theme = 'light' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Determine current view based on URL
    const isAdminView = location.pathname.startsWith('/admin');
    const isSellerView = location.pathname.startsWith('/seller');

    // Only show for admin users (who can access both views)
    const canSwitch = user?.role === 'admin';

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!canSwitch) return null;

    const handleSwitch = (view) => {
        setIsOpen(false);
        if (view === 'admin' && !isAdminView) {
            navigate('/admin');
        } else if (view === 'seller' && !isSellerView) {
            navigate('/seller/dashboard');
        }
    };

    return (
        <div className="relative inline-block z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border
                    ${theme === 'dark'
                        ? 'bg-charcoal-700/50 border-charcoal-600/50 text-gray-200 hover:bg-charcoal-700 hover:border-charcoal-500'
                        : 'bg-white border-gray-200 text-charcoal-800 hover:bg-gray-50 hover:shadow-sm'
                    }
                `}
            >
                {isAdminView ? (
                    <>
                        <FaUserShield className="text-terracotta-500 text-lg" />
                        <span className="hidden sm:inline">Admin Panel</span>
                    </>
                ) : (
                    <>
                        <FaStore className="text-sage-500 text-lg" />
                        <span className="hidden sm:inline">My Store</span>
                    </>
                )}
                <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-gray-400`} />
            </button>

            {isOpen && (
                <div className={`
                    absolute top-full right-0 mt-2 w-64 rounded-xl shadow-xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right
                    ${theme === 'dark' ? 'bg-charcoal-800 border-charcoal-700' : 'bg-white border-gray-100'}
                `}>
                    <div className={`
                        px-4 py-2 text-[10px] uppercase font-bold tracking-wider border-b
                        ${theme === 'dark' ? 'bg-charcoal-900/50 text-gray-500 border-charcoal-700' : 'bg-gray-50 text-gray-400 border-gray-100'}
                    `}>
                        Switch View
                    </div>

                    <div className="p-1.5 space-y-0.5">
                        <button
                            onClick={() => handleSwitch('admin')}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left group
                                ${isAdminView
                                    ? (theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600')
                                    : (theme === 'dark' ? 'text-gray-300 hover:bg-charcoal-700' : 'text-charcoal-600 hover:bg-gray-50')
                                }
                            `}
                        >
                            <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center text-sm
                                ${isAdminView
                                    ? (theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600')
                                    : (theme === 'dark' ? 'bg-charcoal-700 text-gray-400 group-hover:bg-charcoal-600 group-hover:text-gray-300' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600')
                                }
                            `}>
                                <FaUserShield />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-sm">Admin Panel</div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Manage platform</div>
                            </div>
                            {isAdminView && <FaCheck className="text-indigo-500 text-sm" />}
                        </button>

                        <button
                            onClick={() => handleSwitch('seller')}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left group
                                ${isSellerView
                                    ? (theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                                    : (theme === 'dark' ? 'text-gray-300 hover:bg-charcoal-700' : 'text-charcoal-600 hover:bg-gray-50')
                                }
                            `}
                        >
                            <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center text-sm
                                ${isSellerView
                                    ? (theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                                    : (theme === 'dark' ? 'bg-charcoal-700 text-gray-400 group-hover:bg-charcoal-600 group-hover:text-gray-300' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600')
                                }
                            `}>
                                <FaStore />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-sm">My Store</div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Products & orders</div>
                            </div>
                            {isSellerView && <FaCheck className="text-emerald-500 text-sm" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoleSwitcher;
