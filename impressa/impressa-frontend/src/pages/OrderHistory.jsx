import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Simple auth check (can be improved with AuthContext)
        const token = localStorage.getItem('authToken');

        if (token) {
            // If logged in, go to dashboard orders tab
            // Since UserDashboard handles ActiveTab internally via state, 
            // we might need to pass a query param or prop if we want to deep link.
            // For now, redirecting to /dashboard is the safest existing path for "My Orders"
            navigate('/dashboard');
        } else {
            // If guest, go to Track Order page (or Login, but user asked for "Guest see history?")
            // Answer: Guests can't see "History", only "Track".
            navigate('/track');
        }
    }, [navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <p>Redirecting...</p>
        </div>
    );
};

export default OrderHistory;
