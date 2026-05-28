import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300 font-sans">
                <div className="flex flex-col items-center gap-5">
                    <div className="relative flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full border-4 border-violet-500/20 dark:border-violet-450/10"></div>
                        <div className="absolute w-14 h-14 rounded-full border-4 border-t-violet-600 dark:border-t-violet-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                        <div className="absolute w-5 h-5 rounded-full bg-violet-600/20 dark:bg-violet-400/20 animate-pulse"></div>
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-xs font-black text-gray-900 dark:text-white tracking-widest uppercase">
                            Kuri Macye
                        </h3>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest animate-pulse">
                            Verifying Auth...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If roles are specified, check if user has permission
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Redirect logic based on role
        if (user?.role === 'admin' || user?.role === 'owner') return <Navigate to="/" replace />;
        if (user?.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
        return <Navigate to="/" replace />; // Default for user
    }

    return children;
};

export default ProtectedRoute;
