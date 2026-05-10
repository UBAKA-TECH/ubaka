import { useParams, Link } from "react-router-dom";
import { LuCircleCheck, LuTruck, LuShoppingBag } from "react-icons/lu";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
export default function OrderSuccess() {
    const { id } = useParams();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
            <Header />
            <main className="py-20 px-4">
                <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-slate-800 text-center">

                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LuCircleCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Thank you for shopping with us. Your order has been placed successfully and is being processed.
                    </p>

                    <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-gray-100 dark:border-slate-700">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Order ID (Tracking Code)</p>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-2xl font-black text-violet-600 dark:text-violet-400 font-mono tracking-wider">
                                {id}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Server is processing the email. Check your inbox for the confirmation!
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link
                            to="/track"
                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <LuTruck className="w-5 h-5" /> Track Order Status
                        </Link>
                        <Link
                            to="/shop"
                            className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <LuShoppingBag className="w-5 h-5" /> Continue Shopping
                        </Link>
                    </div>

                </div>
            </main>
            <LandingFooter />
        </div>
    );
}
