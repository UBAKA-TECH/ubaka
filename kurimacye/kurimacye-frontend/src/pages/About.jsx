import { useEffect, useState } from "react";
import Header from "../components/Header";
import LandingFooter from "../components/LandingFooter";
import { Link } from "react-router-dom";
import { FaBullseye, FaLightbulb, FaHandshake, FaArrowRight } from "react-icons/fa";
// Note: Blobs animation keyframes are assumed to be globally available or we rely on the ones now in Shop/Home.css? 
// Ideally global.css should have them if reused, but for now assuming they are present or we add them to About.css if missing props. 
// Added blobs to specific css files so we are safe.

export default function About() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/auth/team`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setTeamMembers(data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return '/images/default-avatar.png'; // Fallback image
    if (path.startsWith('http')) return path;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace(/\/api$/, '');
    if (path.startsWith('/uploads/')) return `${baseUrl}${path}`;
    return process.env.PUBLIC_URL + path;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <Header />

      <main>
        <section className="relative py-20 md:py-32 overflow-hidden bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-20 right-20 w-72 h-72 bg-amber-200 dark:bg-amber-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-200 dark:bg-blue-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
              About <span className="text-violet-600 dark:text-violet-400">Kuri Macye</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              We're a team of passionate creators, designers, and printers dedicated to bringing your vision to life with exceptional quality and service.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-32 bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-block px-4 py-2 bg-violet-50 dark:bg-violet-900/10 rounded-full text-violet-600 dark:text-violet-400 font-bold tracking-widest uppercase text-sm">
                  Our Journey
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">Our Story</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Kuri Macye was born from a simple idea: to make high-quality custom printing accessible and easy for everyone. What started in a small workshop has grown into a leading online platform, serving thousands of happy customers across Rwanda.
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  We believe that a great design deserves a great print. That's why we've invested in the latest printing technology and a team of experts who are as passionate about quality as you are about your projects.
                </p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-violet-600/20 dark:bg-violet-400/10 rounded-3xl blur-2xl group-hover:bg-violet-600/30 transition-all duration-500"></div>
                <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <img src={process.env.PUBLIC_URL + '/images/about-us-story.jpg'} alt="Kuri Macye Workshop" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 bg-gray-50 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <div className="inline-block px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-full text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase text-sm mb-6">
              Core Principles
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-16">Our Mission & Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 transform hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-amber-500 group-hover:scale-110 transition-transform">
                  <FaLightbulb className="text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Innovation</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">We constantly explore new techniques and materials to offer the best printing solutions.</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 transform hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-emerald-500 group-hover:scale-110 transition-transform">
                  <FaBullseye className="text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quality</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">From the simplest card to the largest banner, we guarantee excellence in every print.</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-slate-800 transform hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-blue-500 group-hover:scale-110 transition-transform">
                  <FaHandshake className="text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Partnership</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">We work with you as a partner to ensure your vision is perfectly realized.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32 bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-violet-50 dark:bg-violet-900/10 rounded-full text-violet-600 dark:text-violet-400 font-bold tracking-widest uppercase text-sm mb-6">
                Creative Minds
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-500 dark:text-gray-400">The people behind the prints.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {loading ? (
                <div className="col-span-full py-20 text-center">
                  <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 font-bold">Loading team members...</p>
                </div>
              ) : teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div key={member.id || member.name} className="text-center group">
                    <div className="relative mb-6 mx-auto w-48 h-48">
                      <div className="absolute inset-0 bg-violet-600 rounded-full scale-0 group-hover:scale-105 transition-transform duration-500 opacity-20"></div>
                      <img
                        className="w-full h-full rounded-full object-cover shadow-2xl relative z-10 border-4 border-white dark:border-slate-800 transition-transform duration-500 group-hover:scale-95"
                        src={getImageUrl(member.profileImage)}
                        alt={member.name}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + member.name + "&background=random" }}
                      />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{member.name}</h3>
                    <p className="text-violet-600 dark:text-violet-400 font-bold uppercase tracking-widest text-sm">{member.title || member.role}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                  <p className="text-gray-400 font-medium">No team members found.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-24 bg-violet-600 dark:bg-violet-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-5 rounded-full -translate-x-1/2 translate-y-1/2"></div>
          <div className="mx-auto max-w-4xl px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">Ready to Create?</h2>
            <p className="text-xl text-violet-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of businesses and individuals who trust Kuri Macye for their printing needs. We're here to make your vision a reality.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-4 bg-white text-violet-600 px-12 py-5 rounded-2xl font-black text-xl transition-all hover:bg-gray-100 hover:scale-105 shadow-2xl"
            >
              Explore Products <FaArrowRight />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
