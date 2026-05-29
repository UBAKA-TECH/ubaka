import { useState, useEffect } from "react";
import { FaStar, FaReply, FaCheckCircle, FaExclamationCircle, FaUser, FaBox } from "react-icons/fa";
import api from "../utils/axiosInstance";
import { useToast } from "../context/ToastContext";

const SellerReviews = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submittingReply, setSubmittingReply] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, averageRating: 0 });
    const [replyTexts, setReplyTexts] = useState({}); // Mapped by review.id

    const fetchReviews = async () => {
        try {
            const res = await api.get("/seller/reviews");
            if (res.data.success) {
                setReviews(res.data.data);
                setStats(res.data.stats || { total: 0, pending: 0, approved: 0, rejected: 0, averageRating: 0 });
            }
        } catch (err) {
            addToast("Failed to fetch reviews", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [addToast]);

    const handleSendReply = async (e, reviewId) => {
        e.preventDefault();
        const text = replyTexts[reviewId];
        if (!text || !text.trim()) return;

        setSubmittingReply(reviewId);
        try {
            const res = await api.post(`/seller/reviews/${reviewId}/reply`, { text });
            if (res.data.success) {
                addToast("Reply submitted successfully!", "success");
                setReplyTexts(prev => ({ ...prev, [reviewId]: "" }));
                fetchReviews(); // Refresh stream
            }
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to submit reply", "error");
        } finally {
            setSubmittingReply(null);
        }
    };

    const handleReplyTextChange = (reviewId, text) => {
        setReplyTexts(prev => ({ ...prev, [reviewId]: text }));
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1 text-sand-400">
                {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < rating ? 'fill-sand-400 text-sand-400' : 'text-gray-300 dark:text-gray-600'} />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <main className="flex-1 p-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Loading reviews...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-sand-50 dark:bg-sand-900/20 text-sand-500 dark:text-sand-400 rounded-xl">
                        <FaStar size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white font-outfit">Product Reviews</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Read customer feedback and reply directly to ratings on your products</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Average Rating */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Average Rating</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-black text-gray-800 dark:text-white">{stats.averageRating || 0}</h3>
                            <span className="text-gray-400 text-sm">/ 5.0</span>
                        </div>
                        <div className="mt-2">{renderStars(Math.round(stats.averageRating || 0))}</div>
                    </div>

                    {/* Total Reviews */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Reviews</p>
                        <h3 className="text-3xl font-black text-gray-800 dark:text-white">{stats.total}</h3>
                        <p className="text-xs text-gray-400 mt-2">All reviews posted on your shop</p>
                    </div>

                    {/* Approved Reviews */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Approved</p>
                        <div className="flex items-center gap-2">
                            <h3 className="text-3xl font-black text-green-600">{stats.approved}</h3>
                            <FaCheckCircle className="text-green-500 text-lg" />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Visible on public product pages</p>
                    </div>

                    {/* Pending Moderation */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Approval</p>
                        <div className="flex items-center gap-2">
                            <h3 className="text-3xl font-black text-yellow-600">{stats.pending}</h3>
                            <FaExclamationCircle className="text-yellow-500 text-lg animate-pulse" />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Awaiting review approval from admin</p>
                    </div>
                </div>

                {/* Reviews List Stream */}
                <div className="space-y-6">
                    {reviews.map(r => (
                        <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-6 shadow-sm transition-colors flex flex-col md:flex-row gap-6">
                            {/* Product Column */}
                            <div className="md:w-48 flex-shrink-0 flex items-center md:items-start md:flex-col gap-3">
                                <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-650 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    {r.product?.image ? (
                                        <img src={r.product.image} alt={r.product.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <FaBox className="text-gray-400 text-xl" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm text-gray-800 dark:text-white line-clamp-2 md:mt-2">{r.product?.name || "Deleted Product"}</h4>
                                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        r.status === 'approved' 
                                            ? 'bg-green-50 dark:bg-green-950/20 text-green-600'
                                            : r.status === 'rejected'
                                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600'
                                            : 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600'
                                    }`}>
                                        {r.status || 'Pending'}
                                    </span>
                                </div>
                            </div>

                            {/* Feed Detail Column */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3 gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center font-bold text-sm">
                                                <FaUser size={12} />
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-800 dark:text-white text-sm">{r.user?.name || "Customer"}</span>
                                                <span className="text-gray-400 text-xs ml-2 font-mono">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {renderStars(r.rating)}
                                    </div>
                                    <p className="text-gray-650 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line italic">
                                        "{r.comment || "No comment left."}"
                                    </p>
                                </div>

                                {/* Reply Section */}
                                <div className="mt-6 border-t border-gray-100 dark:border-gray-700/60 pt-4">
                                    {r.reply ? (
                                        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-750">
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <FaReply className="text-indigo-500 text-xs -scale-x-100" />
                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{r.reply.authorName || "Store Owner"}</span>
                                                <span className="text-[10px] text-gray-400 font-mono ml-2">{new Date(r.reply.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{r.reply.text}</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={(e) => handleSendReply(e, r.id)} className="flex items-end gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Type a response to this customer..."
                                                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white outline-none focus:border-indigo-500 transition-colors shadow-inner"
                                                    value={replyTexts[r.id] || ""}
                                                    onChange={e => handleReplyTextChange(r.id, e.target.value)}
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={submittingReply === r.id || !(replyTexts[r.id] || "").trim()}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <FaReply className="-scale-x-100" /> {submittingReply === r.id ? "Sending..." : "Reply"}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 p-12 text-center text-gray-500 font-medium">
                            No product reviews found on your store yet.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default SellerReviews;
