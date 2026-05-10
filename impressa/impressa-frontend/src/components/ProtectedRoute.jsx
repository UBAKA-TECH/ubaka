import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="loading-container">Loading...</div>; // Or a proper spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If roles are specified, check if user has permission
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Redirect logic based on role
        if (user?.role === 'admin' || user?.role === 'owner') return <Navigate to="/admin/overview" replace />;
        if (user?.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
        return <Navigate to="/" replace />; // Default for user
    }

    return children;
};

export default ProtectedRoute;
