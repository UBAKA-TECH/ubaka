import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

function AuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { mergeCart } = useCart();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const role = searchParams.get("role");

        if (accessToken && refreshToken) {
            localStorage.setItem("authToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("userRole", role);

            // Merge cart and redirect
            mergeCart().then(() => {
                if (role === "admin") navigate("/admin");
                else if (role === "seller") navigate("/seller/dashboard");
                else navigate("/dashboard");
            });
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate, mergeCart]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <h2 className="mt-4 text-xl font-semibold text-gray-700">Logging you in...</h2>
            </div>
        </div>
    );
}

export default AuthSuccess;
