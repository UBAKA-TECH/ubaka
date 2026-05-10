import { FaBell, FaCheck, FaBox, FaDollarSign, FaStar, FaTicketAlt, FaUser, FaBars, FaMoon, FaSun } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/axiosInstance";
import RoleSwitcher from "./RoleSwitcher";

function Topbar({ onMenuClick, title }) {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    api.get("/auth/me").then(res => setUser(res.data)).catch(err => console.error(err));
    fetchNotifications();

    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications?limit=10");
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    const baseClass = "text-sm";
    if (type?.includes('order')) return <FaBox className={`${baseClass} text-terracotta-500`} />;
    if (type?.includes('payment') || type?.includes('payout')) return <FaDollarSign className={`${baseClass} text-sage-500`} />;
    if (type?.includes('review')) return <FaStar className={`${baseClass} text-sand-500`} />;
    if (type?.includes('ticket')) return <FaTicketAlt className={`${baseClass} text-blue-500`} />;
    return <FaUser className={`${baseClass} text-charcoal-400`} />;
  };

  const getIconBg = (type) => {
    if (type?.includes('order')) return 'bg-terracotta-100 dark:bg-terracotta-900/20';
    if (type?.includes('payment') || type?.includes('payout')) return 'bg-sage-100 dark:bg-sage-900/20';
    if (type?.includes('review')) return 'bg-sand-100 dark:bg-sand-900/20';
    if (type?.includes('ticket')) return 'bg-blue-100 dark:bg-blue-900/20';
    return 'bg-charcoal-100 dark:bg-charcoal-800';
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 bg-white/80 dark:bg-charcoal-800/90 backdrop-blur-xl border-b border-cream-200 dark:border-charcoal-700 sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6 transition-colors duration-300">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl text-charcoal-600 dark:text-charcoal-300 hover:bg-cream-100 dark:hover:bg-charcoal-700 hover:text-terracotta-500 transition-all"
        >
          <FaBars className="text-lg" />
        </button>

        {/* Page Title */}
        {title && (
          <h1 className="text-lg lg:text-xl font-bold text-charcoal-800 dark:text-white truncate">
            {title}
          </h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-charcoal-500 dark:text-charcoal-400 hover:bg-cream-100 dark:hover:bg-charcoal-700 hover:text-terracotta-500 dark:hover:text-sand-400 transition-all"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <FaMoon className="text-lg" />
          ) : (
            <FaSun className="text-lg text-sand-400" />
          )}
        </button>

        {/* Role Switcher */}
        <RoleSwitcher user={user} />

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2.5 rounded-xl text-charcoal-500 dark:text-charcoal-400 hover:bg-cream-100 dark:hover:bg-charcoal-700 hover:text-terracotta-500 transition-all"
          >
            <FaBell className="text-lg" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl border border-cream-200 dark:border-charcoal-700 overflow-hidden z-50 animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200 dark:border-charcoal-700 bg-cream-50 dark:bg-charcoal-900">
                <h4 className="font-bold text-charcoal-800 dark:text-white">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-terracotta-500 hover:bg-terracotta-50 dark:hover:bg-terracotta-900/20 rounded-lg transition-colors"
                  >
                    <FaCheck className="text-[10px]" /> Mark all
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <FaBell className="text-4xl text-charcoal-300 dark:text-charcoal-600 mx-auto mb-3" />
                    <p className="font-medium text-charcoal-600 dark:text-charcoal-400">No notifications</p>
                    <p className="text-sm text-charcoal-400 dark:text-charcoal-500">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      className={`
                        flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                        hover:bg-cream-50 dark:hover:bg-charcoal-700/50
                        ${!n.isRead ? 'bg-terracotta-50/50 dark:bg-terracotta-900/10' : ''}
                      `}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBg(n.type)}`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-charcoal-800 dark:text-white truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-charcoal-500 dark:text-charcoal-400 line-clamp-2 mt-0.5">
                          {n.message?.substring(0, 60)}...
                        </p>
                        <span className="text-[10px] text-charcoal-400 dark:text-charcoal-500 mt-1 block">
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-cream-200 dark:border-charcoal-700 bg-cream-50 dark:bg-charcoal-900">
                <Link
                  to={user?.role === 'seller' ? "/seller/notifications" : "/admin/notifications"}
                  className="text-sm font-medium text-terracotta-500 hover:text-terracotta-600 dark:text-terracotta-400 transition-colors"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 ml-1 border-l border-cream-200 dark:border-charcoal-700">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-charcoal-800 dark:text-white">
              {user?.name || 'Admin'}
            </p>
            <p className="text-xs font-medium text-terracotta-500">
              {user?.role?.toUpperCase() || 'ADMIN'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-terracotta-400 to-sand-400 flex items-center justify-center text-white font-semibold shadow-md">
            {user?.profileImage ? (
              <img
                src={`${process.env.REACT_APP_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000'}${user.profileImage}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user?.name?.charAt(0).toUpperCase() || 'A'}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
