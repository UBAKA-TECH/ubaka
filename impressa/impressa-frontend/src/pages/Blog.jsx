import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaCalendarAlt, FaSearch } from "react-icons/fa";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import api from "../utils/axiosInstance";
import assetUrl from "../utils/assetUrl";
import toast from "react-hot-toast";

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const categories = ["All", "Seller Guides", "E-commerce Trends", "Platform Updates", "Success Stories", "Marketing 101", "Customer Tips"];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await api.get("/blogs");
        setBlogPosts(data);
      } catch (err) {
        setError("Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleSubscribe = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubscribing(true);
    try {
      await api.post("/newsletter/subscribe", { email });
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to subscribe. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const filteredPosts = blogPosts.filter(post => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (post.title?.toLowerCase() || "").includes(searchLower) ||
      (post.excerpt?.toLowerCase() || "").includes(searchLower) ||
      (post.author?.toLowerCase() || "").includes(searchLower);

    const matchesCategory = selectedCategory === "All" ||
      (post.category?.toLowerCase().trim() === selectedCategory.toLowerCase().trim());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-charcoal-900 transition-colors duration-300">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-10 md:py-12 bg-white dark:bg-charcoal-800 border-b border-cream-200 dark:border-charcoal-700 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-terracotta-200 dark:bg-terracotta-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-sand-200 dark:bg-sand-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-charcoal-800 dark:text-white mb-3">Kuri Macye <span className="text-terracotta-500 dark:text-terracotta-400">Blog</span></h1>
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400 max-w-xl mx-auto leading-relaxed">
              Insights, tips, and inspiration for your printing projects and creative vision.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Content Column */}
            <div className="lg:col-span-8">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-white dark:bg-charcoal-800 rounded-2xl p-5 border border-cream-200 dark:border-charcoal-700">
                      <div className="w-full h-40 bg-cream-200 dark:bg-charcoal-700 rounded-xl mb-4"></div>
                      <div className="h-3 bg-cream-200 dark:bg-charcoal-700 rounded w-1/4 mb-3"></div>
                      <div className="h-5 bg-cream-200 dark:bg-charcoal-700 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-cream-200 dark:bg-charcoal-700 rounded w-full mb-2"></div>
                      <div className="h-3 bg-cream-200 dark:bg-charcoal-700 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-8 bg-terracotta-50 dark:bg-terracotta-900/10 border border-terracotta-500/20 rounded-2xl text-center">
                  <p className="text-sm font-bold text-terracotta-600 dark:text-terracotta-400">{error}</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-12 bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-dashed border-cream-300 dark:border-charcoal-700 text-center text-charcoal-400 font-bold text-sm">
                  No blog posts found matching your criteria.
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <article key={post.id} className="group bg-white dark:bg-charcoal-800 rounded-2xl shadow-sm hover:shadow-xl border border-cream-200 dark:border-charcoal-700 transition-all duration-500 overflow-hidden transform hover:-translate-y-1">
                      {post.image && (
                        <div className="aspect-[21/9] overflow-hidden">
                          <img
                            src={assetUrl(post.image)}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <div className="p-5 md:p-6">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-widest mb-3">
                          <div className="flex items-center gap-1.5">
                            <FaUser className="text-terracotta-500 dark:text-terracotta-400 text-[10px]" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FaCalendarAlt className="text-terracotta-500 dark:text-terracotta-400 text-[10px]" />
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <button
                            onClick={() => setSelectedCategory(post.category)}
                            className="px-3 py-1 bg-terracotta-50 dark:bg-terracotta-900/10 text-terracotta-500 dark:text-terracotta-400 rounded-full hover:bg-terracotta-500 hover:text-white transition-all text-[10px]"
                          >
                            {post.category}
                          </button>
                        </div>
                        <h2 className="text-lg md:text-xl font-black text-charcoal-800 dark:text-white mb-3 leading-tight group-hover:text-terracotta-500 dark:group-hover:text-terracotta-400 transition-colors">
                          <Link to={`/blog/${post.id}`}>{post.title}</Link>
                        </h2>
                        <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mb-4 leading-relaxed line-clamp-2">{post.excerpt}</p>
                        <Link
                          to={`/blog/${post.id}`}
                          className="inline-flex items-center gap-1.5 text-terracotta-500 dark:text-terracotta-400 font-black text-sm group/link"
                        >
                          Read More <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Search */}
              <div className="bg-white dark:bg-charcoal-800 p-5 rounded-2xl shadow-sm border border-cream-200 dark:border-charcoal-700">
                <h3 className="text-base font-black text-charcoal-800 dark:text-white mb-4">Search</h3>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search blogs..."
                    className="w-full bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl py-2.5 pl-4 pr-10 text-sm text-charcoal-800 dark:text-white outline-none transition-all shadow-inner"
                  />
                  <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 text-sm" />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white dark:bg-charcoal-800 p-5 rounded-2xl shadow-sm border border-cream-200 dark:border-charcoal-700">
                <h3 className="text-base font-black text-charcoal-800 dark:text-white mb-3">Categories</h3>
                <ul className="space-y-1.5">
                  {categories.map((category) => (
                    <li key={category}>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full flex items-center justify-between group p-2.5 rounded-xl transition-all border text-sm ${selectedCategory === category
                          ? "bg-terracotta-500 text-white border-terracotta-500"
                          : "hover:bg-cream-100 dark:hover:bg-charcoal-700 border-transparent hover:border-cream-200 dark:hover:border-charcoal-600"
                          }`}
                      >
                        <span className={`font-bold ${selectedCategory === category
                          ? "text-white"
                          : "text-charcoal-600 dark:text-charcoal-400 group-hover:text-terracotta-500 dark:group-hover:text-terracotta-400"
                          }`}>{category}</span>
                        {selectedCategory === category && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div className="bg-terracotta-500 p-6 rounded-2xl text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 transform group-hover:scale-150 transition-transform duration-1000"></div>
                <h3 className="text-base font-black mb-2">Never Miss a Post</h3>
                <p className="text-terracotta-100 mb-4 font-medium text-sm">Get the latest printing tips and design inspiration delivered to your inbox.</p>
                <div className="space-y-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-white/20 border border-white/30 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-terracotta-200 outline-none focus:bg-white/30 transition-all font-bold"
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="w-full bg-white text-terracotta-500 py-2.5 rounded-xl font-black text-sm hover:bg-cream-100 transition-all active:scale-95 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {subscribing ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
